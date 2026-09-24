<div align="center">

# 🚚 UrbanLoad.AI
### Smart Logistics & Spatial Zone Management System

![React 18](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_Qwen_32B-f59e0b?style=for-the-badge&logo=openai&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-000000?style=for-the-badge&logo=mapbox&logoColor=white)

<p align="center">
  <b>Platform AI Spatial & Manajemen Slot Bongkar Muat Logistik Perkotaan Indonesia</b><br/>
  Mengurai kemacetan bahu jalan berbasis <i>GroqLogix AI Engine (Qwen 32B)</i>, <i>PostGIS Virtual GeoFence</i>, dan <i>QuickPass QR HMAC-SHA256</i>.
</p>

[🌐 Live Map Pemantauan](#-fitur--modul-utama) • [📖 Dokumentasi API](#-referensi-api-v1) • [🚀 Panduan Instalasi](#-memulai-pengembangan) • [👨‍💻 Tim Pengembang](#-tim-pengembang)

---

</div>

## 📌 Ringkasan Eksekutif

Antrean truk logistik di bahu jalan kawasan perkotaan padat (seperti Pasar Tanah Abang, Pelabuhan Tanjung Priok, dan kawasan industri) sering menimbulkan kemacetan parah, pemborosan BBM, serta risiko keselamatan lalu lintas.

**UrbanLoad.AI** menghadirkan solusi teknologi spasial terintegrasi untuk mengorganisir jadwal bongkar muat secara otomatis dan terukur, menghubungkan **Kurir Logistik**, **Admin Pengelola Kota**, dan **Petugas Dishub Lapangan** dalam satu ekosistem real-time berbasis **PostGIS PostgreSQL** dan **GroqLogix AI Engine**.

---

## ✨ Fitur & Modul Utama

| Modul | Nama Fitur | Akses Keamanan | Deskripsi & Teknologi |
| :--- | :--- | :--- | :--- |
| **Modul 1** | **SmartSlot Booking AI** | Wajib Login Kurir | Pemesanan slot waktu dengan penyeimbangan jadwal otomatis oleh **GroqLogix AI (Qwen 32B via Groq LPU)** berdasarkan dimensi truk dan okupansi bay. |
| **Modul 1** | **QuickPass QR** | Wajib Login Kurir / Dishub | Tiket pas digital terenkripsi signature **HMAC-SHA256** terikat pada akun resmi untuk verifikasi scan petugas Dishub. |
| **Modul 2** | **CongestionScore Real-Time** | Publik / Read-Only | Skor kepadatan zona (1.0–10.0) dan analisis okupansi bay real-time berbasis telemetri database. |
| **Modul 3** | **Virtual GeoFence** | Wajib Login Admin | Editor penggambaran poligon batas zona PostGIS **WGS84 EPSG:4326** (`GEOGRAPHY(POLYGON, 4326)`) dan verifikasi presisi GPS GNSS kurir (<20m). |
| **Modul 4** | **LiveMap Spasial 3D** | Publik / Read-Only Spectator | Peta interaktif 3D berbasis **MapLibre GL JS** dengan layer Vektor OpenStreetMap, Satelit High-Res Esri World, Dark Basemap, serta penanda posisi truk dan GPS kurir real-time. |

---

## 🏛️ Arsitektur Sistem & Struktur Repositori

Aplikasi dibangun dengan arsitektur **Clean Single-Page Application (SPA)** menggunakan React 18, Vite, dan Supabase Database:

```text
UrbanLoadAi/
├── frontend/                     # Web Application (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/           # Komponen UI Terisolasi per Domain
│   │   │   ├── booking/          # SmartSlot Booking Form & Ringkasan AI
│   │   │   ├── congestion/       # Diagram & Card Skor Kepadatan
│   │   │   ├── layout/           # Header, Footer, NotificationBell & RealtimeStatusDot
│   │   │   ├── livemap/          # MapLibre 3D Canvas, Live Activity Feed & StatsSidebar
│   │   │   ├── location/         # HighAccuracyTracker Telemetry GNSS
│   │   │   ├── ui/               # Reusable UI Primitives (Button, Card, Toast)
│   │   │   └── zones/            # MapLibre Zone Drawing & Geofence Validator
│   │   ├── hooks/                # Custom React Hooks Realtime Supabase
│   │   ├── lib/                  # Helper API, Client Supabase & Groq AI Engine
│   │   └── pages/                # Halaman Operasional Aplikasi
│   │       ├── Home.jsx          # Landing Page Utama
│   │       ├── Login.jsx         # Halaman Masuk Akun Pengguna
│   │       ├── Register.jsx      # Halaman Pendaftaran Akun Baru
│   │       ├── RiderDashboard.jsx# Dashboard Operasional Kurir Logistik
│   │       ├── NewBooking.jsx    # Halaman Pemesanan Slot Baru
│   │       ├── RiderCongestion.jsx # Dashboard Kepadatan Zona Realtime
│   │       ├── CityZones.jsx     # Manajemen Batas Zona Logistik PostGIS
│   │       ├── LiveMap.jsx       # Peta Pemantauan Spasial 3D Realtime
│   │       └── Tentang.jsx       # Informasi Tim Pengembang
│   ├── index.html                # Entry Point HTML
│   └── vite.config.js            # Konfigurasi Build Vite
│
├── backend/                      # Backend API & Database Script Layer
│   ├── api/                      # Serverless Endpoints
│   ├── scripts/                  # Utility Scripts (Schema Applier & Data Reset)
│   │   ├── apply-schema.js       # Auto Applier Schema PostGIS Supabase
│   │   └── clear-all-data.js     # Script Pembersih/Reset Seluruh Tabel Database
│   └── supabase/                 # Supabase PostgreSQL DDL & Configuration
│       ├── config.toml           # Konfigurasi Supabase Local/Remote
│       ├── full_setup.sql        # Skema Lengkap DDL PostGIS, Tables, RLS, Triggers
│       └── seed.sql              # Clean Seed File
│
└── README.md                     # Dokumentasi Master
```

---

## 🔧 Teknologi & Spesifikasi Teknis

- **AI Optimization Engine:** **GroqLogix AI** (`qwen-2.5-32b`) untuk analisis kepadatan & penyeimbangan slot, didampingi security layer `llama-guard-3-8b`.
- **Spatial Database Engine:** PostgreSQL + **PostGIS Extension** (`ST_SetSRID`, `ST_Contains`, `ST_DWithin`, `ST_GeomFromText`).
- **Peta Spasial 3D:** **MapLibre GL JS** dengan dukungan Vektor OSM, Satelit High-Res Esri World, Dark Basemap, Kemiringan Camera 3D, serta Auto-Rotation.
- **Real-time Engine:** **Supabase Realtime WebSockets** (`postgres_changes`) & Telemetri Lokasi Kurir.
- **Enkripsi Tiket:** **HMAC-SHA256** QuickPass Token Signature Verification.

---

## 💻 Memulai Pengembangan (Local Setup)

### 1. Prasyarat Sistem
- **Node.js**: v18.0.0 atau yang lebih baru
- **npm**: v9.0.0 atau yang lebih baru

### 2. Kloning Repositori
```bash
git clone https://github.com/s1informatika11s25007-maker/Urbanload.Ai.git
cd Urbanload.Ai
```

### 3. Konfigurasi Lingkungan (Environment Variables)

Buat file `frontend/.env`:

```env
VITE_SUPABASE_URL="https://gzxoodmqqrweknwghnzz.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_GROQ_API_KEY="YOUR_GROQ_API_KEY"
```

### 4. Jalankan Aplikasi Frontend
```bash
cd frontend
npm install
npm run dev
```
Buka browser di **`http://localhost:5173`**.

---

## 📖 Referensi API v1

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/zones` | Mengambil seluruh zona logistik PostGIS & batas kapasitas dari database. |
| `POST` | `/api/v1/zones` | Menyimpan zona poligon PostGIS WKT baru (`ST_GeomFromText`). |
| `GET` | `/api/v1/bookings` | Mengambil transaksi slot booking kurir aktif real-time. |
| `POST` | `/api/v1/bookings` | Membuat booking slot baru dengan pengujian kapasitas zona. |
| `POST` | `/api/v1/qr/verify` | Memverifikasi tiket QuickPass QR & koordinat lokasi truk via PostGIS `ST_Contains`. |

---

## 👨‍💻 Tim Pengembang

Platform **UrbanLoad.AI** dikembangkan oleh tim mahasiswa S1 Informatika Institut Teknologi Del:

| Foto Profil | Nama Pengembang | Program Studi & Angkatan | Institusi |
| :---: | :--- | :---: | :---: |
| <img src="frontend/public/assets/glen.jpeg" width="70" height="70" style="border-radius:50%"/> | **Glen Rejeki Sitorus** | S1 Informatika 2023 | Institut Teknologi Del |
| <img src="frontend/public/assets/tian.jpeg" width="70" height="70" style="border-radius:50%"/> | **Christian Johannes Hutahaean** | S1 Informatika 2023 | Institut Teknologi Del |
| <img src="frontend/public/assets/michael.jpeg" width="70" height="70" style="border-radius:50%"/> | **Michael Handreak Siburian** | S1 Informatika 2025 | Institut Teknologi Del |

---

<div align="center">
  <p>© 2025 <b>UrbanLoad.AI</b> — Hak Cipta Dilindungi Undang-Undang.</p>
</div>
