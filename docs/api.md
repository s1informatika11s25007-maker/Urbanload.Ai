# UrbanLoad.AI — Dokumen API v1

## Base URL
`https://api.urbanload.ai/api/v1` atau `/api/v1`

---

## Endpoint List

### 1. Booking (Modul 1)
- `POST /api/v1/bookings` — Membuat pesanan slot bongkar muat baru.
- `GET /api/v1/bookings` — Mendapatkan daftar riwayat booking pengguna.
- `GET /api/v1/bookings/:id` — Detail spesifik booking.
- `PATCH /api/v1/bookings/:id` — Update status / reschedule booking.

### 2. Zona & Ketersediaan Slot (Modul 1 & Modul 3)
- `GET /api/v1/zones` — Mendapatkan daftar seluruh zona logistik.
- `POST /api/v1/zones` — [Admin] Membuat zona polygon baru.
- `GET /api/v1/zones/:id` — Detail zona dan polygon PostGIS.
- `GET /api/v1/zones/:id/available-slots` — Cek slot ketersediaan per jam.

### 3. QuickPass QR (Modul 1)
- `POST /api/v1/qr/generate` — Encode token QR unik dengan HMAC-SHA256.
- `POST /api/v1/qr/verify` — Validasi QR token oleh petugas Dishub di lokasi.

### 4. CongestionScore (Modul 2)
- `GET /api/v1/congestion/score` — Mengambil skor kepadatan zona saat ini (1-10).
- `GET /api/v1/congestion/trend` — Data tren statistik kepadatan harian/mingguan.

### 5. GeoFence & PostGIS (Modul 3)
- `POST /api/v1/geofence/check` — Mengecek posisi koordinat lat/lng dalam polygon (`ST_Contains`).
- `POST /api/v1/geofence/buffer-time` — Mengecek jarak truk ke zona (`ST_DWithin`).

### 6. LiveMap Spatial (Modul 4)
- `GET /api/v1/livemap/zones` — Data GeoJSON polygon zona untuk render peta.
- `GET /api/v1/livemap/trucks` — Posisi telemetry truk terupdate.
- `GET /api/v1/livemap/activity` — Log aktivitas terkini logistik kota.
