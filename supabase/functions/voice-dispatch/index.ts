import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { voiceText, isEmergencySiren, emergencyVehicleType } = payload;

    if (isEmergencySiren) {
      const vehicleType = emergencyVehicleType || 'AMBULANCE';
      const alertMsg = `🚨 PREEMPTION SISTER DARURAT AKTIF (Edge Function): Terdeteksi sirine ${vehicleType}. Bahu jalan dikosongkan otomatis!`;

      return new Response(
        JSON.stringify({
          success: true,
          preemptionActive: true,
          emergencyVehicleType: vehicleType,
          actionTaken: 'CLEAR_KERBSIDE_BAYS_POSTGIS',
          broadcastAlert: alertMsg,
          dispatchedAt: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanText = (voiceText || '').toLowerCase();
    let targetBay = 'Bay 3';
    let offsetMinutes = 20;

    if (cleanText.includes('bay 1')) targetBay = 'Bay 1';
    if (cleanText.includes('bay 2')) targetBay = 'Bay 2';
    if (cleanText.includes('bay 3')) targetBay = 'Bay 3';

    if (cleanText.includes('10 menit')) offsetMinutes = 10;
    if (cleanText.includes('20 menit')) offsetMinutes = 20;
    if (cleanText.includes('30 menit')) offsetMinutes = 30;

    const ttsResponse = `Siap, perintah suara diterima! Slot Anda telah digeser ${offsetMinutes} menit ke ${targetBay}. Utamakan keselamatan berbelok.`;

    return new Response(
      JSON.stringify({
        success: true,
        voiceTranscript: voiceText,
        parsedIntent: {
          action: 'RESCHEDULE_SLOT',
          offsetMinutes,
          targetBay
        },
        audioResponseText: ttsResponse,
        dispatchedAt: new Date().toISOString()
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
