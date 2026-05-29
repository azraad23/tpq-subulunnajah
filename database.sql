-- ============================================
-- DATABASE: TPQ Subulunnajah
-- Jalankan script ini di MySQL / phpMyAdmin
-- ============================================

CREATE DATABASE IF NOT EXISTS tpq_subulunnajah
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tpq_subulunnajah;

-- Tabel Admin
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Santri
CREATE TABLE IF NOT EXISTS santri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  usia INT,
  alamat TEXT,
  nama_wali VARCHAR(100),
  no_hp VARCHAR(20),
  tanggal_masuk DATE,
  status ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pembayaran
CREATE TABLE IF NOT EXISTS pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_orangtua VARCHAR(100) NOT NULL,
  nama_santri VARCHAR(100) NOT NULL,
  jumlah_santri INT NOT NULL DEFAULT 1,
  nominal DECIMAL(12,0) NOT NULL,
  metode ENUM('cash','transfer') NOT NULL,
  bulan VARCHAR(20) NOT NULL,
  tahun INT NOT NULL,
  bukti_transfer VARCHAR(255),
  status ENUM('menunggu','disetujui','ditolak') DEFAULT 'menunggu',
  catatan_admin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin default
-- Password: admin123 (bcrypt hash)
INSERT INTO admins (nama, email, password) VALUES
('Admin TPQ', 'admin@tpq.com', '$2a$10$EbW/toWgNdPTRD5q1Lg93uz2t0kEYvZpB1SEcMwrioKFdVNt2D8bC');

-- Contoh data santri
INSERT INTO santri (nama, usia, alamat, nama_wali, no_hp, tanggal_masuk, status) VALUES
('Ahmad Fauzi', 8, 'Jl. Mawar No. 12', 'Bapak Fauzan', '08123456789', '2024-01-10', 'aktif'),
('Siti Aisyah', 7, 'Jl. Melati No. 5', 'Ibu Romlah', '08234567890', '2024-01-15', 'aktif'),
('Muhammad Rizki', 9, 'Jl. Kenanga No. 8', 'Bapak Ridwan', '08345678901', '2024-02-01', 'aktif'),
('Fatimah Zahra', 8, 'Jl. Anggrek No. 3', 'Ibu Salmah', '08456789012', '2024-02-10', 'aktif'),
('Abdullah Rahman', 10, 'Jl. Dahlia No. 7', 'Bapak Rahman', '08567890123', '2024-03-01', 'aktif');

-- Contoh data pembayaran
INSERT INTO pembayaran (nama_orangtua, nama_santri, jumlah_santri, nominal, metode, bulan, tahun, status) VALUES
('Bapak Fauzan', 'Ahmad Fauzi', 1, 100000, 'cash', 'Januari', 2025, 'disetujui'),
('Ibu Romlah', 'Siti Aisyah', 1, 100000, 'transfer', 'Januari', 2025, 'disetujui'),
('Bapak Ridwan', 'Muhammad Rizki', 1, 100000, 'cash', 'Februari', 2025, 'disetujui'),
('Bapak Fauzan', 'Ahmad Fauzi', 1, 100000, 'cash', 'Februari', 2025, 'disetujui'),
('Ibu Salmah', 'Fatimah Zahra', 1, 100000, 'transfer', 'Maret', 2025, 'menunggu'),
('Bapak Rahman', 'Abdullah Rahman', 1, 100000, 'cash', 'Maret', 2025, 'disetujui'),
('Ibu Romlah', 'Siti Aisyah', 1, 100000, 'transfer', 'Maret', 2025, 'menunggu'),
('Bapak Fauzan', 'Ahmad Fauzi', 1, 100000, 'cash', 'April', 2025, 'disetujui'),
('Bapak Ridwan', 'Muhammad Rizki', 2, 200000, 'cash', 'April', 2025, 'disetujui'),
('Ibu Salmah', 'Fatimah Zahra', 1, 100000, 'cash', 'Mei', 2025, 'disetujui');
