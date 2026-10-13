import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { queryDb } from '../../../src/config/db';
import { runABSimulation } from '../../../src/engine/simulator';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'qwen-2.5-32b';

async function executeTool(toolName: string, args: any) {
  if (toolName === 'get_zone_state') {
    const zoneRows = await queryDb('SELECT id, name, max_truck_capacity FROM public.zones WHERE id = $1', [args.zoneId]);
    if (zoneRows.length === 0) return { error: `Zona ID ${args.zoneId} tidak ditemukan.` };
    const bookingRows = await queryDb('SELECT COUNT(*) as count FROM public.bookings WHERE zone_id = $1 AND status IN (\'confirmed\', \'active\')', [args.zoneId]);
    return {
      zoneName: zoneRows[0].name,
      capacity: zoneRows[0].max_truck_capacity,
      activeBookingsCount: Number(bookingRows[0].count)
    };
  }

  if (toolName === 'run_simulation') {
    const sim = runABSimulation({
      seed: args.seed || 42,
      totalVehicles: args.totalVehicles || 20,
      kerbCapacityMeters: 30.0,
      stagingCapacityMeters: 50.0,
      idleFuelRateLHr: 2.5,
      co2EmissionFactorKgL: 2.68,
      noShowRate: 0.10,
      truckLengthMeanM: 8.0,
      safetyGapM: 2.0
    });
    return {
      seed: sim.seed,
      baselineSpilloverMeterMin: sim.baseline.spilloverMeterMinutes,
      controlledSpilloverMeterMin: sim.controlled.spilloverMeterMinutes,
      reductionPercent: sim.impact.spilloverReductionPercent,
      fuelSavedLiters: sim.impact.idleFuelSavedLiters
    };
  }

  if (toolName === 'propose_reschedule') {
    return {
      proposedOffsetMin: 30,
      reason: 'Penyebaran jadwal kedatangan untuk menghindari puncak antrean bahu jalan'
    };
  }

  return { error: `Tool ${toolName} tidak dikenal.` };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return sendError(res, 'Metode HTTP tidak diizinkan. Gunakan POST.', 405);
  }

  try {
    const { message, zoneId } = req.body || {};
    if (!message) {
      return sendError(res, 'Parameter message wajib diisi.', 400);
    }

    if (!GROQ_API_KEY) {
      return sendSuccess(res, {
        assistantResponse: 'Asisten AI dalam mode siap siaga (Groq API Key tidak dikonfigurasi). Sistem operasional deterministik inti tetap berjalan normal.',
        toolExecution: null,
        isFallback: true
      });
    }

    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_zone_state',
          description: 'Mengambil status terkini kapasitas dan jumlah truk aktif di zona logistik',
          parameters: {
            type: 'object',
            properties: { zoneId: { type: 'string' } },
            required: ['zoneId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'run_simulation',
          description: 'Jalankan simulasi A/B dampaknya terhadap meter-menit luberan',
          parameters: {
            type: 'object',
            properties: {
              seed: { type: 'number' },
              totalVehicles: { type: 'number' }
            }
          }
        }
      }
    ];

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: 'Anda adalah asisten operasi Smart City UrbanLoad.AI. Gunakan tool deterministik untuk mendapatkan data factual sebelum menjawab.' },
          { role: 'user', content: message }
        ],
        tools,
        tool_choice: 'auto',
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error Status ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    let toolResult = null;

    if (choice?.tool_calls && choice.tool_calls.length > 0) {
      const toolCall = choice.tool_calls[0];
      const fnName = toolCall.function.name;
      const fnArgs = JSON.parse(toolCall.function.arguments || '{}');

      if (fnName === 'get_zone_state' && !fnArgs.zoneId) {
        fnArgs.zoneId = zoneId || '00000000-0000-0000-0000-000000000001';
      }

      toolResult = await executeTool(fnName, fnArgs);

      const secondResponse = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: 'Anda adalah asisten UrbanLoad. Rangkum hasil analisis data deterministik berikut dengan ringkas.' },
            { role: 'user', content: message },
            choice,
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            }
          ]
        })
      });

      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        const finalContent = secondData.choices?.[0]?.message?.content;
        return sendSuccess(res, {
          assistantResponse: finalContent,
          toolExecution: {
            toolName: fnName,
            args: fnArgs,
            output: toolResult
          }
        });
      }
    }

    return sendSuccess(res, {
      assistantResponse: choice?.content || 'UrbanLoad AI Engine telah menganalisis permintaan Anda.',
      toolExecution: toolResult
    });

  } catch (err: any) {
    return sendSuccess(res, {
      assistantResponse: `Asisten AI UrbanLoad: ${err.message}. Layanan deterministik tetap beroperasi normal.`,
      toolExecution: null,
      isFallback: true
    });
  }
}
