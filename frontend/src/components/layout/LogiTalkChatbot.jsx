import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Sparkles, User, ShieldAlert, CheckCircle2, Truck, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { validatePromptGuard } from '../../lib/groq.js';
import { createClient } from '../../lib/supabase/client.js';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'qwen-2.5-32b';

export function LogiTalkChatbot({ isOpen: externalIsOpen, onClose: externalOnClose }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose || setInternalIsOpen;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! Saya **LogiTalk AI Assistant** resmi platform UrbanLoad.AI 🚚.\nAda yang bisa saya bantu terkait jadwal slot bongkar muat, analisis kepadatan zona, atau bantuan navigasi logistik hari ini?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      // 1. Guardrail Safety Check
      const guardCheck = await validatePromptGuard(textToSend);
      if (!guardCheck.safe) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ **Security Alert:** ${guardCheck.reason || 'Sistem menolak instruksi yang berpotensi memanipulasi data slot atau mengandung prompt injection.'}`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            isWarning: true,
          },
        ]);
        setLoading(false);
        return;
      }

      // Fetch zone context from Supabase DB to give accurate answers
      const supabase = createClient();
      const { data: zones } = await supabase.from('zones').select('name, max_truck_capacity').limit(5);
      const zoneContext = zones && zones.length > 0
        ? zones.map(z => `- ${z.name} (Kapasitas Maksimal: ${z.max_truck_capacity} slot/bay)`).join('\n')
        : '- Pasar Tanah Abang Cluster A\n- Pelabuhan Tanjung Priok Port 3\n- Kawasan Industri Pulogadung';

      const systemPrompt = `Anda adalah LogiTalk AI Chatbot resmi dari platform UrbanLoad.AI.
Tugas Anda adalah membantu Kurir Logistik, Admin Pengelola Kota, dan Petugas Dishub dalam:
1. Memeriksa ketersediaan slot bongkar muat di zona logistik.
2. Memberikan rekomendasi waktu kedatangan agar terhindar dari kemacetan (LoadBalancer AI).
3. Mengarahkan pengguna untuk memesan slot, memverifikasi QuickPass QR, atau melaporkan pelanggaran bahu jalan.
4. Menjawab pertanyaan seputar regulasi jam operasional truk perkotaan.

Daftar Zona Logistik Aktif Saat Ini:
${zoneContext}

Format jawaban Anda: Ramah, profesional, menggunakan Bahasa Indonesia yang ringkas dan terstruktur (gunakan bullet points jika perlu).`;

      if (!GROQ_API_KEY) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Terima kasih pertanyaannya tentang "${textToSend}".\n\n- **Analisis AI:** Zona logistik utama dalam kondisi normal.\n- **Rekomendasi:** Untuk pemesanan slot tanpa antri, disarankan memilih waktu di luar jam sibuk (10.00–14.00 WIB).\n- **Aksi:** Anda dapat memesan slot baru melalui menu **[Pesan Slot Baru]** di dashboard.`,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: textToSend },
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponseText = data.choices?.[0]?.message?.content || 'Maaf, LogiTalk AI belum bisa memproses permintaan Anda saat ini.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('LogiTalk AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Maaf, terjadi kendala koneksi ke server LogiTalk AI Engine. Silakan coba beberapa saat lagi.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-200">
      {/* Full Screen Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-4 sm:px-8 py-4 flex items-center justify-between border-b border-teal-800/40 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600/30 border border-teal-400/30 rounded-2xl text-teal-300 shadow-inner">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-white">
              LogiTalk AI Assistant <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs text-teal-300/80 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
              <span>Groq Logix AI Engine (Qwen 32B Active)</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-white px-4 py-2 rounded-2xl border border-slate-700 transition font-bold text-xs shadow-md"
        >
          <X className="h-4 w-4" /> Tutup Mode Fullscreen
        </button>
      </div>

      {/* Messages Body (Centered Container for readability) */}
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="p-2 bg-teal-600 text-white rounded-2xl h-9 w-9 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="h-5 w-5" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl shadow-sm text-xs sm:text-sm leading-relaxed space-y-2 ${
                m.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none font-medium'
                  : m.isWarning
                  ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-none font-semibold'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-normal'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <span
                className={`block text-[10px] font-mono text-right ${
                  m.role === 'user' ? 'text-teal-100' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>

            {m.role === 'user' && (
              <div className="p-2 bg-slate-800 text-white rounded-2xl h-9 w-9 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-slate-500 font-mono text-xs bg-white p-3.5 rounded-2xl border border-slate-200 w-max shadow-sm animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" /> LogiTalk AI sedang menganalisis data spasial...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Controls & Input Area */}
      <div className="border-t border-slate-200 bg-white p-4 shrink-0 shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto text-xs no-scrollbar pb-1">
            <button
              onClick={() => handleSend('Berapa skor kemacetan zona saat ini?')}
              className="shrink-0 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-full border border-teal-200 font-bold transition flex items-center gap-1.5"
            >
              <Truck className="h-3.5 w-3.5 text-teal-600" /> Skor Kepadatan Zona
            </button>
            <button
              onClick={() => handleSend('Bagaimana cara memesan slot bongkar muat baru?')}
              className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 font-semibold transition"
            >
              🚚 Cara Pesan Slot
            </button>
            <button
              onClick={() => handleSend('Cara memverifikasi tiket QuickPass QR')}
              className="shrink-0 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 font-semibold transition"
            >
              🎟️ Verifikasi QuickPass QR
            </button>
            <button
              onClick={() => handleSend('Bagaimana cara melaporkan parkir liar bahu jalan?')}
              className="shrink-0 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-full border border-red-200 font-semibold transition"
            >
              🚨 Lapor Parkir Liar
            </button>
          </div>

          {/* Full Width Input Area */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanyakan ke LogiTalk AI tentang slot, lokasi zona, atau kemacetan..."
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-teal-500 focus:bg-white transition text-slate-800 placeholder-slate-400 font-medium"
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shrink-0 shadow-md disabled:opacity-50 flex items-center gap-2 text-xs sm:text-sm"
            >
              <span>Kirim</span> <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
