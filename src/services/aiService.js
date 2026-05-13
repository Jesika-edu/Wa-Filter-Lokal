const axios = require('axios');
const config = require('../config/config');

/**
 * AI Service Turbo Optimized
 * Menggunakan System Prompt Caching untuk kecepatan maksimal
 */
async function checkWithLocalAI(text) {
    try {
        const ollamaUrl = config.ai.ollamaUrl;
        
        // INSTRUKSI UTAMA dipindah ke field 'system' agar di-cache oleh Ollama
        const systemPrompt = `Anda adalah sistem pendeteksi SPAM khusus untuk "Jasa Joki Akademik".
Tugas Anda HANYA menjawab dengan kata "YA" atau "TIDAK".

DEFINISI JOKI AKADEMIK: Penawaran berbayar untuk mengerjakan tugas sekolah, kuliah, UTS, UAS, skripsi, makalah, atau jurnal.

ATURAN KETAT:
- Jika teks menawarkan Jasa Joki Akademik, jawab "YA".
- Jika teks membahas Jual Beli Akun Game, Turnamen Esports, keluhan mahasiswa tentang tugas, kerja kelompok, atau sekadar obrolan biasa, jawab "TIDAK".

CONTOH:
"jasa joki tugas" -> YA
"mabar ml" -> TIDAK
"kerjain tugas bareng" -> TIDAK
"bantu kerjain turnitin" -> YA`;

        const res = await axios.post(ollamaUrl, {
            model: config.ai.model,
            system: systemPrompt, // Dipindah ke sini agar Caching aktif
            prompt: `Pesan: "${text}"\nJawaban:`,
            stream: false,
            keep_alive: "30m", // Tahan model di RAM selama 30 menit
            options: { 
                temperature: 0.0,
                num_predict: 2,
                top_k: 1,
                top_p: 0.1,
                stop: ["\n", ".", " "] 
            }
        }, {
            timeout: 10000 
        });

        const result = res.data.response.trim().toUpperCase();
        return result.startsWith('YA');
        
    } catch (e) { 
        console.error(`[AI] Error: AI Timeout/Busy. Skip.`);
        return false; 
    }
}

module.exports = { checkWithLocalAI };
