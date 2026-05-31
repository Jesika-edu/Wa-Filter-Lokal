const config = require('../src/config/config');
config.ai.ollamaUrl = config.ai.ollamaTesting;
const { checkWithLocalAI } = require('../src/services/aiService');

/**
 * Dataset Pengujian Akurasi dari User
 * scenario 1: Blacklist Filter
 * scenario 2: Whitelist Filter
 * scenario 3: AI Analysis & Ambiguous Data
 */
const datasetUji = [
  // --- SKENARIO 1: Target Blacklist Filter ---
  { no: 1, teks: "Kak, open jasa joki uts kalkulus nggak? Deadline besok pagi nih.", labelTarget: true, targetSkenario: 1 },
  { no: 2, teks: "Kak, butuh orang yang bisa kerjain skripsi bab 3 dan 4, fee bisa dibicarakan.", labelTarget: true, targetSkenario: 1 },
  { no: 3, teks: "Jasa turnitin murah kak, proses cepat cuma 15 menit langsung lolos.", labelTarget: true, targetSkenario: 1 },
  { no: 4, teks: "Ada yang bisa bantu pengerjaan soal uas pemrograman web kak? Bayar pakai e-wallet.", labelTarget: true, targetSkenario: 1 },
  { no: 5, teks: "Terima joki tugas kuliah kak, makalah, jurnal, dan parafrase. Amanah 100%.", labelTarget: true, targetSkenario: 1 },
  { no: 6, teks: "Cari joki buat ngerjain soal essay manajemen kak, yang fast respon aja ya.", labelTarget: true, targetSkenario: 1 },
  { no: 7, teks: "Ada info yang bisa joki ujian online nggak kak? Kamera bisa diakalin.", labelTarget: true, targetSkenario: 1 },
  { no: 8, teks: "Joki tugas akuntansi dong kak bab rekonsiliasi bank, dm harganya ya.", labelTarget: true, targetSkenario: 1 },
  { no: 9, teks: "Siapa yang bisa kerjain pr matematika ekonomi? Chat personal ya kak, butuh joki.", labelTarget: true, targetSkenario: 1 },
  { no: 10, teks: "Joki kuis dong kak sekarang juga, soalnya pilihan ganda 20 nomor.", labelTarget: true, targetSkenario: 1 },
  { no: 11, teks: "Jasa pengerjaan paper bahasa inggris kak, dijamin grammarly premium.", labelTarget: true, targetSkenario: 1 },
  { no: 12, teks: "WTS jasa ketik tugas cepat kilat semalam selesai kak, harga mahasiswa.", labelTarget: true, targetSkenario: 1 },
  { no: 13, teks: "Ada yang buka joki buat besok pagi jam 8 kak? Matkul statistika penelitian.", labelTarget: true, targetSkenario: 1 },
  { no: 14, teks: "Joki olah data spss, amos, smartpls kak untuk kebutuhan skripsi kilat.", labelTarget: true, targetSkenario: 1 },
  { no: 15, teks: "Open joki semua matkul teknik informatika kak, coding, basis data, aman.", labelTarget: true, targetSkenario: 1 },
  { no: 16, teks: "Jasa joki review jurnal internasional terindeks scopus amanah ya kak.", labelTarget: true, targetSkenario: 1 },
  { no: 17, teks: "Jasa joki pengerjaan pr kalkulus integral turunan matriks kak.", labelTarget: true, targetSkenario: 1 },
  { no: 18, teks: "Joki proposal pkm penelitian pengabdian kewirausahaan karsa cipta kak.", labelTarget: true, targetSkenario: 1 },
  { no: 19, teks: "Open joki pengerjaan laporan akhir magang studi independen kak.", labelTarget: true, targetSkenario: 1 },
  { no: 20, teks: "Bantuan lolos cek turnitin kak, parafrase manual tanpa AI, murah meriah.", labelTarget: true, targetSkenario: 1 },
  { no: 21, teks: "Premium j0K! tugas kuliah murah meriah, langsung beres malam ini juga ya gess!", labelTarget: true, targetSkenario: 1 },
  { no: 22, teks: "Open j0k1 kuis online matkul akuntansi, harga mahasiswa dm aja langsung.", labelTarget: true, targetSkenario: 1 },
  { no: 23, teks: "Jasa j-o-k-i pembuatan makalah dan paper bebas plagiasi, proses cepat kilat.", labelTarget: true, targetSkenario: 1 },

  // --- SKENARIO 2: Target Whitelist / Filter Non-Akademik ---
  { no: 24, teks: "WTS Akun ML Mythic Glory kak, skin banyak, harga nego tipis, rekber on.", labelTarget: false, targetSkenario: 2 },
  { no: 25, teks: "Mabar PUBG yuk kak, kurang satu orang nih buat push rank.", labelTarget: false, targetSkenario: 2 },
  { no: 26, teks: "Dijual akun netflix sharing 1 bulan kak, murah aja.", labelTarget: false, targetSkenario: 2 },
  { no: 27, teks: "WTS akun genshin impact ar 55 kak, karakter b5 banyak, butuh dana segar.", labelTarget: false, targetSkenario: 2 },
  { no: 28, teks: "Nanti malam mabar ml ya kak, jangan lupa login jam 8 pas.", labelTarget: false, targetSkenario: 2 },
  { no: 29, teks: "Turnamen esport kampus dibuka minggu depan kak, ayo bikin tim.", labelTarget: false, targetSkenario: 2 },
  { no: 30, teks: "WTS saldo e-wallet sisa kak, yang mau tukar ke cash pc ya.", labelTarget: false, targetSkenario: 2 },
  { no: 31, teks: "Jual laptop bekas pemakaian kuliah kak, minus lecet pemakaian aja.", labelTarget: false, targetSkenario: 2 },
  { no: 32, teks: "Jual motor honda beat tahun 2021 kak, surat lengkap pajak jalan.", labelTarget: false, targetSkenario: 2 },
  { no: 33, teks: "Jual printer canon bekas kak, cartridge baru diganti, siap pakai.", labelTarget: false, targetSkenario: 2 },
  { no: 34, teks: "WTS preloved baju kaos ukuran L kak, kondisi 95% bagus.", labelTarget: false, targetSkenario: 2 },
  { no: 35, teks: "Jual kursi gaming bekas pemakaian pribadi kak busa empuk hidrolik lancar.", labelTarget: false, targetSkenario: 2 },
  { no: 36, teks: "Jual meja belajar minimalis kak cocok buat mahasiswa kos kosan praktis.", labelTarget: false, targetSkenario: 2 },
  { no: 37, teks: "Jual casing komputer gaming murah meriah kak kipas rgb fungsional normal.", labelTarget: false, targetSkenario: 2 },
  { no: 38, teks: "WTS akun spotify premium family plan kak murah aktif selamanya legal.", labelTarget: false, targetSkenario: 2 },
  { no: 39, teks: "Mabar free fire malam ini kak login jam 9 slot penuh gaskan.", labelTarget: false, targetSkenario: 2 },
  { no: 40, teks: "WTS akun youtube premium bulanan kak murah legal garansi no joki.", labelTarget: false, targetSkenario: 2 },
  { no: 41, teks: "WTS akun premium disney hotstar durasi tiga bulan kak murah meriah aja.", labelTarget: false, targetSkenario: 2 },
  { no: 42, teks: "Jual handphone second kak ram 6gb memori 128gb kondisi lancar jaya.", labelTarget: false, targetSkenario: 2 },
  { no: 43, teks: "Jual flashdisk sandisk original kak kapasitas tiga puluh dua giga murah.", labelTarget: false, targetSkenario: 2 },
  { no: 44, teks: "Jual kamera mirrorless sony a6000 kak lengkap lensa kit dus book mulus.", labelTarget: false, targetSkenario: 2 },
  { no: 45, teks: "Hari ini cuacanya panas banget kak, enaknya minum es kelapa muda.", labelTarget: false, targetSkenario: 2 },
  { no: 46, teks: "Grup chat angkatan sepi amat kak, gada info libur apa?", labelTarget: false, targetSkenario: 2 },
  { no: 47, teks: "Selamat hari jumat semuanya kak, besok libur akhirnya bisa istirahat.", labelTarget: false, targetSkenario: 2 },
  { no: 48, teks: "Selamat malam semuanya kak selamat beristirahat persiapkan stamina buat kuliah besok.", labelTarget: false, targetSkenario: 2 },

  // --- SKENARIO 3: Target AI Analysis (Ada Potensi FN dan FP) ---
  { no: 49, teks: "Bantu kerjain tugas dong kak, nanti aku tf uang jajan.", labelTarget: true, targetSkenario: 3 },
  { no: 50, teks: "Siapa di sini yang jago bikin aplikasi laravel? Mau minta tolong dibikinin buat tugas akhir kak, budget 500k.", labelTarget: true, targetSkenario: 3 },
  { no: 51, teks: "Cari partner berbayar kak buat nyelesaiin tugas coding react js malam ini.", labelTarget: true, targetSkenario: 3 },
  { no: 52, teks: "Tolong kerjain rangkuman buku ini dong kak 5 lembar, ada uang lelah.", labelTarget: true, targetSkenario: 3 },
  { no: 53, teks: "Bisa bantu tugas membuat diagram bpmn bizagi modeller ga kak? Serius nanya.", labelTarget: true, targetSkenario: 3 },
  { no: 54, teks: "Bisa benerin kodingan sekalian kerjain laporan praktikum ga kak? Butuh cepat, ada imbalannya.", labelTarget: true, targetSkenario: 3 },
  { no: 55, teks: "Cari orang buat gantiin presentasi kelompok besok kak, nanti saya bayar.", labelTarget: true, targetSkenario: 3 },
  { no: 56, teks: "Cari bantuan esai argumen bertema cyber security 1000 kata kak, deadline besok ada fee.", labelTarget: true, targetSkenario: 3 },
  { no: 57, teks: "Bisa tolong selesain tugas hitungan ekonomi akuntansi malam ini ga kak? Entar tak ganti uang pulsa/dana.", labelTarget: true, targetSkenario: 3 },
  { no: 58, teks: "Ada yang luang buat bantu up codingan web inertia react malam ini kak? Urgent bgt ada fee rokok.", labelTarget: true, targetSkenario: 3 },
  { no: 59, teks: "Hai mahasiswa dan pelajar! Lagi sibuk tapi tugas numpuk? Jangan khawatir, kami siap membantu 💪 Kami melayani pengerjaan berbagai jenis tugas akademik dengan cepat, rapi, dan sesuai permintaan: 📚 Artikel 📄 Makalah 📝 Paper 📘 Resume 📖 Tugas lainnya 💥 Keunggulan Layanan: ✅ Dikerjakan oleh penulis berpengalaman ✅ Hasil rapi dan bebas plagiasi ✅ Bahasa akademik yang baik dan mudah dipahami ✅ Tepat waktu sesuai deadline ✅ Harga terjangkau untuk pelajar dan mahasiswa 🕒 Deadline mepet? Tenang, kami tetap siap membantu! Hubungi: +62 881-0381-52488", labelTarget: true, targetSkenario: 3 },
  { no: 60, teks: "📣 JOKI SUPER KILAT ⚡ Butuh bantuan tugas kuliah? Tenang, kami siap bantu dengan cepat dan rapi! ✅ Proposal ✅ Makalah ✅ Poster ✅ PPT ✅ Jasa Ketik & Tulis Tangan ✅ ALL TUGAS MAHASISWA 🎯 Cocok buat kamu yang dikejar deadline atau ingin hasil maksimal tanpa ribet! 💬 Langsung chat aja untuk info & pemesanan. Siap bantu kapan pun kamu butuh!", labelTarget: true, targetSkenario: 3 },
  { no: 61, teks: "👨‍💻 DEADLINE DEKAT? TUGAS CODING & REVISI NUMPUK KAK? 📊 Jangan biarkan nilai IPK turun! Tim Ahli IT kami siap beresin tugas kuliahmu! Kami melayani pengerjaan tugas & projek: 💻 Coding & Aplikasi (Laravel, React, Flutter, Python, Web/Mobile) 📊 Olah Data Analisis (SPSS, SmartPLS, Excel, Basis Data) 📐 Diagram Bisnis (BPMN Bizagi, SIPOC, Flowchart) ✨ Kenapa Harus Kami? ✔️ Source code rapi & mudah dipahami ✔️ Free revisi kalau ada error ✔️ Privasi aman 100% Slot terbatas untuk minggu ini kak! Hubungi Admin via WA sekarang 🚀", labelTarget: true, targetSkenario: 3 },
  { no: 62, teks: "🎓 SOLUSI KILAT PEJUANG SKRIPSI & TUGAS AKHIR KAK! 🎓 Stres mikirin revisi dari dosen pembimbing? Mau wisuda tepat waktu tapi mager? Kami siap membantu handle pengerjaan: 📝 Proposal Penelitian & Jurnal 📑 Skripsi Lengkap (Bab 1 sampai Bab 5) 🔍 Cek Plagiasi Turnitin & Parafrase Manual (Lolos <20%) 🌐 Terjemahan Bahasa Inggris (Grammarly Premium) 💰 Harga bersahabat kak, bisa bayar bertahap (DP dulu)! Yuk konsultasikan judul dan kendalamu sekarang, klik link di bio atau WA ya 📩", labelTarget: true, targetSkenario: 3 },
  { no: 63, teks: "🚨 STRES KARENA KUIS & TUGAS KULIAH MENUMPUK KAK? KAMI BANTU! 📚✨ Halo Kakak Mahasiswa! Sibuk kerja paruh waktu atau organisasi sampai tugas terbengkalai? Tenang, serahkan tugasmu ke tim profesional kami: 📌 Pembuatan PPT Estetis / Canva Pro 📌 Tugas Resume Buku / Review Jurnal 📌 Soal Kuis E-Learning & Ujian Online (Pilihan Ganda/Essay) 📌 Laporan Praktikum & Makalah Kelompok 🕒 Layanan Kilat Semalam Selesai Kak! Jaminan rapi dan pengerjaan fast respon. Chat via WA sekarang juga (Harga Mahasiswa) 💬", labelTarget: true, targetSkenario: 3 },
  { no: 64, teks: "📢 [INFO SEMINAR NASIONAL CYBER SECURITY 2026] 📢 Halo Kakak-kakak Mahasiswa! Himpunan Mahasiswa Program Studi kembali menghadirkan Seminar Nasional dengan tema: \"Strategi Mengatasi Ancaman Deepfake dan Keamanan Data di Era AI\" ✨ Narasumber: Dr. Budi Santoso & Ahmad Jaelani, M.Kom 📅 Sabtu, 13 Juni 2026 | ⏰ 09.00 WITA | 📍 Aula Utama Kampus Benefit: ✅ E-Sertifikat (Ber-SKP) | ✅ Ilmu bermanfaat & Relasi Yuk, daftar melalui link berikut kak: bit.ly/SemnasCyber2026", labelTarget: false, targetSkenario: 3 },
  { no: 65, teks: "🔥 OPEN RECRUITMENT PANITIA DIES NATALIS KAMPUS KE-30 🔥 Halo Civitas Akademika! Kesempatan emas buat kakak semua yang pengen nambah pengalaman organisasi dan melatih soft skill! Kami membuka lowongan kepanitiaan untuk divisi: Acara, PDD, Humas, Konsumsi. Persyaratan: Mahasiswa aktif semester 2 atau 4, berkomitmen tinggi. Silakan isi formulir online di kak: siak.kampus.ac.id/recruitment 🙌", labelTarget: false, targetSkenario: 3 },
  { no: 66, teks: "Kak, besok kumpul jam berapa buat ngerjain tugas kelompok e-learning?", labelTarget: false, targetSkenario: 3 },
  { no: 67, teks: "Ada yang paham materi sistem informasi pertemuan ke-4 nggak kak? Ajarin dong.", labelTarget: false, targetSkenario: 3 },
  { no: 68, teks: "Tugas dari pak dosen susah banget kak, ada yang udah nemu referensi jurnalnya?", labelTarget: false, targetSkenario: 3 },
  { no: 69, teks: "Eh kak, SIAK-NG udah bisa dibuka belum sih? Daritadi mau KRS-an error terus.", labelTarget: false, targetSkenario: 3 },
  { no: 70, teks: "Besok ada kuis dari dosen kak, materinya sampai bab mana ya?", labelTarget: false, targetSkenario: 3 },
  { no: 71, teks: "Ayo diskusi bareng kak buat project akhir, biar cepat selesai aplikasinya.", labelTarget: false, targetSkenario: 3 },
  { no: 72, teks: "Pusing banget mikirin tugas akhir kak, revisi mulu dari kemarin.", labelTarget: false, targetSkenario: 3 },
  { no: 73, teks: "Kak jangan lupa besok jadwal kuliah diganti ke jam 1 siang ya.", labelTarget: false, targetSkenario: 3 },
  { no: 74, teks: "Ada tugas individu ga kak untuk matkul manajemen proses bisnis?", labelTarget: false, targetSkenario: 3 },
  { no: 75, teks: "Aplikasi e-learning kampus lagi down ya kak? Ga bisa upload tugas.", labelTarget: false, targetSkenario: 3 },
  { no: 76, teks: "Jangan lupa isi daftar hadir online sebelum jam kuliah selesai ya kak.", labelTarget: false, targetSkenario: 3 },
  { no: 77, teks: "Gimana cara benerin error cors origin di laravel backend ya kak?", labelTarget: false, targetSkenario: 3 },
  { no: 78, teks: "Kelompok lima besok membahas materi tentang balanced scorecard bisnis manajemen ya kak.", labelTarget: false, targetSkenario: 3 },
  { no: 79, teks: "Bantu aku belajar untuk ujian kalkulus dong kak, besok ada exam dan aku panik. Siapa yang mau diskusi bareng dan share catatan?", labelTarget: false, targetSkenario: 3 },
  { no: 80, teks: "Kak, ada yang bisa bantu saya untuk mengerti materi algoritma programming? Saya payah di bidang ini dan butuh penjelasan detail dari teman yang lebih paham.", labelTarget: false, targetSkenario: 3 },
  { no: 81, teks: "Bisa tolong jelaskan cara kerja sistem basis data relasional kak? Saya sudah baca buku tapi masih bingung dengan konsep normalisasi dan primary key.", labelTarget: false, targetSkenario: 3 },
  { no: 82, teks: "Bantu kerjain u j i a n s i s f o d o n g, amanah dan p r i v a t. Hubungi wa.me/xxxxx", labelTarget: true, targetSkenario: 3 },
  { no: 83, teks: "Premium J0K! tugas kuliah murah meriah, langsung beres malam ini juga ya gess!", labelTarget: true, targetSkenario: 3 },
  { no: 84, teks: "Open j0k1 t_u_g_a_s pemrograman web, laravel, react, inertia ready. PM sekarang!", labelTarget: true, targetSkenario: 3 },
  { no: 85, teks: "Open jasa pembuatan dan sharing akun premium kelompok praktikum sisfo gess, langsung chat admin kelompok ya biar dapet slot.", labelTarget: false, targetSkenario: 3 },
  { no: 86, teks: "WTS modul cetak materi kuliah manajemen proses bisnis bab bpmn murah, sisa 2 paket aja langsung PM fast respon malam ini.", labelTarget: false, targetSkenario: 3 },
  { no: 87, teks: "Bantu benerin kodingan laravel inertia punyaku dong kak, pusing error cors mulu dari kemarin. Nanti tak bayar pakai uang kas kelompoki.", labelTarget: false, targetSkenario: 3 },
  { no: 88, teks: "Jasa parafrase makalah kelompok gratis khusus anggota angkatan 2024 biar lolos turnitin besok pagi, buruan chat personal ya.", labelTarget: false, targetSkenario: 3 }
];

