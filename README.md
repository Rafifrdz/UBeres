
# UBeres - Beresno Tugas Kampus Gampang!

Aplikasi iki kanggo mbantu mahasiswa UB beresno tugas kampus. Ana sing dadi **Worker** (sing ngerjake tugas) lan ana sing dadi **Client** (sing njaluk tulung).

## 🚀 Cara Nglakokno (Kanggo Rafi)

Supaya aplikasine iso mlaku neng laptopmu, turuti langkah-langkah iki:

### 1. Install Disik Bro

Bukak terminal neng root folder, terus ketik command iki:

```bash
npm install
cd server && npm install && cd ..
```

### 2. Isi "Bahan Bakar" (.env)

Kowe butuh file `.env` neng root folder. Tinggal copy wae saka `.env.example`, terus diisi iki:

* `MONGODB_URI`: Link database MongoDB.
* `GOOGLE_CLIENT_ID`: ID kanggo login Google.
* `VITE_GOOGLE_CLIENT_ID`: Podho wae karo sing ndhuwur.

> **PENTING:** Database wis ono isine, dadi kowe tinggal nganggo wae. Nek butuh API utawa ID Google, langsung **chat Kahfi** wae yo.

### 3. Nglakokno Aplikasine

Bukak loro terminal ben luwih penak:

**Terminal 1 (Kanggo Backend):**

```bash
npm run server:dev
```

**Terminal 2 (Kanggo Frontend):**

```bash
npm run dev
```

Wis ngono wae, nek ono error utawa bingung, takokno Kahfi yo!

---

## 📞 Info API

Butuh API Key Gemini, link MongoDB, utawa Google Client ID? Langsung **PC Kahfi** wae, ojo sungkan.
