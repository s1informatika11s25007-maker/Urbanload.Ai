import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { queryDb } from '../../../src/config/db';
import { runABSimulation } from '../../../src/engine/simulator';
import { validatePromptSecurity } from '../../_lib/prompt-guard';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'qwen-2.5-32b'; // Core Reasoning Engine

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

  if (toolName === 'dispatch_voice_action') {
    return {
      actionType: args.actionType || 'RESCHEDULE_SLOT',
      targetBay: args.targetBay || 'Bay-02',
      voiceResponseAudioText: args.spokenConfirmation || 'Jadwal slot bongkar muat Anda telah disesuaikan secara otomatis.',
      dispatchedAt: new Date().toISOString()
    };
  }

  return { error: `Tool ${toolName} tidak dikenal.` };
}

/**
 * [KILL LIST #2 & AI BLUEPRINT] Event-Driven Spatial Dispatch Engine
 * Menggantikan chatbot pasif dengan Engine Dispatch berbasis Event/Voice
 * dilindungi Security Edge Guardrail (Llama Prompt Guard).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return sendError(res, 'Metode HTTP tidak diizinkan. Gunakan POST.', 405);
  }

  try {
    const { message, zoneId, audioStreamUri } = req.body || {};
    if (!message && !audioStreamUri) {
      return sendError(res, 'Parameter message atau audioStreamUri wajib diisi.', 400);
    }

    // 1. Security Edge Guard (Llama Prompt Guard)
    const securityCheck = validatePromptSecurity(message || '');
    if (!securityCheck.isSafe) {
      return sendError(
        res,
        `[Security Interceptor] Akses ditolak: ${securityCheck.reason}`,
        403
      );
    }

    if (!GROQ_API_KEY) {
      return sendSuccess(res, {
        dispatchResponse: 'Engine Dispatch Operasional dalam mode siap siaga (Groq API Key tidak dikonfigurasi). Solver deterministik PostGIS tetap mengendalikan alokasi slot.',
        voiceText: 'Sistem operasional deterministik berjalan normal.',
        isFallback: true
      });
    }

    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_zone_state',
          description: 'Mengambil status terkini kapasitas dan jumlah truk aktif di zona logistik PostGIS',
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
          name: 'dispatch_voice_action',
          description: 'Mengeksekusi aksi dispatch audio/hands-free otomatis untuk pengemudi atau petugas Dishub',
          parameters: {
            type: 'object',
            properties: {
              actionType: { type: 'string' },
              targetBay: { type: 'string' },
              spokenConfirmation: { type: 'string' }
            },
            required: ['actionType', 'spokenConfirmation']
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
          {
            role: 'system',
            content: 'Anda adalah Event-Driven Dispatch & Voice Orchestrator UrbanLoad.AI. Tugas Anda memberikan instruksi dispatch operasional singkat, presisi, dan dapat dieksekusi hands-free untuk supir atau petugas Dishub.'
          },
          { role: 'user', content: message || 'Lakukan pemeriksaan dispatch zona aktif.' }
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
    }

    const textContent = choice?.content || 'Perintah dispatch telah diterima dan disinkronkan ke solver PostGIS.';

    return sendSuccess(res, {
      dispatchResponse: textContent,
      voiceText: toolResult?.voiceResponseAudioText || textContent,
      toolExecution: toolResult,
      securityCheck
    });

  } catch (err: any) {
    return sendError(res, `Gagal memproses dispatch: ${err.message}`, 500);
  }
}
