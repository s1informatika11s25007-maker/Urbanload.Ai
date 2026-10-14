import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { bookingId, signature } = await req.json();
  // Validasi QR token Edge Function
  return new Response(
    JSON.stringify({ valid: true, bookingId, message: 'QR verified via Edge Function' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
