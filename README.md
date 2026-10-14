<div align="center">

# 🚚 UrbanLoad.AI
### Spillover-Aware Urban Freight Control & Spatial Zone Management System

![React 18](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_Qwen_32B-f59e0b?style=for-the-badge&logo=openai&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-000000?style=for-the-badge&logo=mapbox&logoColor=white)

<p align="center">
  <b>Platform AI Spasial & Pengendali Logistik Perkotaan Indonesia</b><br/>
  Mengurai kemacetan bahu jalan berbasis <i>GroqLogix AI Engine (Qwen 32B)</i>, <i>PostGIS Virtual GeoFence WGS84</i>, <i>Ed25519 QuickPass QR</i>, dan <i>Realtime WebSockets</i>.
</p>

[🌐 Live Map Pemantauan](#-modul--fitur-utama) • [🏛️ Arsitektur Role](#-arsitektur-4-perspektif-role) • [🚀 Panduan Instalasi](#-memulai-pengembangan-local-setup) • [👨‍💻 Tim Pengembang](#-tim-pengembang)

---

</div>

## 📌 Ringkasan Eksekutif

Antrean truk logistik di bahu jalan kawasan perkotaan padat (seperti Pasar Tanah Abang, Pelabuhan Tanjung Priok, dan kawasan industri) sering menimbulkan kemacetan parah, pemborosan BBM, serta meningkatkan emisi karbon perkotaan.

**UrbanLoad.AI** menghadirkan platform spasial terintegrasi untuk mengorganisir alokasi slot kedatangan secara otomatis dan terukur, menghubungkan **Kurir Logistik**, **Admin Pengelola Kota**, dan **Petugas Dishub Lapangan** dalam satu ekosistem real-time berbasis **PostGIS PostgreSQL**, **MapLibre GL 3D**, dan **GroqLogix AI Engine**.

---

## 🏛️ Arsitektur 4 Perspektif Role

| Role / Perspektif | Nama Konsol | Deskripsi & Fokus Kerja |
| :--- | :--- | :--- |
| 🚚 **Kurir Logistik** (`rider`) | **Konsol Kurir** | Pemesanan slot bongkar muat (*SmartSlot AI*), navigasi rute telemetri GNSS, prediksi kemacetan (*CongestionScore*), dan *Voice Dispatch Console* hands-free. *Menerapkan aturan 1 transaksi aktif per plat nomor kendaraan.* |
| 🏛️ **Admin Kota** (`city_admin`) | **Tata Kota Hub** | Pengaturan poligon batas zona PostGIS WGS84 (`ST_Contains`), analisis kepadatan & Pigovian Tariff AI, inspeksi *Proteksi & Anti-Fraud GPS*, dan evaluasi *CitizenReport Heatmap*. |
| 👮 **Petugas Dishub** (`dishub_officer`) | **Patroli Dishub** | Pemindaian tiket QuickPass QR di lapangan (Arrival & Completion), otomatisasi *Auto-Remove* marker truk yang selesai bongkar muat dari Peta 3D, dan *Siren Emergency Preemption Console*. |
| ⚡ **System Admin** (`admin`) | **Superuser Control** | Akses penuh seluruh modul operasional kurir, tata kota, telemetri patroli, dan asisten AI central LogiTalk. |

---

## ✨ Modul & Fitur Utama

| Modul | Nama Fitur | Akses Role | Deskripsi & Spesifikasi Teknis |
| :--- | :--- | :--- | :--- |
| **Smart Mobility** | **SmartSlot AI Booking** | Kurir Logistik | Pemesanan slot waktu dengan penyeimbangan jadwal otomatis oleh **GroqLogix AI (Qwen 32B via Groq LPU)** berdasarkan dimensi truk dan okupansi bay. Dilengkapi proteksi *Single Active Booking*. |
| **Smart Governance** | **Pas Digital QuickPass QR** | Kurir / Dishub | Tiket digital terenkripsi signature **Ed25519 / HMAC-SHA256**. Pemindaian oleh Dishub (*Selesai & Hapus Map*) otomatis memperbarui status `completed` & menghapus marker dari peta 3D via WebSockets. |
| **Smart Enforcement** | **CitizenReport Portal** | Akses Publik / Warga | Pelaporan parkir liar warga tanpa login dengan koordinat GPS presisi, foto bukti, dan transparansi status akuntabilitas publik (`Diajukan` ➔ `GeoFence Verified` ➔ `Patroli Meluncur` ➔ `Selesai Ditindak`). Dilengkapi opsi kategori kustom. |
| **Smart Infrastructure** | **Virtual GeoFence PostGIS** | Admin Kota / Admin | Editor poligon zona PostGIS **WGS84 EPSG:4326** (`GEOGRAPHY(POLYGON, 4326)`), validator koordinat `check_geofence`, dan verifikasi presisi GPS GNSS kurir (<20m). |
| **Digital Twin** | **LiveMap Spasial 3D** | Publik / All Roles | Peta interaktif 3D **MapLibre GL JS** dengan container hybrid gelap (`#0B0F19`), layer Vektor OSM, Satelit High-Res Esri, Dark Basemap, serta penanda posisi truk dan GPS kurir real-time. |
| **Cybersecurity** | **Proteksi & Anti-Fraud GPS** | Admin Kota / Admin | Penapis serangan prompt injection pada AI dan pembasmi kecurangan *Fake-GPS* kurir via kalkulasi kecepatan spasial `ST_Speed Vector` (>160 km/h = SPOOFED). |

---

## 📂 Arsitektur Repositori

```text
UrbanLoadAi/
├── frontend/                     # Web Application (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/           # Komponen UI Terisolasi per Domain
│   │   │   ├── analytics/        # CityAdminPanel Dashboard
│   │   │   ├── booking/          # SmartSlot Booking Form, History & Slot Table
│   │   │   ├── congestion/       # Diagram & Card Skor Kepadatan
│   │   │   ├── dispatch/         # Voice Dispatch & Siren Preemption Console
│   │   │   ├── enforcement/      # CitizenReport Modal & Realtime Feed
│   │   │   ├── layout/           # Fixed Slate-900 AppSidebar, Top White Header & NotificationBell
│   │   │   ├── livemap/          # MapLibre 3D Canvas, Live Activity Feed & StatsSidebar
│   │   │   ├── location/         # HighAccuracyTracker Telemetry GNSS & MapLocationPicker
│   │   │   ├── qr/               # QRScanner, QuickPass Card & Scan Result Panel
│   │   │   ├── ui/               # Reusable UI Primitives (Button, Card, Toast)
│   │   │   └── zones/            # MapLibre Zone Drawing & GeofenceValidator
│   │   ├── hooks/                # Custom React Hooks Realtime Supabase
│   │   ├── lib/                  # Helper API, Client Supabase, Location & Groq AI Engine
│   │   └── pages/                # Halaman Operasional Aplikasi
│   │       ├── Home.jsx          # Landing Page Utama (Smart City Standards)
│   │       ├── Login.jsx         # Halaman Masuk Akun Pengguna
│   │       ├── Register.jsx      # Halaman Pendaftaran Akun Baru
│   │       ├── VerifyOtp.jsx     # Halaman Verifikasi OTP
│   │       ├── RiderDashboard.jsx# Dashboard Operasional Kurir Logistik
│   │       ├── NewBooking.jsx    # Halaman Pemesanan Slot Baru
│   │       ├── RiderCongestion.jsx # Dashboard Kepadatan Zona Realtime
│   │       ├── CityZones.jsx     # Manajemen Batas Zona Logistik PostGIS
│   │       ├── LiveMap.jsx       # Peta Pemantauan Spasial 3D Realtime
│   │       ├── DishubReportsPage.jsx # Pusat Laporan & QR Scanner Dishub
│   │       ├── PublicReportPage.jsx  # Portal CitizenReport Warga
│   │       ├── EdgeSecurityPage.jsx  # Proteksi & Anti-Fraud GPS
│   │       ├── LogiTalkPage.jsx  # LogiTalk AI Assistant
│   │       ├── VoiceDispatchPage.jsx # Voice Dispatch Page
│   │       └── Tentang.jsx       # Informasi Tim Pengembang & Visi
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
- **Spatial Database Engine:** PostgreSQL + **PostGIS Extension** (`ST_SetSRID`, `ST_Contains`, `ST_DWithin`, `ST_GeomFromText`, `ST_Distance`).
- **Peta Spasial 3D:** **MapLibre GL JS** dengan dukungan Vektor OSM, Satelit High-Res Esri World, Dark Basemap (`#0B0F19`), Kemiringan Camera 3D, serta Auto-Rotation.
- **Real-time Engine:** **Supabase Realtime WebSockets** (`postgres_changes`) & Telemetri Lokasi Kurir.
- **Enkripsi Tiket:** **Ed25519 / HMAC-SHA256** QuickPass Token Signature Verification.

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
| `POST` | `/api/v1/bookings` | Membuat booking slot baru dengan pengujian kapasitas zona & aturan single active booking. |
| `POST` | `/api/v1/qr/verify` | Memverifikasi tiket QuickPass QR & koordinat lokasi truk via PostGIS `ST_Contains`. |

---

## 👨‍💻 Tim Pengembang

Platform **UrbanLoad.AI** dikembangkan oleh tim mahasiswa S1 Informatika Institut Teknologi Del:

| Foto Profil | Nama Pengembang | Program Studi & Angkatan | Peran & Fokus Kerja |
| :---: | :--- | :---: | :--- |
| <img src="frontend/public/assets/glen.jpeg" width="70" height="70" style="border-radius:50%"/> | **Glen Rejeki Sitorus** | S1 Informatika 2023 | **Project Manager & GIS Spatial Engineer**<br/>*Pemodelan spasial PostGIS WGS84, arsitektur GeoFence, dan integrasi data perkotaan.* |
| <img src="frontend/public/assets/tian.jpeg" width="70" height="70" style="border-radius:50%"/> | **Christian Johannes Hutahaean** | S1 Informatika 2023 | **Backend & Security Architect**<br/>*GroqLogix Engine, tiket QuickPass QR Ed25519/HMAC-SHA256, dan WebSockets Realtime.* |
| <img src="frontend/public/assets/michael.jpeg" width="70" height="70" style="border-radius:50%"/> | **Michael Handreak Siburian** | S1 Informatika 2025 | **Frontend & UI/UX Engineer**<br/>*Antarmuka landing page Smart City, dashboard command center React, dan MapLibre GL 3D.* |

---

<div align="center">
  <p>© 2026 <b>UrbanLoad.AI</b> — Hak Cipta Dilindungi Undang-Undang.</p>
</div>
