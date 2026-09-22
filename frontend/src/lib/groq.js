import { createClient } from './supabase/client.js';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Models
const MODEL_CORE_ENGINE = 'qwen-2.5-32b'; // Qwen Core Engine (Alibaba Cloud / GroqLogix)
const MODEL_GUARDRAIL = 'llama-guard-3-8b'; // Llama Prompt Guard 2 Security Layer

/**
 * 2. SECURITY LAYER: Llama Prompt Guard 2
 * Verifies text input for prompt injection or illegal slot manipulation
 */
export async function validatePromptGuard(inputText) {
  if (!inputText || typeof inputText !== 'string' || !GROQ_API_KEY) return { safe: true };

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_GUARDRAIL,
        messages: [
          { role: 'user', content: inputText }
        ],
        temperature: 0.0,
      }),
    });

    if (!response.ok) {
      return { safe: true }; // Fallback safe on network error
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    if (result && result.toLowerCase().includes('unsafe')) {
      return { safe: false, reason: 'Peringatan Keamanan: Teks mengandung instruksi ilegal atau manipulasi slot.' };
    }

    return { safe: true };
  } catch (err) {
    console.warn('Security Guardrail check warning:', err);
    return { safe: true };
  }
}

/**
 * BATCHING & CACHING STRATEGY
 * Fetch cached CongestionScore from Supabase PostgreSQL DB to respect 30 RPM / 8K TPM rate limit
 */
export async function getCachedCongestionScore(zoneId) {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from('congestion_scores')
      .select('*')
      .eq('zone_id', zoneId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      // Check if cache is fresh (< 5 minutes)
      const cacheAgeMs = Date.now() - new Date(data.calculated_at).getTime();
      if (cacheAgeMs < 5 * 60 * 1000) {
        return {
          score: Number(data.score),
          activeTrucks: data.active_trucks,
          isCached: true,
        };
      }
    }
  } catch (e) {
    console.warn('DB Cache read warning:', e);
  }
  return null;
}

/**
 * TAHAP 1: PERENCANAAN & OPTIMALISASI AI (GroqLogix Engine)
 * CongestionScore AI & LoadBalancer AI with Qwen/Qwen3.8-27B
 */
