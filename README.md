# UrbanLoad.AI 🚚 Smart Logistics & Spatial Zone Management

Platform manajemen zona bongkar muat logistik perkotaan berbasis AI, PostGIS, Next.js 14, dan Supabase.

## 🚀 Fitur Utama

- **Modul 1: SmartSlot Booking & QuickPass QR**
  - Booking jendela waktu bongkar muat dengan validasi dimensi truk vs kapasitas zona.
  - Tiket QR Digital aman dengan signature HMAC-SHA256 untuk verifikasi petugas di lokasi.
- **Modul 2: CongestionScore (Real-time Rule-based)**
  - Skor kepadatan zona (1-10) berbasis formula rule-based tanpa ketergantungan API eksternal.
  - Rekomendasi lokasi & waktu bongkar muat alternatif terdekat.
- **Modul 3: Virtual GeoFence (PostGIS Spatial)**
  - Manajemen polygon zona logistik dengan PostGIS `GEOGRAPHY(POLYGON, 4326)`.
  - Validasi lokasi truk real-time menggunakan RPC `ST_Contains` dan `ST_DWithin`.
- **Modul 4: LiveMap Spatial (CivicLogix Dashboard)**
  - Dashboard pemantauan peta interaktif real-time via Supabase Realtime & WebSockets.
  - Visualisasi ketersediaan zona, pergerakan armada truk, dan aktivitas logistik.

---

## 🛠️ Stack Teknologi

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React, Recharts, Leaflet / Mapbox GL
- **Backend:** Supabase (Postgres + PostGIS + Realtime + Storage + Auth), Vercel Serverless Functions
- **Bahasa:** TypeScript / SQL

---

## 📁 Struktur Repositori

```text
urbanload-ai/
├── frontend/    # Next.js 14 Web Application
├── backend/     # Vercel Serverless API, Supabase Migrations & Edge Functions
├── shared/      # Shared Types & Constants
├── docs/        # API Documentation & Architecture Diagram
└── .github/     # GitHub Actions CI/CD Workflows
```

---

## 🚦 Memulai Pengembangan

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend & Database
```bash
cd backend
npm install
# Supabase CLI Local Dev
supabase start
supabase db reset
```

---

## 📄 Lisensi
© 2025 UrbanLoad.AI - All Rights Reserved.
