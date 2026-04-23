# Panduan Migrasi Firebase ke MongoDB (Khusus UBeres)

Dokumen ini disusun berdasarkan implementasi project saat ini:
- Auth: Firebase Auth (Google Sign-In)
- Data: Firestore dengan koleksi utama `users`, `jobs`, subkoleksi `bids` dan `messages`
- Query realtime dipakai di Feed, Job Detail, dan Chat

Tujuan migrasi:
1. Pindah penyimpanan data dari Firestore ke MongoDB.
2. Menjaga alur bisnis yang sekarang tetap sama.
3. Menghindari downtime besar lewat migrasi bertahap.

## 1) Realita Arsitektur: Frontend Tidak Boleh Langsung ke MongoDB

Aplikasi kamu adalah React + Vite (frontend). Berbeda dengan Firestore SDK, MongoDB tidak aman jika diakses langsung dari browser dengan kredensial database.

Arsitektur target yang aman:
1. Frontend React
2. Backend API (Express/Node)
3. MongoDB Atlas (atau self-hosted MongoDB)

Alur baru:
- Frontend kirim request ke backend.
- Backend validasi auth + authorization + rule bisnis.
- Backend baca/tulis ke MongoDB.

## 2) Mapping Data Firestore ke MongoDB

### 2.1 Users
Firestore: `users/{uid}`

MongoDB: koleksi `users`
Contoh field:
- `_id`: ObjectId
- `uid`: string (unik, dari Firebase uid atau uid internal baru)
- `displayName`: string
- `email`: string
- `photoURL`: string
- `role`: "client" | "worker"
- `rating`: number
- `totalRatings`: number
- `bio`: string
- `portfolio`: string[]
- `createdAt`: Date
- `updatedAt`: Date

Index disarankan:
- unique index `uid`
- unique index `email`

### 2.2 Jobs
Firestore: `jobs/{jobId}`

MongoDB: koleksi `jobs`
Field:
- `_id`: ObjectId
- `legacyJobId`: string (opsional, simpan id lama Firestore)
- `title`, `description`, `category`
- `budget`: number
- `deadline`: Date
- `clientId`: string (uid)
- `workerId`: string | null
- `status`: "open" | "assigned" | "paid" | "working" | "submitting" | "completed"
- `bidCount`: number
- `createdAt`, `updatedAt`: Date

Index disarankan:
- `{ status: 1, createdAt: -1 }` untuk feed open jobs
- `{ clientId: 1, createdAt: -1 }`
- `{ workerId: 1, updatedAt: -1 }`

### 2.3 Bids
Firestore: `jobs/{jobId}/bids/{bidId}`

MongoDB: koleksi terpisah `bids` (lebih fleksibel untuk query)
Field:
- `_id`: ObjectId
- `jobId`: ObjectId atau string legacy
- `workerId`: string
- `workerName`: string
- `workerRating`: number
- `price`: number
- `pitch`: string
- `createdAt`: Date

Index:
- `{ jobId: 1, createdAt: 1 }`
- optional unique `{ jobId: 1, workerId: 1 }` agar satu worker tidak bid berulang untuk job sama

### 2.4 Messages
Firestore: `jobs/{jobId}/messages/{messageId}`

MongoDB: koleksi `messages`
Field:
- `_id`: ObjectId
- `jobId`: ObjectId atau string legacy
- `senderId`: string
- `text`: string
- `fileURL`: string | null
- `createdAt`: Date

Index:
- `{ jobId: 1, createdAt: 1 }`

## 3) Migrasi Auth: 2 Opsi

## Opsi A (Paling Aman, Paling Cepat)
Tetap pakai Firebase Auth untuk login Google, hanya data storage pindah ke MongoDB.

Keuntungan:
- Frontend berubah minimal.
- Tidak perlu bangun OAuth flow dari nol.
- Backend cukup verifikasi Firebase ID token.