async function runAccuracyTest() {
    console.log("=== MEMULAI PENGUJIAN AKURASI MODEL AI ===");
    console.log(`Jumlah data uji: ${datasetUji.length}\n`);

    let correctCount = 0;
    let incorrectCount = 0;

    const failures = [];

    let totalLatency = 0;
    let minLatency = Infinity;
    let maxLatency = 0;

    // Statistik per Skenario
    const stats = {
        1: { correct: 0, total: 0 , totalLatency: 0 },
        2: { correct: 0, total: 0, totalLatency: 0 },
        3: { correct: 0, total: 0, totalLatency: 0 }
    };

    for (let i = 0; i < datasetUji.length; i++) {
        const item = datasetUji[i];
        process.stdout.write(`Testing [ID: ${item.no}] [Scenario: ${item.targetSkenario}]: "${item.teks.substring(0, 50)}..." `);
        
        try {
            const startMem = process.memoryUsage().heapUsed;
            const startTime = Date.now();

            const result = await checkWithLocalAI(item.teks);

            const endTime = Date.now();
            const endMem = process.memoryUsage().heapUsed;

            const latency = endTime - startTime;
            const ramUsedMB = (endMem / 1024 / 1024).toFixed(2);

            // Simpan Data Global
            totalLatency += latency;
            stats[item.targetSkenario].totalLatency += latency;
            if (latency < minLatency) minLatency = latency;
            if (latency > maxLatency) maxLatency = latency;

            const isCorrect = result === item.labelTarget;

            stats[item.targetSkenario].total++;
            if (isCorrect) {
                correctCount++;
                stats[item.targetSkenario].correct++;
                console.log(`✅ [BERHASIL] - ${latency}ms | RAM: ${ramUsedMB} MB`);
            } else {
                incorrectCount++;
                console.log(`❌ [GAGAL] - ${latency}ms | RAM: ${ramUsedMB} MB`);
                failures.push({
                    id: item.no,
                    scenario: item.targetSkenario,
                    text: item.teks,
                    expected: item.labelTarget ? "YA (Joki)" : "TIDAK (Bukan)",
                    actual: result ? "YA (Joki)" : "TIDAK (Bukan)"
                });
            }
        } catch (error) {
            console.log("🔥 [ERROR]");
            failures.push({
                id: item.no,
                text: item.teks,
                error: error.message
            });
        }
    }

    const accuracy = (correctCount / datasetUji.length) * 100;

    console.log("\n=== HASIL AKURASI KESELURUHAN ===");
    console.log(`Total Data   : ${datasetUji.length}`);
    console.log(`Benar        : ${correctCount}`);
    console.log(`Salah        : ${incorrectCount}`);
    console.log(`Akurasi      : ${accuracy.toFixed(2)}%`);

    console.log("\n=== STATISTIK PER SKENARIO ===");
    for (const s in stats) {
        let avgLat = (stats[s].totalLatency / stats[s].total).toFixed(1);
        const acc = (stats[s].correct / stats[s].total) * 100;
        let desc = "";
        if (s == 1) desc = "Blacklist Filter";
        if (s == 2) desc = "Whitelist Filter";
        if (s == 3) desc = "AI Analysis / Ambiguous";
        console.log(`Skenario ${s} (${desc}): ${stats[s].correct}/${stats[s].total} (${acc.toFixed(2)}%) | Rata-rata Latensi: ${avgLat} ms`);
    }

    console.log("\n=== PERFORMA & SUMBER DAYA ===");
    console.log(`Total Waktu Pengujian : ${(totalLatency / 1000).toFixed(2)} detik`);
    console.log(`Rata-rata Latensi     : ${(totalLatency / datasetUji.length).toFixed(0)} ms / teks`);
    console.log(`Latensi Tercepat      : ${minLatency} ms`);
    console.log(`Latensi Terlama       : ${maxLatency} ms`);

    // RAM yang ditampilkan di sini adalah footprint dari Runner Node.js di WSL, bukan memori Model Ollama di Windows.
    console.log(`Total RAM Node.js     : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);

    if (failures.length > 0) {
        console.log("\n=== DETAIL KEGAGALAN ===");
        failures.forEach((f, idx) => {
            console.log(`${idx + 1}. [ID: ${f.id}] [Skenario: ${f.scenario}]`);
            console.log(`   Pesan: "${f.text}"`);
            if (f.error) {
                console.log(`   Error: ${f.error}`);
            } else {
                console.log(`   Ekspektasi: ${f.expected}`);
                console.log(`   Hasil AI  : ${f.actual}`);
            }
        });
    }

    console.log("\n=========================");
}

runAccuracyTest();
