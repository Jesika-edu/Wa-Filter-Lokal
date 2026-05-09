const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// =================================================================
// CLEANUP: Hapus lock file Chromium agar tidak error saat restart
// =================================================================
const sessionPath = path.join(__dirname, '.wwebjs_auth', 'session');
if (fs.existsSync(sessionPath)) {
    try {
        const files = fs.readdirSync(sessionPath);
        files.forEach(file => {
            if (file.includes('Singleton')) {
                const filePath = path.join(sessionPath, file);
                try {
                    // Gunakan lstatSync + unlinkSync untuk menghapus symlink/file lock
                    fs.unlinkSync(filePath);
                    console.log(`[System] Berhasil menghapus lock file: ${file}`);
                } catch (err) {
                    // Abaikan jika gagal
                }
            }
        });
    } catch (err) {
        console.error('[System] Gagal membaca direktori session:', err.message);
    }
}



const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        executablePath: '/usr/bin/chromium',
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ] 
    }
});

client.on('loading_screen', (percent, message) => {
    console.log('[System] LOADING SCREEN:', percent, message);
});

client.on('qr', (qr) => {
    console.log('[System] QR Code received, please scan.');
    qrcode.generate(qr, { small: true });
});


let isQueueRunning = false; 
const messageQueue = [];
const MAX_CONCURRENT = 2; // Maksimal 2 pesan diproses AI secara bersamaan (Aman untuk Ollama)
let currentProcessing = 0;

// =================================================================
// LAPIS 1: BLACKLIST KATA KUNCI (Langsung terdeteksi sebagai SPAM)
// =================================================================
const blacklistWords = [
    "jasa joki", "joki tugas", "jurnal sinta", "turnitin", 
    "joki skripsi", "pengerjaan soal uts", "jasa pengerjaan",
    "bantu kerjain tugas"
];

// =================================================================
// LAPIS 1.5: WHITELIST KATA KUNCI (Langsung dibebaskan/Aman)
// =================================================================
const whitelistWords = [
    "monsep", "sgmail", "id old", "zodiac", "vk fb", "plat",
    "jual akun", "minus", "take", "sold", "nego", "rekber", "mlbb", "pubg",
    "pake joki"
];

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('ready', () => {
    console.log('===================================================');
    console.log('✅ Sistem Filter Aktif (MODE HAPUS OTOMATIS)');
    console.log('Pesan spam akan langsung dihapus dari grup/pribadi.');
    console.log('===================================================');
    
    if (!isQueueRunning) {
        isQueueRunning = true;
        processQueue();
    }
});

// INTERSEPSI PESAN MASUK 
client.on('message_create', (msg) => {
    if (!msg.fromMe && msg.from !== 'status@broadcast') {
        messageQueue.push(msg);
    }
});

// SIKLUS ANTREAN (Paralel dan Cepat)
async function processQueue() {
    while (true) {
        if (messageQueue.length > 0 && currentProcessing < MAX_CONCURRENT) {
            const msg = messageQueue.shift();
            currentProcessing++;
            
            // Proses pesan tanpa menunggu selesai (Paralel)
            handleMessage(msg).finally(() => {
                currentProcessing--;
            });
        } else {
            // Tunggu sebentar jika antrean kosong atau slot penuh
            await new Promise(r => setTimeout(r, 100));
        }
    }
}

async function handleMessage(msg) {
    try {
        const isGroup = msg.from.endsWith('@g.us');
        const tipeObrolan = isGroup ? "GRUP" : "PRIBADI";
        const textLower = msg.body.toLowerCase();
        
        let isSpam = false;
        let filterType = "";

        // 1. PENGECEKAN LAPIS 1: KEYWORD BLACKLIST
        if (blacklistWords.some(word => textLower.includes(word))) {
            isSpam = true;
            filterType = "Keyword Blacklist";
        } 
        // 2. PENGECEKAN LAPIS 1.5: WHITELIST 
        else if (whitelistWords.some(word => textLower.includes(word))) {
            isSpam = false; 
        }
        // 3. PENGECEKAN LAPIS 2: AI LOKAL
        else if (textLower.length > 0 && textLower.length <= 1500) {
            isSpam = await checkWithLocalAI(msg.body);
            if (isSpam) filterType = "AI Analysis";
        }

        if (isSpam) {
            console.log(`\n⚠️ [TERDETEKSI SPAM - ${filterType}]`);
            console.log(`Lokasi   : Obrolan ${tipeObrolan}`);
            console.log(`Pengirim : ${msg.from}`);
            console.log(`Pesan    : "${msg.body.substring(0, 100).replace(/\n/g, " ")}..."`);
            
            try {
                await msg.delete(); 
                console.log(`Tindakan : ✅ PESAN BERHASIL DIHAPUS\n`);
            } catch (delErr) {
                console.log(`Tindakan : ❌ GAGAL MENGHAPUS\n`);
            }
        } else {
            console.log(`[AMAN] ${tipeObrolan} | Dari: ${msg.from}`);
        }

    } catch (err) {
        console.error(`❌ Gagal memproses pesan:`, err.message);
    }
}

async function checkWithLocalAI(text) {
    try {
        // FEW-SHOT PROMPTING: Mengajari AI dengan contoh nyata
        const prompt = `Anda adalah sistem pendeteksi SPAM khusus untuk "Jasa Joki Akademik".
Tugas Anda HANYA menjawab dengan kata "YA" atau "TIDAK".

DEFINISI JOKI AKADEMIK: Penawaran berbayar untuk mengerjakan tugas sekolah, kuliah, UTS, UAS, skripsi, makalah, atau jurnal.

ATURAN KETAT:
- Jika teks menawarkan Jasa Joki Akademik, jawab "YA".
- Jika teks membahas Jual Beli Akun Game, Turnamen Esports, keluhan mahasiswa tentang tugas, kerja kelompok, atau sekadar obrolan biasa, jawab "TIDAK".

CONTOH 1:
Pesan: "Puyeng nugas? Sedia jasa joki pengerjaan cepat aman harga mahasiswa"
Jawaban: YA

CONTOH 2:
Pesan: "MONSEP MINUS PLAT HARGA 155K TAKE SGMAIL POLOS"
Jawaban: TIDAK

CONTOH 3:
Pesan: "Siapa yang mau ngerjain tugas BPMN bareng ntar malem?"
Jawaban: TIDAK

CONTOH 4:
Pesan: "Bantu kerjain PPT dan Turnitin murah meriah kak, DM aja."
Jawaban: YA

ANALISIS PESAN BERIKUT:
Pesan: "${text}"
Jawaban:`;
        
        const res = await axios.post('http://host.docker.internal:11434/api/generate', {
            model: 'qwen2.5:7b',
            prompt: prompt,
            stream: false,
            options: { 
                temperature: 0.0,
                num_predict: 2, // HANYA prediksi 2 token (YA/TIDAK), sangat mempercepat respon
                top_k: 1,
                top_p: 0.1
            }
        }, {
            timeout: 10000 // Waktu tunggu dikurangi karena num_predict sangat cepat
        });

        // Membersihkan jawaban AI untuk mencari kata YA di awal kalimat
        const aiAnswer = res.data.response.trim().toUpperCase();
        
        if (aiAnswer.startsWith('YA')) {
            return true;
        }
        return false;
        
    } catch (e) { 
        console.error(`[AI Skip] Waktu tunggu habis atau AI sedang sibuk.`);
        return false; 
    }
}

console.log('[System] Initializing client in 5 seconds...');
setTimeout(() => {
    client.initialize();
}, 5000);
