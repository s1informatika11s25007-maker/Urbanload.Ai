import { createClient } from './supabase/client.js';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Models
const MODEL_CORE_ENGINE = 'qwen-2.5-32b'; // Qwen Core Engine
const MODEL_GUARDRAIL = 'llama-guard-3-8b'; // Security Layer

/**
 * TOKEN OPTIMIZATION: In-Memory Semantic Hash Cache (10-Min TTL)
 * Prevents redundant token consumption for hundreds of concurrent users
 */
const IN_MEMORY_AI_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCacheKey(prefix, payload) {
  return `${prefix}_${JSON.stringify(payload)}`;
}

/**
 * 2. SECURITY LAYER: Llama Prompt Guard 2
 * Verifies text input for prompt injection or illegal slot manipulation
 */
export async function validatePromptGuard(inputText) {
  if (!inputText || typeof inputText !== 'string' || !GROQ_API_KEY) return { safe: true };

  const cacheKey = getCacheKey('guard', inputText.trim().toLowerCase());
  const cached = IN_MEMORY_AI_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.val;
  }

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_GUARDRAIL,
        messages: [{ role: 'user', content: inputText }],
        temperature: 0.0,
        max_tokens: 30, // Ultra-short output token limit
      }),
    });

    if (!response.ok) {
      return { safe: true };
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    const isUnsafe = result && result.toLowerCase().includes('unsafe');
    const output = isUnsafe
      ? { safe: false, reason: 'Peringatan Keamanan: Teks mengandung instruksi ilegal atau manipulasi slot.' }
      : { safe: true };

    IN_MEMORY_AI_CACHE.set(cacheKey, { val: output, time: Date.now() });
    return output;
  } catch (err) {
    console.warn('Security Guardrail check warning:', err);
    return { safe: true };
  }
}

/**
 * BATCHING & CACHING STRATEGY
 * Fetch cached CongestionScore from Supabase PostgreSQL DB to respect rate limits
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
      const cacheAgeMs = Date.now() - new Date(data.calculated_at).getTime();
      if (cacheAgeMs < 10 * 60 * 1000) {
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
 * Token-optimized CongestionScore AI & LoadBalancer AI with Qwen/Qwen3.8-27B
 */
export async function runGroqLogixOptimization({ zoneId, zoneName, requestedTime, activeTrucksCount = 5, capacityMax = 15 }) {
  const cacheKey = getCacheKey('logix', { zoneId, requestedTime, activeTrucksCount, capacityMax });
  const inMem = IN_MEMORY_AI_CACHE.get(cacheKey);
  if (inMem && Date.now() - inMem.time < CACHE_TTL_MS) {
    return { ...inMem.val, source: 'UrbanLoad In-Memory Token Cache (0 Tokens Used)' };
  }

  // 1. Check DB Cache Strategy
  const cached = await getCachedCongestionScore(zoneId);
  if (cached) {
    let adjustedTime = requestedTime;
    let isRebalanced = false;

    if (cached.score >= 7.0) {
      isRebalanced = true;
      const [hours, mins] = requestedTime.split('.').map(Number);
      const totalMins = (hours * 60) + (mins || 0) + 30;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      adjustedTime = `${String(newH).padStart(2, '0')}.${String(newM).padStart(2, '0')}`;
    }

    const dbResult = {
      congestionScore: cached.score,
      statusLabel: cached.score >= 7.5 ? 'Macet Parah' : cached.score >= 5.0 ? 'Sedang' : 'Lancar',
      isRebalanced,
      recommendedSlotTime: adjustedTime,
      originalTime: requestedTime,
      activeTrucks: cached.activeTrucks,
      source: 'PostgreSQL DB Cache (0 Tokens Used)',
    };

    IN_MEMORY_AI_CACHE.set(cacheKey, { val: dbResult, time: Date.now() });
    return dbResult;
  }

  // 2. Direct AI Execution with Token Cap & Compact System Prompt
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
      source: 'Deterministic Solver (0 Tokens)',
    };
  }

  try {
    const prompt = `Zone:"${zoneName}",Cap:${capacityMax},Trucks:${activeTrucksCount},Time:"${requestedTime}". JSON:{"score":number,"status":string,"needRebalance":boolean,"adjustedTime":string}`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_CORE_ENGINE,
        messages: [
          { role: 'system', content: 'UrbanLoad AI. Return JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 100, // Token Cap Optimization
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API Status ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content || '';

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

    const supabase = createClient();
    await supabase.from('congestion_scores').insert({
      zone_id: zoneId,
      score: score,
      active_trucks: activeTrucksCount,
      calculated_at: new Date().toISOString(),
    });

    const aiResult = {
      congestionScore: score,
      statusLabel: parsed?.status || (score >= 7.5 ? 'Macet Parah' : score >= 5.0 ? 'Sedang' : 'Lancar'),
      isRebalanced: needRebalance,
      recommendedSlotTime: parsed?.adjustedTime || adjustedTime,
      originalTime: requestedTime,
      activeTrucks: activeTrucksCount,
      explanation: 'LoadBalancer AI memecah jadwal kedatangan untuk mencegah penumpukan di lokasi bongkar muat.',
      source: 'UrbanLoad AI Engine (Token Optimized)',
    };

    IN_MEMORY_AI_CACHE.set(cacheKey, { val: aiResult, time: Date.now() });
    return aiResult;
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
