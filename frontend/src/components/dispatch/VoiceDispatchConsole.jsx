import React, { useState, useRef } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { useToast } from '../ui/ToastNotification.jsx';
import {
  Mic,
  MicOff,
  Volume2,
  Siren,
  ShieldCheck,
  Radio,
  Send,
  Sparkles
} from 'lucide-react';

/**
 * [GAME-CHANGER] Voice-Driven Hands-Free Dispatch Console & Emergency Preemption
 * Uses Web Speech API (Chrome/Edge Native SpeechRecognition + SpeechSynthesis TTS)
 * with real-time Indonesian speech recognition (id-ID) and hands-free dispatch.
 */
export function VoiceDispatchConsole() {
  const { showToast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [loadingEmergency, setLoadingEmergency] = useState(false);

  const recognitionRef = useRef(null);

  const samplePresets = [
    'UrbanLoad, saya macet 20 menit di Palmerah, geser slot saya ke Bay 3',
    'UrbanLoad, cek ketersediaan Bay 2 di Tanah Abang',
    'UrbanLoad, konfirmasi check-in di Bay 1',
  ];

  // Speak response out loud using Web Speech Synthesis TTS
  const speakTextResponse = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendVoiceCommand = async (textToSend) => {
    const queryText = textToSend || transcript;
    if (!queryText.trim()) return;

    setLoadingVoice(true);
    try {
      const res = await fetch('https://gzxoodmqqrweknwghnzz.supabase.co/functions/v1/voice-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceText: queryText }),
      });
      const data = await res.json();

      if (data.success) {
        setVoiceResponse(data);
        speakTextResponse(data.audioResponseText);
        showToast({
          title: 'Dispatch Suara Diterima!',
          message: data.audioResponseText,
          type: 'success',
        });
      } else {
        showToast({
          title: 'Perintah Suara Ditolak',
          message: data.error || 'Gagal memproses dispatch suara.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        title: 'Error Layanan Dispatch',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoadingVoice(false);
      setIsListening(false);
    }
  };

  // Start Chrome / Web Speech API Native Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast({
        title: 'Web Speech Tidak Didukung',
        message: 'Gunakan Google Chrome atau Microsoft Edge untuk fitur pengenalan suara mikrofon langsung.',
        type: 'warning',
      });
      // Fallback: Fill sample query
      const sampleText = 'UrbanLoad, saya macet 20 menit di Palmerah, geser slot saya ke Bay 3';
      setTranscript(sampleText);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID'; // Bahasa Indonesia
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  const handleTriggerEmergencyPreemption = async () => {
    setLoadingEmergency(true);
    try {
      const res = await fetch('https://gzxoodmqqrweknwghnzz.supabase.co/functions/v1/voice-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEmergencySiren: true, emergencyVehicleType: 'AMBULANCE_GAJAH_MADA' }),
      });
      const data = await res.json();

      if (data.success) {
        setEmergencyActive(true);
        speakTextResponse('Peringatan preemption darurat aktif! Bahu jalan dikosongkan.');
        showToast({
          title: '🚨 PREEMPTION DARURAT AKTIF!',
          message: 'Bahu jalan dikosongkan otomatis untuk jalur darurat!',
          type: 'error',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmergency(false);
    }
  };

  return (
    <Card className="p-6 bg-slate-900 border-slate-800 text-white rounded-3xl shadow-2xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
              Voice-Driven Hands-Free Dispatch Console
            </h3>
            <p className="text-xs text-slate-400">
              Pengenalan Suara Mikrofon Langsung (Chrome Web Speech id-ID) & Siren Emergency Preemption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Web Speech API (id-ID)
          </span>
        </div>
      </div>

      {/* Voice Control Mic Block */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Input Suara Mikrofon Kabin:</span>
            {isListening && (
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Mendengarkan Mikrofon (Bicara Sekarang)...
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-2xl border transition flex items-center gap-2 font-bold text-xs ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-teal-600 text-white border-teal-500 hover:bg-teal-500 shadow-md'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Hentikan Mikrofon' : 'Mulai Bicara (Mikrofon Langsung)'}
          </button>
        </div>

        {/* Input Text Box or Voice Presets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder='Klik "Mulai Bicara" dan ucapkan: "UrbanLoad, saya macet 20 menit di Palmerah, geser slot saya ke Bay 3"'
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 font-mono"
            />
            <Button
              type="button"
              onClick={() => handleSendVoiceCommand()}
              disabled={loadingVoice || !transcript.trim()}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-4 py-2.5 font-bold rounded-xl"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-400 font-semibold">Preset Perintah Suara Cepat:</span>
            {samplePresets.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setTranscript(preset);
                  handleSendVoiceCommand(preset);
                }}
                className="text-[10px] bg-slate-900 border border-slate-700 hover:border-teal-500 text-slate-300 px-2.5 py-1 rounded-lg transition truncate max-w-[280px]"
              >
                "{preset}"
              </button>
            ))}
          </div>
        </div>

        {/* Audio Spoken Output Response Box */}
        {voiceResponse && (
          <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-500/40 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <Volume2 className="h-4 w-4 animate-bounce text-emerald-400" /> Respons Suara TTS Dispatched:
              </div>
              <button
                type="button"
                onClick={() => speakTextResponse(voiceResponse.audioResponseText)}
                className="text-[10px] text-teal-400 hover:text-teal-300 font-mono underline"
              >
                Putar Ulang Suara
              </button>
            </div>
            <p className="text-slate-200 font-mono italic">
              "{voiceResponse.audioResponseText}"
            </p>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-t border-teal-900/80 pt-1.5">
              <span>Target Bay: {voiceResponse.parsedIntent?.targetBay}</span>
              <span>Offset: +{voiceResponse.parsedIntent?.offsetMinutes} menit</span>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Siren Preemption Simulator Box */}
      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Siren className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-200">Simulasi Preemption Sirene Darurat Kota</h4>
            <p className="text-[11px] text-rose-300/80">
              Memicu pengosongan otomatis seluruh bay bahu jalan di lokasi PostGIS saat sirine terdeteksi.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleTriggerEmergencyPreemption}
          disabled={loadingEmergency}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-4 rounded-xl shrink-0 flex items-center gap-1.5 shadow-lg"
        >
          <Siren className="h-4 w-4" />
          {emergencyActive ? 'Preemption Darurat Aktif!' : 'Picu Preemption Sirene Darurat'}
        </Button>
      </div>
    </Card>
  );
}
