# UBeres - Beresin Tugas Kampus Gampang!

Aplikasi buat bantu mahasiswa UB beresin tugas kampus. Ada yang jadi **Worker** (si tukang beres) dan ada yang jadi **Client** (si minta tolong).

## 🚀 Cara Gas (Buat Rafi)

Biar aplikasinya jalan di laptop lu, ikutin step simpel ini:

### 1. Install Dulu Bro
Buka terminal di root folder, terus hajar command ini:
```bash
npm install
cd server && npm install && cd ..
```

### 2. Isi "Bahan Bakar" (.env)
Lu perlu file `.env` di root folder. Copy aja dari `.env.example`, terus isinya jangan lupa:
- `MONGODB_URI`: Link database MongoDB.
- `GOOGLE_CLIENT_ID`: ID buat login Google.
- `VITE_GOOGLE_CLIENT_ID`: Sama aja kayak yang di atas.

> **PENTING:** Database udah ada isinya, jadi lu tinggal pake aja. Kalau butuh API atau ID Google-nya, **chat Kahfi** aja ya.

### 3. Jalanin Aplikasinya
Buka dua terminal biar enak:

**Terminal 1 (Buat Backend):**
```bash
npm run server:dev
```

**Terminal 2 (Buat Frontend):**
```bash
npm run dev
```

Udah gitu aja, kalau ada error atau bingung, tanya Kahfi ya!

---

## 📞 Info API
Butuh API Key Gemini, link MongoDB, atau Google Client ID? Langsung **PC Kahfi** aja, jangan malu-malu.
