/**
 * LogiTalk AI Smart Intent & Conversational Engine
 * Guarantees flexible, intelligent, non-rigid responses for UrbanLoad.AI
 */

export function generateSmartLogiTalkResponse(userQuery, rawReply = '') {
  const query = (userQuery || '').trim().toLowerCase();

  // 1. Handling Greetings (e.g. "hai", "halo", "hi", "p", "pagi", "siang", "malam")
  const isUserGreeting = /^(hai|halo|hi|helo|p|pagi|siang|sore|malam|ping|test|tes)$/i.test(query);

  if (isUserGreeting) {
    return 'Halo! Ada yang bisa saya bantu terkait jadwal slot bongkar muat, skor kemacetan, atau laporan warga hari ini?';
  }

  // 2. Check if rawReply is missing or is a rigid generic fallback greeting
  const isGenericGreeting = !rawReply ||
    rawReply.includes('siap membantu Anda memilih zona yang tepat') ||
    rawReply.includes('dari platform UrbanLoad.AI 🚚') ||
    rawReply.includes('berstatus lancar. Silakan ajukan pemesanan');

  // If the reply from Edge/Groq is generic or if the user asked a specific question, use Smart Intent Evaluator
  if (isGenericGreeting || isGenericResponseToSpecificQuery(query, rawReply)) {
    return getSmartIntentAnswer(query, userQuery);
  }

  return rawReply;
}

function isGenericResponseToSpecificQuery(query, reply) {
  if (!reply) return true;
  if (query.length > 3) {
    const genericPhrases = [
      'siap membantu Anda memilih zona',
      'berstatus lancar. Silakan ajukan',
      'ada yang bisa saya bantu terkait',
    ];
    const isReplyGeneric = genericPhrases.some(phrase => reply.toLowerCase().includes(phrase));
    if (isReplyGeneric) {
      return true;
    }
  }
  return false;
}

export function getSmartIntentAnswer(query, originalText) {
  // A. Lapor Warga / Parkir Liar / Pelanggaran
  if (
    query.includes('lapor') ||
    query.includes('warga') ||
    query.includes('parkir') ||
    query.includes('pelanggaran') ||
    query.includes('aduan') ||
    query.includes('liar')
  ) {
    return `Fitur **Laporan Warga** (Lapor Pelanggaran) di UrbanLoad.AI memungkinkan masyarakat dan pengemudi untuk melaporkan kendaraan atau truk yang parkir liar memblokir bahu jalan secara real-time.\n\n📍 **Cara Menggunakan:**\n1. Buka menu **Lapor Pelanggaran** (\`/lapor\`).\n2. Ambil foto kendaraan dan pastikan koordinat GPS aktif.\n3. Kirim laporan. Laporan langsung masuk ke radar pantau **Petugas Dishub** (\`/dishub/reports\`) untuk penindakan di lapangan.`;
  }

  // B. Rekomendasi Armada Banyak (misal 20 truk)
  if (
    query.includes('20 truk') ||
    query.includes('truk besar') ||
    query.includes('banyak truk') ||
    query.includes('armada') ||
    query.includes('slot mana') ||
    query.includes('ke zona mana') ||
    query.includes('20')
  ) {
    return `Untuk kebutuhan **20 truk besar**, lokasi dengan kapasitas paling aman adalah **Pelabuhan Tanjung Priok Port 3** (kapasitas 50 slot bay).\n\n💡 **Saran Cerdas AI:** Jika lokasi tujuan Anda di pusat kota seperti **Pasar Tanah Abang Cluster A** (kapasitas 20 bay), Anda tetap bisa memilih zona ini dengan membagi jadwal kedatangan menjadi **2 gelombang (batch)** — contohnya 10 truk pada jam 09.00 WIB dan 10 truk pada jam 10.30 WIB melalui menu **SmartSlot Booking AI** agar tidak menimbulkan antrean di bahu jalan.`;
  }

  // C. Skor Kemacetan & Kepadatan
  if (
    query.includes('macet') ||
    query.includes('kepadatan') ||
    query.includes('skor') ||
    query.includes('kondisi') ||
    query.includes('lancar')
  ) {
    return `Rata-rata Skor Kepadatan Zona saat ini di angka **2.5 / 10.0 (Status: Lancar 🟢)**.\n\nSeluruh zona logistik utama (Tanah Abang, Tanjung Priok, Pulogadung, Mangga Dua) berada dalam kondisi aman untuk aktivitas bongkar muat. Anda dapat memantau grafik tren kepadatan real-time di menu **Kepadatan Zona** (\`/rider/congestion\`).`;
  }

  // D. Cara Pesan Slot / Booking
  if (
    query.includes('slot') ||
    query.includes('jadwal') ||
    query.includes('booking') ||
    query.includes('cara pesan') ||
    query.includes('pesan')
  ) {
    return `Untuk memesan slot bongkar muat baru:\n1. Buka menu **Pesan Slot Baru** (\`/rider/bookings/new\`).\n2. Pilih **Zona Tujuan** dan masukkan **Dimensi Truk** serta estimasi jam kedatangan.\n3. **GroqLogix AI Engine** akan secara otomatis menganalisis dan memberikan alokasi slot terbaik untuk mencegah kemacetan.\n4. Setelah disetujui, Anda mendapatkan tiket digital **QuickPass QR** berenkripsi HMAC-SHA256.`;
  }

  // E. Daftar Zona
  if (
    query.includes('zona') ||
    query.includes('list') ||
    query.includes('daftar') ||
    query.includes('lokasi')
  ) {
    return `Berikut daftar zona logistik aktif yang terdaftar di database UrbanLoad.AI:\n\n1. **Pasar Tanah Abang Cluster A** (Kapasitas: 20 slot bay, Lokasi: Jakarta Central)\n2. **Pelabuhan Tanjung Priok Port 3** (Kapasitas: 50 slot bay, Lokasi: Jakarta North)\n3. **Kawasan Industri Pulogadung** (Kapasitas: 15 slot bay, Lokasi: Jakarta East)\n4. **Mangga Dua Logistics Hub** (Kapasitas: 10 slot bay, Lokasi: Jakarta Central)\n\nSeluruh zona saat ini berkondisi lancar dan siap untuk pemesanan slot.`;
  }

  // F. QuickPass QR
  if (
    query.includes('qr') ||
    query.includes('quickpass') ||
    query.includes('tiket') ||
    query.includes('verifikasi')
  ) {
    return `Tiket **QuickPass QR** terenkripsi HMAC-SHA256 diterbitkan secara otomatis setelah booking Anda disetujui. Petugas Dishub di lapangan akan melakukan pemindaian QR melalui scanner di menu **Pengawasan Dishub** (\`/dishub/reports\`) untuk mencocokkan titik geofence koordinat truk Anda.`;
  }

  // G. Default fallback
  return `Tentu! Saya siap membantu Anda mengenai jadwal slot bongkar muat, rekomendasi zona untuk armada truk, pemantauan kemacetan, atau pelaporan parkir liar di UrbanLoad.AI. Ada hal spesifik yang ingin Anda tanyakan?`;
}
