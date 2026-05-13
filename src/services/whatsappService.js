const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

/**
 * Pembersihan file lock secara rekursif agar tidak merusak sesi utama
 * Mencari semua file yang mengandung 'Singleton' di seluruh folder sesi
 */
function cleanupSession() {
    const sessionDir = path.join(__dirname, '..', '..', '.wwebjs_auth');
    if (!fs.existsSync(sessionDir)) return;

    const walkAndCleanup = (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                walkAndCleanup(filePath); // Masuk ke sub-folder (misal: Default/)
            } else if (file.includes('Singleton')) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`[Cleanup] Berhasil menghapus file kunci: ${file}`);
                } catch (err) {
                    // Abaikan jika gagal
                }
            }
        });
    };

    try {
        walkAndCleanup(sessionDir);
    } catch (err) {
        console.error('[Cleanup] Gagal membersihkan sesi:', err.message);
    }
}

function createClient() {
    // Jalankan pembersihan menyeluruh sebelum inisialisasi
    cleanupSession();

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: 'wa-filter'
        }),
        authTimeoutMs: 60000,
        puppeteer: { 
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--no-first-run',
                '--disable-features=IsolateOrigins,site-per-process',
                '--js-flags="--max-old-space-size=512"'
            ] 
        }
    });

    client.on('qr', (qr) => {
        console.log('[System] QR Code received, scan now!');
        qrcode.generate(qr, { small: true });
    });

    client.on('loading_screen', (percent, message) => {
        console.log('[System] Loading WhatsApp Web:', percent, message);
    });

    return client;
}

module.exports = { createClient };