Flow:
1. Frontend login via Firebase Auth (tetap).
2. Frontend kirim Firebase ID token ke backend.
3. Backend verifikasi token pakai `firebase-admin`.
4. Backend ambil `uid` dari token, lalu akses MongoDB berdasarkan `uid`.

## Opsi B (Full Lepas Firebase)
Ganti Firebase Auth ke NextAuth/Auth.js, Passport Google OAuth, atau Auth0.

Catatan:
- Ini proyek lebih besar.
- Meningkatkan kompleksitas migrasi.
- Disarankan dilakukan setelah data layer stabil di MongoDB.

Rekomendasi untuk UBeres: mulai dari Opsi A dulu.

## 4) Mapping Query dari Kode Saat Ini

Dari implementasi saat ini:
- Feed: `jobs` status open, urut `createdAt desc`.
- JobDetail: subscribe job + list bids per job.
- Chat: list messages per job urut ascending + add message.
- PostJob: insert job baru.

Pengganti di backend (REST minimal):
1. `GET /api/jobs?status=open&category=&q=&sort=-createdAt`
2. `GET /api/jobs/:jobId`
3. `POST /api/jobs`
4. `PATCH /api/jobs/:jobId/status`
5. `GET /api/jobs/:jobId/bids`
6. `POST /api/jobs/:jobId/bids`
7. `GET /api/jobs/:jobId/messages`
8. `POST /api/jobs/:jobId/messages`
9. `GET /api/me`
10. `PUT /api/me/profile`

Jika butuh realtime chat/feed:
- Gunakan WebSocket (Socket.IO) atau SSE.
- Fase awal bisa polling per 3-5 detik untuk mempercepat delivery.

## 5) Translasi Firestore Rules ke Authorization Backend

Rules Firestore saat ini perlu dipindah ke service layer backend.

Checklist rule penting yang wajib dipertahankan:
1. User hanya boleh update profil sendiri.
2. User tidak boleh ubah `role`, `rating`, `totalRatings` secara bebas.
3. Job status hanya boleh lewat urutan valid:
   open -> assigned -> paid -> working -> submitting -> completed
4. Hanya client pemilik job yang boleh assign worker.
5. Hanya worker terpilih yang boleh submit pekerjaan.
6. Chat hanya untuk client dan worker yang terkait pada job.

Tips implementasi:
- Buat fungsi validator transisi status terpusat.
- Pakai schema validation (Zod/Joi).
- Pakai Mongo transaction saat operasi multi-dokumen (misalnya submit bid + increment bidCount).

## 6) Langkah Eksekusi Migrasi Bertahap

### Fase 0 - Persiapan
1. Buat cluster MongoDB dan database `uberes`.
2. Buat backend Express (folder terpisah, misalnya `server/`).
3. Setup env backend:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - Firebase service account vars (jika pakai Opsi A)
4. Definisikan model/schema + index.

### Fase 1 - Dual Read (opsional)
1. Endpoint backend baca dari MongoDB.
2. Frontend feature-flag:
   - Jika `VITE_DATA_SOURCE=mongo`, baca via API.
   - Default tetap Firestore.
3. Verifikasi hasil list/detail sama dengan Firestore.

### Fase 2 - Backfill Data
1. Export data Firestore:
   - lewat `gcloud firestore export`, atau
   - script Node via `firebase-admin`.
2. Transform dokumen:
   - flatten subcollections menjadi `bids` dan `messages`.
   - convert timestamp Firestore ke Date.
3. Import ke MongoDB.
4. Validasi jumlah data:
   - total users
   - total jobs
   - total bids
   - total messages

### Fase 3 - Dual Write
1. Untuk operasi create/update, tulis ke Firestore dan MongoDB.
2. Log mismatch jika gagal salah satu.
3. Jalankan 3-7 hari untuk observasi.

### Fase 4 - Cutover
1. Ubah frontend full read/write ke backend MongoDB.
2. Nonaktifkan write ke Firestore.
3. Monitor error rate, latency, dan data consistency.

