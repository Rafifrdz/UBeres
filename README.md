# 🚀 UBeres - Mahasiswa UB Saling Bantu Beresin Tugas

UBeres adalah platform marketplace tugas khusus mahasiswa Universitas Brawijaya yang menghubungkan **Client** (mahasiswa yang butuh bantuan) dengan **Worker** (mahasiswa yang ahli di bidangnya). Aplikasi ini dirancang dengan antarmuka modern, fitur AI yang cerdas, dan sistem komunikasi real-time.

---

## ✨ Fitur Unggulan

### 🤖 Smart AI Integration (Google Gemini)
*   **AI Job Insight**: Setiap postingan tugas akan secara otomatis dianalisis oleh AI untuk memberikan ringkasan menarik, estimasi budget, dan urgensi deadline bagi para worker.
*   **AI Polish**: Membantu Client merangkai kata-kata deskripsi tugas agar lebih profesional, jelas, dan menarik dalam satu klik.

### 💬 Real-time Communication
*   **Instan Chat**: Komunikasi langsung antara Client dan Worker menggunakan teknologi WebSockets (Socket.io) untuk koordinasi tugas yang lebih cepat.
*   **Seleksi Worker**: Client dapat melihat profil, rating, dan penawaran (bid) dari berbagai worker sebelum resmi memilih rekan kerja.

### 📱 Premium Mobile UI/UX
*   **Modern Interface**: Desain mobile-first dengan efek glassmorphism, animasi halus (Framer Motion), dan navigasi yang intuitif.
*   **Role-Based Experience**: Pengalaman pengguna yang berbeda untuk Client (posting tugas) dan Worker (cari cuan).

---

## 🛠️ Tech Stack

**Frontend:**
- React.js & Vite
- Tailwind CSS (Vanilla UI Components)
- Lucide Icons & Framer Motion
- Socket.io Client

**Backend:**
- Node.js & Express
- MongoDB (Atlas)
- Google Generative AI (Gemini Flash 1.5)
- Socket.io (WebSockets)

---

## 🚀 Cara Instalasi

Ikuti langkah-langkah berikut untuk menjalankan UBeres di komputer lokal Anda:

### 1. Clone & Install Dependencies
```bash
# Install dependencies utama
npm install

# Masuk ke folder server dan install dependencies backend
cd server && npm install && cd ..
```

### 2. Konfigurasi Environment (.env)
Buat file `.env` di root folder dan isi dengan konfigurasi berikut (cek `.env.example` sebagai referensi):
```env
MONGODB_URI=link_mongodb_anda
GOOGLE_CLIENT_ID=id_google_auth_anda
GEMINI_API_KEY=key_google_gemini_anda
VITE_CLOUDINARY_CLOUD_NAME=name_cloudinary_anda
VITE_CLOUDINARY_UPLOAD_PRESET=preset_cloudinary_anda
```

### 3. Menjalankan Aplikasi
Gunakan dua terminal terpisah untuk menjalankan server dan frontend secara bersamaan:

**Terminal 1 (Backend):**
```bash
npm run server:dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 📞 Kontak & Kontribusi
Jika Anda memiliki pertanyaan mengenai API Key, akses database, atau ingin berkontribusi, silakan hubungi tim pengembang melalui jalur internal kampus.

**UBeres - Beresin Tugas Jadi Lebih Beres!**
