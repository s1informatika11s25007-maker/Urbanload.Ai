import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /ignore\s+all\s+rules/i,
  /system\s+prompt/i,
  /drop\s+table/i,
  /select\s+\*\s+from/i,
  /jailbreak/i,
  /bypass\s+geofence/i,
  /override\s+capacity/i,
  /grant\s+unrestricted/i,
];

function validatePrompt(input: string) {
  if (!input) return { isSafe: true, score: 0.0 };
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isSafe: false,
        score: 0.95,
        reason: `[Zero-Trust Interceptor] Terdeteksi prompt injection: '${pattern.source}'`
      };
    }
  }
  return { isSafe: true, score: 0.05 };
}

function validateSpatialVelocity(currLat: number, currLng: number, prevLat?: number, prevLng?: number, timeDiffSec?: number) {
  if (!prevLat || !prevLng || !timeDiffSec || timeDiffSec <= 0) {
    return { isGPSSpoofed: false, speedKmh: 0 };
  }
  const R = 6371;
  const dLat = (currLat - prevLat) * (Math.PI / 180);
  const dLng = (currLng - prevLng) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(prevLat * (Math.PI / 180)) * Math.cos(currLat * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = R * c;
  const speedKmh = (distKm / (timeDiffSec / 3600));
  const isGPSSpoofed = speedKmh > 160.0;

  return { isGPSSpoofed, speedKmh: Number(speedKmh.toFixed(1)) };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { promptText, lat, lng, prevLat, prevLng, timeDiffSec } = await req.json();

    const promptResult = validatePrompt(promptText || '');
    if (!promptResult.isSafe) {
      return new Response(
        JSON.stringify({ isSafe: false, error: promptResult.reason }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let velocityResult = { isGPSSpoofed: false, speedKmh: 0 };
    if (lat && lng) {
      velocityResult = validateSpatialVelocity(Number(lat), Number(lng), prevLat, prevLng, timeDiffSec);
      if (velocityResult.isGPSSpoofed) {
        return new Response(
          JSON.stringify({
            isSafe: false,
            isGPSSpoofed: true,
            error: `[GPS Spoofing Interceptor] Anomali kecepatan spasial ${velocityResult.speedKmh} km/h melebihi batas fisik kendaraan.`
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        isSafe: true,
        isGPSSpoofed: false,
        calculatedSpeedKmh: velocityResult.speedKmh,
        message: 'Permintaan terverifikasi aman oleh Database Edge Security Guard.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
