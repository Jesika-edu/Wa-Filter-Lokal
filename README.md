# 🛡️ WA Classifier | Premium AI Auto-Filter Dashboard

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-v18+-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-cyan.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**WA Classifier** adalah ekosistem penyaringan pesan WhatsApp otomatis yang ditenagai oleh AI Lokal (Ollama). Dirancang khusus untuk komunitas dan grup bisnis yang memerlukan moderasi pesan cerdas tanpa mengorbankan privasi data. Kini hadir dengan dashboard mewah yang sepenuhnya responsif di semua perangkat.

---

## 🌟 Fitur Unggulan

- 🧠 **AI Local Moderation**: Menggunakan LLM (Ollama) yang berjalan 100% lokal. Pesan Anda tidak pernah keluar dari server Anda.
- 📈 **Dynamic Analytics**: Visualisasi tren spam dan statistik deteksi harian dengan Chart.js yang interaktif.
- 📱 **Fluid Responsive Design**: Antarmuka yang menyesuaikan secara otomatis menggunakan teknologi CSS modern (`clamp`, `grid auto-fit`) untuk tampilan sempurna di Laptop (13"-16") maupun Smartphone.
- 🗂️ **Mobile-Optimized Activity Log**: Tabel log yang cerdas, berubah menjadi format kartu yang informatif saat dibuka di perangkat mobile.
- ⚡ **Real-time Engine**: Mengandalkan Socket.io untuk pembaruan data instan tanpa kedip (*Zero-Flicker*).
- 📖 **Internal Guide**: Panduan setup interaktif yang tertanam langsung di dalam dashboard.

---

## 🛠️ Arsitektur Teknologi

Sistem dibangun dengan fokus pada performa dan skalabilitas:

| Komponen | Teknologi |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Bot Engine** | WhatsApp-Web.js (Puppeteer) |
| **Real-time** | Socket.io |
| **Database** | PostgreSQL |
| **AI Processing** | Ollama API |
| **Frontend UI** | Vanilla HTML5/CSS3 (Glassmorphism design) |

---

## 🚀 Panduan Instalasi Cepat

### 1. Prasyarat
*   **Docker Desktop** (Windows/Mac) atau Docker Engine (Linux).
*   **Ollama AI** terinstal di mesin host.

### 2. Setup Awal
```bash
# Clone repository
git clone https://github.com/username/wa-filter-lokal.git
cd wa-filter-lokal

# Konfigurasi environment
cp .env.example .env
```

### 3. Jalankan dengan Docker
```bash
docker compose up -d --build
```

### 4. Hubungkan WhatsApp
1.  Buka terminal dan jalankan: `docker logs -f wa-filter-bot`
2.  Scan QR Code yang muncul menggunakan menu "Linked Devices" di aplikasi WhatsApp Anda.
3.  Buka Dashboard di browser: `http://localhost:3000`

---

## 💻 Optimasi Laptop & Mobile

Dashboard ini telah dioptimalkan khusus untuk:
*   **Laptop (Semua Ukuran)**: Grid statistik yang adaptif menyesuaikan jumlah kolom secara dinamis.
*   **Tablet**: Sidebar yang bisa diciutkan untuk ruang kerja maksimal.
*   **Smartphone**: Transformasi tabel log menjadi kartu vertikal untuk keterbacaan maksimal di layar sempit.

---

## 🔒 Keamanan & Privasi

- **Data Privacy**: Semua pemrosesan pesan dilakukan di memori lokal dan disimpan di database lokal Anda sendiri.
- **Session Security**: Sesi WhatsApp (`.wwebjs_auth`) diisolasi dalam volume Docker yang aman.
- **Local AI**: Tidak memerlukan koneksi API cloud eksternal (seperti OpenAI/Gemini), sehingga bebas biaya langganan dan data tetap rahasia.

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT**. Bebas untuk dikembangkan lebih lanjut.

---

<p align="center">
  <b>WA Classifier - Solusi Moderasi WhatsApp Cerdas & Aman</b><br>
  Dibuat dengan ❤️ untuk komunitas open source.
</p>