### Fase 5 - Decommission
1. Backup final Firestore.
2. Matikan akses write Firestore rules.
3. Hapus dependency Firebase Firestore dari frontend setelah stabil.

## 7) Contoh Struktur Backend Minimal

Struktur folder yang disarankan:
- `server/src/app.ts`
- `server/src/config/env.ts`
- `server/src/db/mongo.ts`
- `server/src/middleware/auth.ts`
- `server/src/modules/users/*`
- `server/src/modules/jobs/*`
- `server/src/modules/bids/*`
- `server/src/modules/messages/*`
- `server/src/modules/chat/socket.ts` (opsional realtime)

## 8) Rekomendasi Perubahan di Frontend UBeres

File yang terdampak langsung:
1. `src/lib/firebase.ts`
   - Setelah migrasi data selesai, kurangi fungsi Firestore.
2. `src/App.tsx`
   - Ganti akses `getDoc/setDoc` user ke endpoint `/api/me`.
3. `src/screens/Feed.tsx`
   - Ganti `onSnapshot` Firestore ke fetch API.
4. `src/screens/JobDetail.tsx`
   - Ganti listener job+bids ke endpoint backend.
5. `src/screens/Chat.tsx`
   - Ganti listener messages ke polling/WebSocket.
6. `src/screens/PostJob.tsx`
   - Ganti `addDoc` ke `POST /api/jobs`.
7. `src/lib/utils.ts`
   - Ganti formatter error Firestore menjadi handler error API.

## 9) Risk yang Perlu Diantisipasi

1. Hilang realtime behavior ketika pindah dari onSnapshot ke REST biasa.
2. Inkonsistensi status job jika validasi transisi tidak ketat.
3. Duplikasi bid jika tidak ada unique constraint.
4. Migrasi timestamp yang tidak konsisten timezone.
5. Authorization bocor jika backend hanya cek authentication tanpa ownership.

## 10) Checklist Go-Live

1. Semua endpoint punya auth + authorization test.
2. Index sudah dibuat sebelum traffic produksi.
3. Data parity Firestore vs MongoDB tervalidasi.
4. Logging + alerting aktif (error 5xx, latency P95).
5. Rollback plan siap:
   - feature flag kembali ke Firestore read/write.

## 11) Skenario Nyata Kamu: Cluster Existing `wabot`

Karena dari screenshot kamu sudah ada 1 cluster (`wabot`) dan cluster itu sudah berisi data, strategi paling aman adalah:
1. Tetap pakai cluster `wabot`.
2. Buat database baru khusus app ini dengan nama `uberes`.
3. Simpan koleksi app hanya di database `uberes`: `users`, `jobs`, `bids`, `messages`.

Kenapa ini paling aman:
- Tidak mengganggu database/koleksi proyek lain di cluster yang sama.
- Permission bisa dipisah per database user (least privilege).
- Operasional dan debugging jauh lebih mudah.

### 11.1 Langkah di MongoDB Atlas (UI)

1. Buka cluster `wabot` -> Browse Collections.
2. Klik Create Database.
3. Database Name: `uberes`.
4. Collection Name pertama: `users` (nanti tambah `jobs`, `bids`, `messages`).
5. Buka Database Access:
   - buat user aplikasi khusus UBeres (misal `uberes_app`).
   - kasih role readWrite hanya ke database `uberes`.
6. Buka Network Access:
   - whitelist IP server backend kamu.

### 11.2 Aturan Namespace Saat Cluster Sudah Ada Data

Pilih salah satu:
1. Opsi terbaik: database terpisah `uberes` (direkomendasikan).
2. Opsi alternatif: jika terpaksa 1 database campur, gunakan prefix koleksi (`uberes_users`, `uberes_jobs`, dst).

### 11.3 Index Wajib Sebelum Import

