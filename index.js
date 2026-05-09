const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014587000-alpha.html',
    },
    puppeteer: { 
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        protocolTimeout: 60000, // Menunggu browser hingga 60 detik (mencegah timeout)
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote'
        ] 
    }
});

let isQueueRunning = false; // Pengaman agar loop hanya satu
const messageQueue = [];

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
    "jual akun", "minus", "take", "sold", "nego", "rekber", "mlbb", "pubg"
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

// SIKLUS ANTREAN (Lambat dan Terkontrol)
async function processQueue() {
    while (true) {
        if (messageQueue.length > 0) {
            const msg = messageQueue.shift();
            let isSpam = false;
            let filterType = "";

            try {
                const chat = await msg.getChat();
                const tipeObrolan = chat.isGroup ? "GRUP" : "PRIBADI";
                const textLower = msg.body.toLowerCase();

                // 1. PENGECEKAN LAPIS 1: KEYWORD BLACKLIST
                if (blacklistWords.some(word => textLower.includes(word))) {
                    isSpam = true;
                    filterType = "Keyword Blacklist";
                } 
                // 2. PENGECEKAN LAPIS 1.5: WHITELIST 
                else if (whitelistWords.some(word => textLower.includes(word))) {
                    isSpam = false; 
                }
                // 3. PENGECEKAN LAPIS 2: AI LOKAL (Few-Shot Prompting)
                // REVISI: Batas karakter dinaikkan menjadi 1500
                else if (textLower.length > 0 && textLower.length <= 1500) {
                    isSpam = await checkWithLocalAI(msg.body);
                    if (isSpam) filterType = "AI Analysis";
                }

                // AKSI: HANYA LOGGING INTERNAL 
                if (isSpam) {
                    console.log(`\n⚠️ [TERDETEKSI SPAM - ${filterType}]`);
                    console.log(`Lokasi   : Obrolan ${tipeObrolan}`);
                    console.log(`Pengirim : ${msg.from}`);
                    console.log(`Pesan    : "${msg.body.substring(0, 100).replace(/\n/g, " ")}..."`);
                    
                    try {
                        // Menghapus pesan hanya untuk saya (Delete for Me)
                        await msg.delete(); 
                        console.log(`Tindakan : ✅ PESAN BERHASIL DIHAPUS (Delete for Me)\n`);
                    } catch (delErr) {
                        console.log(`Tindakan : ❌ GAGAL MENGHAPUS\n`);
                    }
                } else {
                    // REVISI: Log agar Anda tahu sistem membaca pesan tanpa menghapus
                    console.log(`[AMAN] Memeriksa pesan dari ${msg.from}`);
                }

            } catch (err) {
                console.error(`❌ Gagal memproses pesan:`, err.message);
            }
        }
        await new Promise(r => setTimeout(r, 500));
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
            model: 'qwen2.5:7b', // PASTIKAN SESUAI DENGAN MODEL YANG ANDA PAKAI
            prompt: prompt,
            stream: false,
            options: { 
                temperature: 0.0, // Wajib 0 agar tidak berhalusinasi
                top_k: 1,         // Memaksa AI mengambil prediksi kata paling absolut
                top_p: 0.1
            }
        }, {
            timeout: 20000 // REVISI: Waktu tunggu AI diubah menjadi 20 detik
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

client.initialize();