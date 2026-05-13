# WA Classifier & Auto-Filter

Sistem penyaring pesan WhatsApp otomatis berbasis AI (Ollama) yang dirancang untuk mendeteksi dan menghapus spam, joki, atau konten tidak diinginkan lainnya secara real-time. Cocok untuk pengelolaan grup besar atau akun bisnis.

## ✨ Fitur Utama
- 🛡️ **AI-Powered Filtering**: Klasifikasi pesan cerdas menggunakan model bahasa lokal (Ollama).
- ⚡ **Real-time Monitoring**: Dashboard interaktif berbasis Socket.io untuk memantau aktivitas bot.
- 📱 **Responsive Design**: UI modern yang ramah pengguna, baik di desktop maupun mobile.
- 📦 **Docker Ready**: Deployment mudah dengan satu perintah menggunakan Docker Compose.
- 🔒 **Privacy Focused**: Semua data dan model AI berjalan secara lokal di infrastruktur Anda.

## 🚀 Quick Start

### 1. Prasyarat
- Docker & Docker Compose
- Ollama AI (Pastikan server Ollama berjalan)

### 2. Instalasi
```bash
# Clone repositori
git clone https://github.com/username/wa-filter-lokal.git
cd wa-filter-lokal

# Konfigurasi Environment
cp .env.example .env
# Edit .env dan masukkan kredensial Anda
```

### 3. Jalankan
```bash
docker compose up -d --build
```

### 4. Scan WhatsApp
Lihat log bot untuk melakukan scan QR Code:
```bash
docker logs -f wa-filter-bot
```

Buka dashboard di: `http://localhost:3000`

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, Socket.io
- **Bot Engine**: WhatsApp-Web.js
- **Database**: PostgreSQL
- **AI**: Ollama (Qwen2.5 / Llama3)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Lucide Icons)

## 🔒 Keamanan
Proyek ini dikonfigurasi untuk menjaga keamanan data Anda:
- File `.env` dan folder sesi WhatsApp diabaikan oleh `.gitignore`.
- Sesi WhatsApp disimpan secara terenkripsi di folder lokal `.wwebjs_auth`.

## 📄 Lisensi
[MIT License](LICENSE)
