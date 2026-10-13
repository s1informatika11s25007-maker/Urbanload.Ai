import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import {
  fetchDecisionLogs,
  runWhatIfAnalysis,
  fetchSystemConfigs,
  fetchIllegalDwellClusters,
  sendLLMMessage
} from '../../lib/api/bookings.js';
import {
  Sliders,
  Play,
  FileText,
  AlertTriangle,
  Cpu,
  Layers,
  BarChart3,
  RefreshCw,
  Send,
  HelpCircle,
  Database
} from 'lucide-react';

export function CityAdminPanel() {
  const [activeTab, setActiveTab] = useState('decision_logs');

  // Decision Logs state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // What-If state
  const [seed, setSeed] = useState(42);
  const [totalVehicles, setTotalVehicles] = useState(25);
  const [additionalBays, setAdditionalBays] = useState(2);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [runningWhatIf, setRunningWhatIf] = useState(false);

  // Clusters state
  const [clusters, setClusters] = useState([]);
  const [loadingClusters, setLoadingClusters] = useState(false);

  // System Configs state
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // LLM Assistant state
  const [llmQuery, setLlmQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo! Saya Asisten AI UrbanLoad. Silakan tanyakan kondisi zona, simulasi kebijakan, atau analisis kemacetan.'
    }
  ]);
  const [loadingLLM, setLoadingLLM] = useState(false);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetchDecisionLogs();
      if (res.success && res.data?.logs) {
        setLogs(res.data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRunWhatIf = async () => {
    setRunningWhatIf(true);
    try {
      const res = await runWhatIfAnalysis({
        seed: Number(seed),
        totalVehicles: Number(totalVehicles),
        additionalBays: Number(additionalBays)
      });
      if (res.success && res.data) {
        setWhatIfResult(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningWhatIf(false);
    }
  };

  const loadClusters = async () => {
    setLoadingClusters(true);
    try {
      const res = await fetchIllegalDwellClusters();
      if (res.success && res.data?.clusters) {
        setClusters(res.data.clusters);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingClusters(false);
    }
  };

  const loadConfigs = async () => {
    setLoadingConfigs(true);
    try {
      const res = await fetchSystemConfigs();
      if (res.success && res.data?.configs) {
        setConfigs(res.data.configs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfigs(false);
    }
  };

  const handleSendLLM = async (e) => {
    e.preventDefault();
    if (!llmQuery.trim()) return;

    const userText = llmQuery;
    setLlmQuery('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoadingLLM(true);

    try {
      const res = await sendLLMMessage(userText);
      const reply = res.data?.assistantResponse || 'Respon diproses oleh engine deterministik.';
      const toolExec = res.data?.toolExecution;

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          toolExecution: toolExec
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Gagal memproses pesan: ${err.message}` }
      ]);
    } finally {
      setLoadingLLM(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'decision_logs') loadLogs();
    if (activeTab === 'what_if' && !whatIfResult) handleRunWhatIf();
    if (activeTab === 'clusters') loadClusters();
    if (activeTab === 'configs') loadConfigs();
  }, [activeTab]);

  return (
    <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" /> Executive Analytics & Decision Audit Control
          </h2>
          <p className="text-xs text-slate-500">
            Panel Pengambil Keputusan Dishub & Bappeda untuk Audit Solver, What-If, dan Kluster Henti Liar.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('decision_logs')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              activeTab === 'decision_logs' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-teal-600" /> Decision Logs
          </button>
          <button
            onClick={() => setActiveTab('what_if')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              activeTab === 'what_if' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-amber-600" /> What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              activeTab === 'clusters' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Kluster Henti Liar
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              activeTab === 'configs' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-blue-600" /> Parameter Konfigurasi
          </button>
          <button
            onClick={() => setActiveTab('llm')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              activeTab === 'llm' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-indigo-600" /> UrbanLoad AI Copilot
          </button>
        </div>
      </div>

      {/* TAB 1: DECISION LOGS */}
      {activeTab === 'decision_logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Append-Only Audit Trail Log Keputusan Solver</span>
            <Button variant="outline" onClick={loadLogs} className="text-xs flex items-center gap-1">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? 'animate-spin' : ''}`} /> Refresh Log
            </Button>
          </div>

          {loadingLogs ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat log keputusan...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border">Belum ada decision log tercatat. Buat booking baru untuk menguji solver.</div>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Zona & Bay</th>
                    <th className="p-3">Status Solver</th>
                    <th className="p-3">Evaluasi</th>
                    <th className="p-3">Alasan Keputusan & Kendala</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 font-semibold">
                        {log.zone_name || 'Zona'} — Bay {log.bay_number || 'A1'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.solver_status === 'optimal_proven'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : log.solver_status === 'best_within_time'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {log.solver_status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {log.alternatives_evaluated} kandidat
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs">
                        {log.decision_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WHAT-IF SIMULATOR */}
      {activeTab === 'what_if' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900 font-semibold">
            <span className="flex items-center gap-1.5"><Sliders className="h-4 w-4 text-amber-600" /> Simulator Kebijakan What-If (Eksperimen Tanpa Mengubah Data Produksi)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px]">SIMULASI</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Seed PRNG (Deterministik)</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full p-2 border rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Total Kendaraan Simulasi</label>
              <input
                type="number"
                value={totalVehicles}
                onChange={(e) => setTotalVehicles(e.target.value)}
                className="w-full p-2 border rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kebijakan: Tambah Bay Bongkar Muat</label>
              <input
                type="number"
                value={additionalBays}
                onChange={(e) => setAdditionalBays(e.target.value)}
                className="w-full p-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <Button
            onClick={handleRunWhatIf}
            disabled={runningWhatIf}
            className="w-full py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
          >
            {runningWhatIf ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Jalankan Simulasi Kebijakan What-If
          </Button>

          {whatIfResult && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-slate-50 border space-y-2">
                  <span className="text-xs font-bold text-slate-600 block border-b pb-1">Kondisi Exsisting (Baseline Controlled)</span>
                  <div className="text-2xl font-black text-slate-900">{whatIfResult.baselineScenario.spilloverMeterMinutes} <span className="text-xs font-normal text-slate-500">meter-menit</span></div>
                  <div className="text-xs text-slate-500">Total Waktu Tunggu: {whatIfResult.baselineScenario.totalWaitMinutes} menit</div>
                </Card>

                <Card className="p-4 bg-emerald-50 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 block border-b border-emerald-200 pb-1 flex items-center justify-between">
                    <span>Setelah Kebijakan Baru (+{additionalBays} Bay)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px]">SIMULASI</span>
                  </span>
                  <div className="text-2xl font-black text-emerald-800">{whatIfResult.policyScenario.spilloverMeterMinutes} <span className="text-xs font-normal text-emerald-600">meter-menit</span></div>
                  <div className="text-xs text-emerald-700">Total Waktu Tunggu: {whatIfResult.policyScenario.totalWaitMinutes} menit</div>
                </Card>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-1 text-xs text-teal-900">
                <div className="font-bold flex items-center gap-1.5 text-teal-800">
                  Dampak Kebijakan Terhadap Kota:
                </div>
                <p>• Penurunan Luberan Antrean: <span className="font-bold">{whatIfResult.deltaImpact.spilloverReductionPercent}%</span> ({whatIfResult.deltaImpact.spilloverReductionAbsoluteMeterMin} meter-menit dihindari)</p>
                <p>• Penghematan Waktu Tunggu: <span className="font-bold">{whatIfResult.deltaImpact.waitTimeReductionAbsoluteMinutes} menit</span></p>
                <p>• Estimasi BBM Idle Dihemat: <span className="font-bold">{whatIfResult.deltaImpact.extraIdleFuelSavedLiters} liter</span> (~{whatIfResult.deltaImpact.extraCo2ReducedKg} kg CO2 dihindari)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KLUSTER HENTI LIAR */}
      {activeTab === 'clusters' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Deteksi Henti Liar Bahu Jalan via PostGIS Spatial Clustering (ST_ClusterDBSCAN)</span>
            <Button variant="outline" onClick={loadClusters} className="text-xs flex items-center gap-1">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingClusters ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>

          {loadingClusters ? (
            <div className="p-8 text-center text-xs text-slate-400">Memproses kluster PostGIS...</div>
          ) : clusters.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border">Tidak ada kluster henti liar terdeteksi melampaui ambang batas.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clusters.map((c) => (
                <Card key={c.clusterId} className="p-4 border border-rose-200 bg-rose-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-900 text-xs">Kluster Henti Liar #{c.clusterId + 1}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">{c.vehicleCount} Truk</span>
                  </div>
                  <div className="text-xs text-slate-600 font-mono">
                    Koordinat Centroid: {c.centroid.lat.toFixed(5)}, {c.centroid.lng.toFixed(5)}
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">
                    Rata-rata Dwell Time: {c.avgDwellMin} menit di bahu jalan
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM CONFIGS */}
      {activeTab === 'configs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Tabel Parameter Konfigurasi Domain System Config (Tanpa Hardcode)</span>
            <Button variant="outline" onClick={loadConfigs} className="text-xs flex items-center gap-1">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingConfigs ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>

          {loadingConfigs ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat tabel konfigurasi...</div>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Key Parameter</th>
                    <th className="p-3">Nilai</th>
                    <th className="p-3">Satuan</th>
                    <th className="p-3">Sumber Parameter</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-800">
                  {configs.map((cfg) => (
                    <tr key={cfg.key} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-teal-800 font-bold">{cfg.key}</td>
                      <td className="p-3 font-mono font-black">{JSON.stringify(cfg.value)}</td>
                      <td className="p-3 font-mono text-slate-500">{cfg.unit}</td>
                      <td className="p-3 text-slate-600">{cfg.source}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          cfg.status === 'literature'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : cfg.status === 'field_survey'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {cfg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: URBANLOAD AI COPILOT */}
      {activeTab === 'llm' && (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-medium">
            UrbanLoad AI Copilot — Asisten Cerdas Pengambil Keputusan Logistik. AI menganalisis kondisi zona & mensimulasikan kebijakan menggunakan tool terintegrasi.
          </div>

          <div className="h-64 overflow-y-auto border rounded-xl p-4 space-y-3 bg-slate-50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-xl text-xs space-y-1 ${
                  msg.role === 'user'
                    ? 'ml-auto bg-teal-600 text-white font-medium'
                    : 'bg-white border text-slate-800 shadow-sm'
                }`}
              >
                <p>{msg.text}</p>
                {msg.toolExecution && (
                  <div className="p-2 bg-slate-100 rounded border font-mono text-[10px] text-slate-600 mt-1">
                    Tool Executed: <span className="font-bold text-teal-700">{msg.toolExecution.toolName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendLLM} className="flex gap-2">
            <input
              type="text"
              value={llmQuery}
              onChange={(e) => setLlmQuery(e.target.value)}
              placeholder="Tanyakan ke asisten LLM (mis. 'Berapa kapasitas zona Tanah Abang?')"
              className="flex-1 p-2.5 border rounded-xl text-xs focus:border-teal-600 font-medium"
            />
            <Button type="submit" disabled={loadingLLM || !llmQuery.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4">
              {loadingLLM ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
