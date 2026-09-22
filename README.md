<div align="center">

# 🚚 UrbanLoad.AI
### Smart Logistics & Spatial Zone Management System

![Next.js 14](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![Deck.gl](https://img.shields.io/badge/Deck.gl_WebGL3D-000000?style=for-the-badge&logo=uber&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel_Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)

<p align="center">
  <b>Platform AI Spatial & Management Slot Bongkar Muat Logistik Perkotaan Indonesia</b><br/>
  Mengatasi kemacetan bahu jalan berbasis <i>PostGIS Virtual GeoFence</i>, <i>CongestionScore Rule-Based</i>, dan <i>QuickPass QR HMAC-SHA256</i>.
</p>

[🌐 Live Preview Spatial](#-modul-sistem) • [📖 Dokumentasi API](#-referensi-api-v1) • [🚀 Panduan Instalasi](#-memulai-pengembangan) • [👨‍💻 Tim Pengembang](#-tim-pengembang)

---

</div>

## 📌 Ringkasan Eksekutif

Antrean truk logistik di bahu jalan kawasan perkotaan yang padat (seperti Pasar Tanah Abang, Pelabuhan Tanjung Priok, dan kawasan perdagangan) sering menimbulkan kemacetan parah, pemborosan BBM, dan risiko keselamatan lalu lintas.

**UrbanLoad.AI** menghadirkan solusi teknologi spatial terintegrasi untuk mengorganisir jadwal bongkar muat secara otomatis dan terukur, menghubungkan **Kurir Logistik**, **Pengelola / Admin Kota**, dan **Petugas Dishub Lapangan** dalam satu ekosistem real-time.

---

## ✨ Fitur & Modul Utama

| Modul | Nama Fitur | Akses Keamanan | Deskripsi & Teknologi |
| :--- | :--- | :--- | :--- |
| **Modul 1** | **SmartSlot Booking** | Wajib Login Kurir | Pemesanan slot jendela waktu bongkar muat dengan validasi real-time dimensi truk vs kapasitas zona. |
| **Modul 1** | **QuickPass QR** | Wajib Login Kurir / Dishub | Tiket digital terenkripsi signature **HMAC-SHA256** terikat pada akun kurir resmi untuk verifikasi scan Dishub. |
| **Modul 2** | **CongestionScore** | Publik (Read-Only) | Skor kepadatan zona (1-10) berbasis algoritma *rule-based* transparan untuk rekomendasi slot alternatif. |
| **Modul 3** | **Virtual GeoFence** | Wajib Login Admin | Editor penggambaran poligon zona PostGIS **WGS84 EPSG:4326** (`GEOGRAPHY(POLYGON, 4326)`) & kapasitas truk. |
| **Modul 4** | **LiveMap Spatial** | Publik / Read-Only Spectator | Peta interaktif WebGL GPU **MapLibre GL JS + Deck.gl (Uber Stack)** (3D Flow Arc Corridors, Scatterplot Clusters, CARTO Voyager Vector Tiles, Satelit High-Res, & Animasi Truk 60 FPS). |

---

## 🏛️ Arsitektur Sistem & Struktur Repositori

Repositori dikembangkan dengan arsitektur **Clean Modular Architecture** yang dipisahkan secara tegas antara antarmuka frontend, serverless API backend, serta skema basis data spatial Supabase:

```text
UrbanLoadAi/
├── frontend/                     # Web Application (Next.js 14 App Router)
│   ├── app/                      # Page Routes & Suspense Loading Boundaries
│   │   ├── (admin)/              # City Admin: System Health, Audit Logs, Users & Roles
│   │   ├── (auth)/               # Login, Register, Verify-OTP, Onboarding
│   │   ├── (city)/               # City Admin: LiveMap, Virtual GeoFence, Reports
│   │   ├── (dishub)/             # Dishub Officer: QR Scanner, Geofence Verification
│   │   ├── (public)/             # Landing Page, Tentang Tim, Interactive Demo
│   │   └── (rider)/              # Logistics Courier: Dashboard, SmartSlot Booking
│   ├── components/               # Feature-Driven Reusable UI Components
│   │   ├── booking/              # SmartSlot Booking Forms & Slot Tables
│   │   ├── congestion/           # CongestionScore Trend Charts & Cards
│   │   ├── layout/               # Header, Footer, Mobile Navigation & Status Indicators
│   │   ├── livemap/              # MapLibre WebGL Canvas & Live Activity Feed
│   │   ├── qr/                   # QuickPass QR Generators & HTML5 Camera Scanners
│   │   ├── ui/                   # Reusable UI Primitives (Button, Card, etc. with index.ts)
│   │   └── zones/                # PostGIS Polygon Canvas Drawing Tools
│   ├── hooks/                    # Custom React Hooks & Realtime Subscriptions (with index.ts)
│   ├── lib/                      # Clean Layered Client Helpers
│   │   ├── api/                  # API Client Fetchers & Services
│   │   ├── supabase/             # Supabase Browser, Server & Realtime Clients
│   │   ├── constants/            # Role & Route Constants
│   │   └── validators/           # Zod Schema Validators
│   └── types/                    # Domain Interfaces & Shared Types Re-exports
│
├── backend/                      # Clean Serverless Layered API Engine
│   ├── src/                      # Backend Core Modular Architecture
│   │   ├── config/               # DB Pool, Supabase Admin & Env Configs
│   │   ├── middleware/           # CORS & Auth Bearer Verification Middlewares
│   │   ├── modules/              # Isolated Domain Feature Modules
│   │   │   ├── auth/             # Authentication & Profile Service
│   │   │   ├── bookings/         # Logistics Slot Booking Service
│   │   │   ├── congestion/       # Rule-Based CongestionScore Calculator
│   │   │   ├── geofence/         # PostGIS GeoFence Checking Service
│   │   │   ├── livemap/          # WebGL Vehicles Telemetry Feed
│   │   │   ├── qr/               # HMAC-SHA256 QuickPass Signature Verification
│   │   │   └── zones/            # PostGIS Spatial Zones Management
│   │   ├── utils/                # Standardized Response Formatters & Logger
│   │   └── types/                # Backend API Type Definitions
│   ├── api/                      # Vercel Serverless Endpoints (Routes / Controllers)
│   │   ├── _lib/                 # Compatibility Layer (re-exporting from src/*)
│   │   ├── cron/                 # Automated Background Slot Expiration & Congestion Recalc
│   │   └── v1/                   # RESTful API Endpoints (/v1/zones, /v1/bookings, etc)
│   └── supabase/                 # Database Migrations & Seed Data
│       ├── migrations/           # PostGIS DDL SQL Files
│       └── seed.sql              # Seed Data for Production & Evaluation
│
├── shared/                       # Shared Domain Types & App Constants
└── README.md                     # Master Documentation
```

---

## 🔧 Teknologi & Spesifikasi Teknis

- **Spatial Database Engine:** PostgreSQL + **PostGIS Extension** (`ST_SetSRID`, `ST_Contains`, `ST_DWithin`, `ST_GeomFromText`).
- **Map & WebGL Rendering:** Kombinasi **MapLibre GL JS** + **Deck.gl (Uber Stack)** untuk visualisasi 3D WebGL Spasial 100% gratis tanpa biaya API, dilengkapi *3D Curved Flow Arcs*, *Scatterplot Telemetry Clusters*, CARTO Voyager Vector Tiles, ESRI World Imagery Satellite, dan `requestAnimationFrame` 60 FPS WebGL Vehicle Telemetry.
- **Backend & Real-time:** Vercel Serverless Functions Node.js + **Supabase Realtime WebSockets** (`postgres_changes`).
- **Enkripsi Tiket:** HMAC-SHA256 Token Signature Verification.
- **Penguat Performa:** Instant Route Prefetching & Suspense Boundaries Next.js 14 App Router (<5ms Navigation).

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

Buat file `frontend/.env.local` dan `backend/.env`:

```env
# Supabase Live Credentials
NEXT_PUBLIC_SUPABASE_URL="https://gzxoodmqqrweknwghnzz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Database Direct Connection Pooler (AWS ap-northeast-1)
DATABASE_URL="postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

### 4. Jalankan Aplikasi Frontend
```bash
cd frontend
npm install
npm run dev
```
Buka browser di **`http://localhost:3000`**.

### 5. Jalankan Backend Serverless (Opsional)
```bash
cd backend
npm install
npm run dev
```

---

## 📖 Referensi API v1

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/zones` | Mengambil seluruh zona logistik PostGIS & batas kapasitas. |
| `POST` | `/api/v1/zones` | Menyimpan zona polygon PostGIS WKT baru (`ST_GeomFromText`). |
| `GET` | `/api/v1/bookings` | Mengambil transaksi slot booking kurir aktif real-time. |
| `POST` | `/api/v1/bookings` | Membuat booking slot baru dengan pengujian kapasitas zona. |
| `POST` | `/api/v1/qr/generate` | Menerbitkan tiket QuickPass QR dengan enkripsi signature HMAC-SHA256. |
| `POST` | `/api/v1/qr/verify` | Memverifikasi tiket QR & koordinat lokasi truk via PostGIS `ST_Contains`. |
| `GET` | `/api/v1/congestion/score` | Kalkulasi skor kepadatan zona (1-10) real-time. |

---

## 👨‍💻 Tim Pengembang

Platform **UrbanLoad.AI** dikembangkan oleh mahasiswa S1 Informatika:

| Foto Profil | Nama Pengembang | Program Studi & Angkatan | Institusi |
| :---: | :--- | :---: | :---: |
| <img src="frontend/public/assets/glen.jpeg" width="70" height="70" style="border-radius:50%"/> | **Glen Rejeki Sitorus** | S1 Informatika 2023 | Institut Teknologi Del |
| <img src="frontend/public/assets/tian.jpeg" width="70" height="70" style="border-radius:50%"/> | **Christian Johannes Hutahaean** | S1 Informatika 2023 | Institut Teknologi Del |
| <img src="frontend/public/assets/michael.jpeg" width="70" height="70" style="border-radius:50%"/> | **Michael Handreak Siburian** | S1 Informatika 2025 | Institut Teknologi Del |

---

<div align="center">
  <p>© 2025 <b>UrbanLoad.AI</b> — Hak Cipta Dilindungi Undang-Undang.</p>
</div>
