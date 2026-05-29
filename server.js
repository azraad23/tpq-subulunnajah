const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(session({
  secret: 'tpq-subulunnajah-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// ─── Multer (Upload Bukti Transfer) ──────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `bukti-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Hanya file gambar/PDF yang diperbolehkan'));
  }
});

// ─── Database Connection ──────────────────────────────────
// ⚠️  SESUAIKAN KONFIGURASI INI DENGAN DATABASE ANDA
const dbConfig = { uri: process.env.MYSQL_URL, waitForConnections: true, connectionLimit: 10 };

let pool;
async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    await pool.query('SELECT 1');
    console.log('✅ Database terhubung');
  } catch (err) {
    console.error('❌ Gagal koneksi database:', err.message);
    console.log('⚠️  Pastikan MySQL berjalan dan database sudah dibuat via database.sql');
    process.exit(1);
  }
}

// ─── Middleware Auth ──────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  res.status(401).json({ success: false, message: 'Unauthorized' });
}

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (!rows.length) return res.json({ success: false, message: 'Email tidak ditemukan' });
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.json({ success: false, message: 'Password salah' });
    req.session.adminId = rows[0].id;
    req.session.adminNama = rows[0].nama;
    res.json({ success: true, nama: rows[0].nama });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET /api/me
app.get('/api/me', (req, res) => {
  if (req.session.adminId) {
    res.json({ loggedIn: true, nama: req.session.adminNama });
  } else {
    res.json({ loggedIn: false });
  }
});

// ═══════════════════════════════════════════════════════════
// SANTRI ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/santri
app.get('/api/santri', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM santri ORDER BY nama ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/santri/list (public - untuk dropdown form)
app.get('/api/santri/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nama FROM santri WHERE status = "aktif" ORDER BY nama ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/santri
app.post('/api/santri', requireAdmin, async (req, res) => {
  const { nama, usia, alamat, nama_wali, no_hp, tanggal_masuk } = req.body;
  if (!nama) return res.json({ success: false, message: 'Nama santri wajib diisi' });
  try {
    await pool.query(
      'INSERT INTO santri (nama, usia, alamat, nama_wali, no_hp, tanggal_masuk) VALUES (?,?,?,?,?,?)',
      [nama, usia || null, alamat || null, nama_wali || null, no_hp || null, tanggal_masuk || null]
    );
    res.json({ success: true, message: 'Santri berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/santri/:id
app.delete('/api/santri/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM santri WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Santri berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// PEMBAYARAN ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/pembayaran (admin)
app.get('/api/pembayaran', requireAdmin, async (req, res) => {
  try {
    const { status, bulan, tahun } = req.query;
    let q = 'SELECT * FROM pembayaran WHERE 1=1';
    const params = [];
    if (status) { q += ' AND status = ?'; params.push(status); }
    if (bulan) { q += ' AND bulan = ?'; params.push(bulan); }
    if (tahun) { q += ' AND tahun = ?'; params.push(tahun); }
    q += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pembayaran/stats (grafik dashboard)
app.get('/api/pembayaran/stats', requireAdmin, async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT bulan, COUNT(*) as jumlah_transaksi, SUM(nominal) as total_nominal,
       SUM(CASE WHEN status='disetujui' THEN 1 ELSE 0 END) as lunas,
       SUM(CASE WHEN status='menunggu' THEN 1 ELSE 0 END) as menunggu
       FROM pembayaran WHERE tahun = ? GROUP BY bulan`,
      [tahun]
    );
    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) as total_transaksi,
        SUM(CASE WHEN status='disetujui' THEN nominal ELSE 0 END) as total_pemasukan,
        SUM(CASE WHEN status='menunggu' THEN 1 ELSE 0 END) as menunggu_validasi,
        (SELECT COUNT(*) FROM santri WHERE status='aktif') as total_santri
       FROM pembayaran`
    );
    res.json({ success: true, bulanan: rows, summary: summary[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/pembayaran (public - form orang tua)
app.post('/api/pembayaran', upload.single('bukti_transfer'), async (req, res) => {
  const { nama_orangtua, nama_santri, jumlah_santri, nominal, metode, bulan, tahun } = req.body;
  if (!nama_orangtua || !nama_santri || !nominal || !metode || !bulan) {
    return res.json({ success: false, message: 'Semua field wajib diisi' });
  }
  if (metode === 'transfer' && !req.file) {
    return res.json({ success: false, message: 'Bukti transfer wajib diupload' });
  }
  const bukti = req.file ? `/uploads/${req.file.filename}` : null;
  const thn = tahun || new Date().getFullYear();
  try {
    await pool.query(
      'INSERT INTO pembayaran (nama_orangtua, nama_santri, jumlah_santri, nominal, metode, bulan, tahun, bukti_transfer) VALUES (?,?,?,?,?,?,?,?)',
      [nama_orangtua, nama_santri, jumlah_santri || 1, nominal, metode, bulan, thn, bukti]
    );
    res.json({ success: true, message: 'Pembayaran berhasil dikirim, menunggu validasi admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/pembayaran/:id/validasi (admin)
app.patch('/api/pembayaran/:id/validasi', requireAdmin, async (req, res) => {
  const { status, catatan_admin } = req.body;
  if (!['disetujui', 'ditolak'].includes(status)) {
    return res.json({ success: false, message: 'Status tidak valid' });
  }
  try {
    await pool.query(
      'UPDATE pembayaran SET status = ?, catatan_admin = ? WHERE id = ?',
      [status, catatan_admin || null, req.params.id]
    );
    res.json({ success: true, message: `Pembayaran berhasil ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🕌 TPQ Subulunnajah Server berjalan!`);
    console.log(`🌐 Buka browser: http://localhost:${PORT}`);
    console.log(`🔐 Login Admin:  http://localhost:${PORT}/login.html`);
    console.log(`👨‍👩‍👧 Form Orang Tua: http://localhost:${PORT}/index.html\n`);
  });
});


