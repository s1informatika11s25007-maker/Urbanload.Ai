# Arsitektur Sistem UrbanLoad.AI

```mermaid
graph TD
    Client[Next.js 14 Frontend - App Router] -->|REST / WebSocket| Supabase[Supabase Platform]
    Client -->|API Calls| Serverless[Vercel Serverless Functions API v1]

    subgraph Supabase Service
        Auth[Supabase Auth]
        DB[(PostgreSQL + PostGIS)]
        Storage[Supabase Storage]
        Realtime[Supabase Realtime Engine]
    end

    Serverless --> DB
    Serverless --> Auth
    
    subgraph GeoSpatial & Logic
        PostGIS[PostGIS RPC: ST_Contains, ST_DWithin]
        Congestion[Rule-Based Scorer]
        QRSign[HMAC-SHA256 Signer]
    end

    DB --- PostGIS
    Serverless --- Congestion
    Serverless --- QRSign
```

## Komponen Utama
1. **Global Shell:** Glassmorphism Sticky Header (64px) & Minimalist Footer (56px) dengan Live Clock WIB & Status System.
2. **PostGIS Engine:** Mengelola boundary polygon WGS84 (`EPSG:4326`) dan query spasial real-time.
3. **Congestion Engine:** Menghitung skor `CEIL((booking_aktif / kapasitas_maks_per_jam) * 10)`.
4. **QuickPass Security:** HMAC-SHA256 signature verification untuk mencegah pemalsuan tiket QR.