export async function runGroqLogixOptimization({ zoneId, zoneName, requestedTime, activeTrucksCount = 5, capacityMax = 15 }) {
  // 1. Check Batching & Caching Strategy
  const cached = await getCachedCongestionScore(zoneId);
  if (cached) {
    // If score is high (>= 7.0), calculate slot re-balance offset
    let adjustedTime = requestedTime;
    let isRebalanced = false;

    if (cached.score >= 7.0) {
      isRebalanced = true;
      // Rebalance shift offset +30 mins (e.g. 10.00 -> 10.30 WIB)
      const [hours, mins] = requestedTime.split('.').map(Number);
      const totalMins = (hours * 60) + (mins || 0) + 30;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      adjustedTime = `${String(newH).padStart(2, '0')}.${String(newM).padStart(2, '0')}`;
    }

    return {
      congestionScore: cached.score,
      statusLabel: cached.score >= 7.5 ? 'Macet Parah' : cached.score >= 5.0 ? 'Sedang' : 'Lancar',
      isRebalanced,
      recommendedSlotTime: adjustedTime,
      originalTime: requestedTime,
      activeTrucks: cached.activeTrucks,
      source: 'PostgreSQL/PostGIS Cache (5-Min Batching)',
    };
  }

  // 2. Fallback / Direct AI Execution via Groq API (Qwen 27B / 32B Engine)
  if (!GROQ_API_KEY) {
    const ratio = activeTrucksCount / (capacityMax || 10);
    const score = Math.round(Math.min(9.8, Math.max(1.0, ratio * 10)) * 10) / 10;
    const isHigh = score >= 7.0;

    let adjustedTime = requestedTime;
    if (isHigh) {
      const parts = requestedTime.split('.');
      const h = Number(parts[0]) || 10;
      const m = Number(parts[1]) || 0;
      const total = h * 60 + m + 30;
      adjustedTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}.${String(total % 60).padStart(2, '0')}`;
    }

    return {
      congestionScore: score,
      statusLabel: score >= 7.5 ? 'Macet Parah' : score >= 5.0 ? 'Sedang' : 'Lancar',
      isRebalanced: isHigh,
      recommendedSlotTime: adjustedTime,
      originalTime: requestedTime,
      activeTrucks: activeTrucksCount,
      explanation: 'LoadBalancer AI memecah jadwal kedatangan secara otomatis untuk menghindari antrean bahu jalan.',
      source: 'LoadBalancer AI Engine',
    };
  }

  try {
    const prompt = `Analisis kepadatan zona logistik perkotaan "${zoneName}" (Kapasitas: ${capacityMax} slot, Truk Aktif: ${activeTrucksCount}, Jam Minta: ${requestedTime}).
Berikan respon JSON murni dengan format berikut tanpa teks ekstra:
{
  "score": number (1.0 - 10.0),
  "status": string ("Lancar" | "Sedang" | "Macet Parah"),
  "needRebalance": boolean,
  "adjustedTime": string ("HH.MM"),
  "explanation": string
}`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_CORE_ENGINE,
        messages: [
          {
            role: 'system',
            content: 'Anda adalah LoadBalancer AI & CongestionScore AI untuk UrbanLoad.AI. Tugas Anda menganalisis kluster data koordinat spasial dan memecah jadwal booking secara optimal jika terjadi penumpukan truk.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API Status ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content || '';

    // Parse JSON response
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    const score = parsed?.score ? Number(parsed.score) : Math.min(9.5, Math.round(((activeTrucksCount / capacityMax) * 10) * 10) / 10);
    const needRebalance = parsed?.needRebalance ?? (score >= 7.0);

    let adjustedTime = requestedTime;
    if (needRebalance) {
      const parts = requestedTime.split('.');
      const h = Number(parts[0]) || 10;
      const m = Number(parts[1]) || 0;
      const total = h * 60 + m + 30;
      adjustedTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}.${String(total % 60).padStart(2, '0')}`;
    }

    // Cache result in Supabase Database
    const supabase = createClient();
    await supabase.from('congestion_scores').insert({
      zone_id: zoneId,
      score: score,
      active_trucks: activeTrucksCount,
      calculated_at: new Date().toISOString(),
    });

    return {
      congestionScore: score,
      statusLabel: parsed?.status || (score >= 7.5 ? 'Macet Parah' : score >= 5.0 ? 'Sedang' : 'Lancar'),
      isRebalanced: needRebalance,
      recommendedSlotTime: parsed?.adjustedTime || adjustedTime,
      originalTime: requestedTime,
      activeTrucks: activeTrucksCount,
      explanation: parsed?.explanation || 'LoadBalancer AI memecah jadwal kedatangan untuk mencegah penumpukan di lokasi bongkar muat.',
      source: 'GroqLogix Engine (Qwen 27B/32B)',
    };
  } catch (err) {
    console.warn('GroqLogix direct API call fallback:', err);
    const ratio = activeTrucksCount / (capacityMax || 10);
    const score = Math.round(Math.min(9.8, Math.max(1.0, ratio * 10)) * 10) / 10;
    const isHigh = score >= 7.0;

    let adjustedTime = requestedTime;
    if (isHigh) {
      const parts = requestedTime.split('.');
      const h = Number(parts[0]) || 10;
      const m = Number(parts[1]) || 0;
      const total = h * 60 + m + 30;
      adjustedTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}.${String(total % 60).padStart(2, '0')}`;
    }

    return {
      congestionScore: score,
      statusLabel: score >= 7.5 ? 'Macet Parah' : score >= 5.0 ? 'Sedang' : 'Lancar',
      isRebalanced: isHigh,
      recommendedSlotTime: adjustedTime,
      originalTime: requestedTime,
      activeTrucks: activeTrucksCount,
      explanation: 'LoadBalancer AI memecah jadwal kedatangan secara otomatis untuk menghindari antrean bahu jalan.',
      source: 'LoadBalancer AI Engine',
    };
  }
}
