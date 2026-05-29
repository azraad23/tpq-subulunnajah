# 🕌 TPQ Subulunnajah – Sistem Pendataan Santri & SPP

Sistem manajemen santri dan pembayaran SPP berbasis web untuk TPQ Subulunnajah.

---

## 📁 Struktur Project

```
tpq-subulunnajah/
├── server.js              ← Backend (Node.js + Express)
├── package.json
├── database.sql           ← Script database MySQL
├── public/
│   ├── index.html         ← Form pembayaran (untuk orang tua, tanpa login)
│   ├── login.html         ← Halaman login admin
│   ├── admin.html         ← Dashboard admin
│   └── uploads/           ← Folder upload bukti transfer (auto dibuat)
└── README.md
```

---

## ⚙️ Cara Menjalankan di VSCode

### 1. Install Node.js
Pastikan Node.js sudah terinstall:
```
https://nodejs.org (versi LTS)
```

### 2. Setup Database MySQL
1. Buka **phpMyAdmin** atau **MySQL Workbench**
2. Buat database baru bernama `tpq_subulunnajah`
3. Import/jalankan file `database.sql`
   - phpMyAdmin: klik tab SQL → copy-paste isi database.sql → klik Go
   - MySQL Workbench: File → Run SQL Script → pilih database.sql

### 3. Sesuaikan Konfigurasi Database
Buka `server.js`, cari bagian ini dan sesuaikan:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',      // ← ganti dengan password MySQL kamu
  database: 'tpq_subulunnajah',
};
```

### 4. Install Dependencies
Buka terminal di folder project, jalankan:
```bash
npm install
```

### 5. Jalankan Server
```bash
npm start
```
Atau untuk mode development (auto-restart saat file berubah):
```bash
npm run dev
```

### 6. Buka di Browser
- 🌐 **Form Orang Tua**: http://localhost:3000
- 🔐 **Login Admin**: http://localhost:3000/login.html
- 📊 **Dashboard Admin**: http://localhost:3000/admin.html

---

## 🔐 Akun Admin Default

| Field    | Value              |
|----------|--------------------|
| Email    | admin@tpq.com      |
| Password | admin123           |

---

## ✨ Fitur Lengkap

### Halaman Orang Tua (publik)
- [x] Form pembayaran SPP (tanpa login)
- [x] Pilihan metode: Cash / Transfer
- [x] Tampilkan nomor rekening jika Transfer
- [x] Upload bukti transfer
- [x] Status "Menunggu validasi admin"
- [x] Peringatan batas bayar tanggal 12

### Dashboard Admin
- [x] Login dengan email & password
- [x] Grafik pembayaran per bulan
- [x] Statistik: total santri, pemasukan, transaksi
- [x] Validasi pembayaran (setujui/tolak)
- [x] Riwayat semua pembayaran + filter
- [x] Tambah santri baru
- [x] Hapus santri
- [x] Logout

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Upload**: Multer
- **Auth**: express-session + bcrypt
- **Chart**: Chart.js

---

## 📞 Bantuan

Jika ada masalah, pastikan:
1. MySQL service sudah berjalan
2. Nama database: `tpq_subulunnajah`
3. Password MySQL di `server.js` sudah benar
4. Port 3000 tidak dipakai aplikasi lain
