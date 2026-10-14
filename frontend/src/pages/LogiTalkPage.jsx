import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, User, ShieldCheck, Truck, HelpCircle, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { validatePromptGuard } from '../lib/groq.js';
import { createClient } from '../lib/supabase/client.js';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'qwen-2.5-32b';

export default function LogiTalkPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! Saya **LogiTalk AI Assistant** dari platform UrbanLoad.AI 🚚.\nAda yang bisa saya bantu terkait jadwal slot bongkar muat, analisis kepadatan zona, atau bantuan navigasi logistik hari ini?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Riwayat obrolan telah dibersihkan. Silakan tanyakan hal baru seputar slot logistik atau zona!',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Banner & Header LogiTalk AI */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600/30 border border-teal-400/30 rounded-2xl text-teal-300 shadow-inner">
            <Bot className="h-6 w-6 text-teal-300" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              LogiTalk AI Assistant <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-xs text-teal-300/80 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
              <span>Groq Logix Engine (Qwen 32B) • Llama Prompt Guard 2 Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleClearHistory}
            variant="outline"
            className="text-xs py-1.5 h-8 font-bold text-slate-300 border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Bersihkan Percakapan
          </Button>
        </div>
      </div>

      {/* Main Chat Conversation Viewport */}
      <Card className="flex-1 bg-white border-slate-200 shadow-sm rounded-3xl p-4 sm:p-6 flex flex-col overflow-hidden min-h-0">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
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
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl shadow-sm leading-relaxed space-y-1.5 ${
                  m.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-none font-medium'
                    : m.isWarning
                    ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-none font-semibold'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-none font-normal'
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
            <div className="flex gap-2.5 items-center text-slate-500 font-mono text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 w-max shadow-sm animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" /> LogiTalk AI sedang memproses analisis...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips & Input Form */}
        <div className="pt-3 border-t border-slate-100 space-y-3 shrink-0">
          {/* Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto text-xs no-scrollbar">
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

          {/* Input Area */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanyakan ke LogiTalk AI tentang ketersediaan slot, lokasi zona, atau kemacetan..."
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
      </Card>
    </div>
  );
}