Jalankan ini di database `uberes`:

```javascript
db.users.createIndex({ uid: 1 }, { unique: true, name: "uniq_uid" });
db.users.createIndex({ email: 1 }, { unique: true, sparse: true, name: "uniq_email" });

db.jobs.createIndex({ legacyJobId: 1 }, { unique: true, sparse: true, name: "uniq_legacy_job_id" });
db.jobs.createIndex({ status: 1, createdAt: -1 }, { name: "idx_jobs_status_createdAt" });
db.jobs.createIndex({ clientId: 1, createdAt: -1 }, { name: "idx_jobs_client_createdAt" });
db.jobs.createIndex({ workerId: 1, updatedAt: -1 }, { name: "idx_jobs_worker_updatedAt" });

db.bids.createIndex({ jobId: 1, createdAt: 1 }, { name: "idx_bids_job_createdAt" });
db.bids.createIndex({ jobId: 1, workerId: 1 }, { unique: true, name: "uniq_bid_per_worker_per_job" });

db.messages.createIndex({ jobId: 1, createdAt: 1 }, { name: "idx_messages_job_createdAt" });
```

### 11.4 Strategi Import Agar Tidak Bentrok Data Existing

Saat import/backfill:
1. Gunakan field penanda, misalnya `source: "firestore-migration"` dan `migratedAt`.
2. Gunakan upsert (replace/update by key), jangan insert buta.
3. Tentukan natural key per koleksi:
   - users: `uid`
   - jobs: `legacyJobId` (atau mapping id lama)
   - bids: kombinasi `jobId + workerId`
   - messages: `legacyMessageId` (disarankan ditambahkan saat transform)

Contoh pola upsert di script migrasi:

```javascript
await db.collection("users").updateOne(
  { uid: user.uid },
  { $set: { ...user, source: "firestore-migration", migratedAt: new Date() } },
  { upsert: true }
);
```

### 11.5 Validasi Setelah Import

1. Hitung parity count:
   - users, jobs, bids, messages sumber vs target.
2. Sampling 20-50 dokumen acak per koleksi.
3. Cek query utama aplikasi:
   - open jobs sorted by createdAt.
   - bids per job.
   - messages per job sorted by createdAt.
4. Jika parity aman, baru aktifkan read dari MongoDB.

### 11.6 Jika Kamu Tetap Ingin Campur di Database Lama

Bisa, tapi minimum wajib:
1. Prefix semua koleksi UBeres (`uberes_*`).
2. Buat index unik dengan nama jelas.
3. Gunakan user MongoDB terpisah khusus aplikasi UBeres.
4. Dokumentasikan naming convention supaya tidak tabrakan dengan tim/proyek lain.

## 12) Setup Otomatis via Script (Sudah Dibuat di Repo)

Saya sudah menambahkan script setup agar kamu tidak perlu klik manual di Atlas untuk collection dan index.

File yang dipakai:
1. `scripts/setup-mongodb.ts`
2. `.env.example` (template env)

Langkah pakai:
1. Salin `.env.example` jadi `.env.local` atau `.env`.
2. Isi:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME=uberes`
3. Jalankan:
   - `npm run mongo:setup`

Yang dilakukan script:
1. Connect ke cluster (contoh: `wabot`).
2. Pastikan database target ada (`uberes`).
3. Pastikan collection ada: `users`, `jobs`, `bids`, `messages`.
4. Buat index penting secara idempotent (aman dijalankan berulang).

Catatan:
- Script tidak menghapus data existing.
- Script fokus create collection/index, bukan import isi data Firestore.

---

Jika kamu mau, langkah berikutnya saya bisa langsung bantu bikin:
1. skeleton backend Express + MongoDB,
2. middleware verifikasi Firebase token,
3. endpoint pertama (`GET /api/jobs` dan `POST /api/jobs`),
4. refactor satu screen dulu (misalnya Feed) sebagai pilot migrasi.