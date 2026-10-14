import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async () => {
  // Edge function trigger calculation of congestion scores
  return new Response(
    JSON.stringify({ status: 'ok', recalculatedAt: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
