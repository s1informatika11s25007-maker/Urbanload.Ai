import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { useToast } from '../ui/ToastNotification.jsx';
import { createClient } from '../../lib/supabase/client.js';
import { Radio, RefreshCw, ShieldAlert, CheckCircle2, Clock, XCircle, MapPin, Eye, AlertOctagon } from 'lucide-react';

export function CitizenReportsFeed() {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('citizen_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (e) {
      console.error('Error fetching citizen reports:', e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    const supabase = createClient();
    const channel = supabase
      .channel('citizen_reports_feed_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizen_reports' }, () => {
        loadReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('citizen_reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (!error) {
        showToast({
          title: 'Status Laporan Diperbarui',
          message: `Laporan #${id.slice(0, 8)} kini berstatus "${newStatus.toUpperCase()}".`,
          type: 'success',
        });
        loadReports();
      }
    } catch (e) {
      console.error('Error updating report status:', e);
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-100 text-red-600 rounded-xl">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <h3 className="text-base font-black text-slate-900">Feed Laporan Masyarakat (CitizenReport)</h3>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full">
              <Radio className="h-3 w-3 text-red-600 animate-pulse" /> Live Realtime Dishub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dan tindak lanjuti laporan parkir liar & pemblokiran bahu jalan dari warga kota secara real-time.
          </p>
        </div>

        <Button onClick={loadReports} variant="outline" className="text-xs h-8 font-bold">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 font-semibold text-xs bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <p>{loading ? 'Memuat feed laporan masyarakat...' : 'Belum ada laporan pelanggaran dari warga.'}</p>
          </div>
        ) : (
          reports.map((r) => {
            const isPending = r.status === 'pending';
            const isInvestigating = r.status === 'investigating';
            const isResolved = r.status === 'resolved';

            return (
              <div
                key={r.id}
                className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 shadow-sm hover:border-red-300 transition relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{r.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isInvestigating
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : isResolved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {r.status === 'pending' ? 'Laporan Baru' : r.status === 'investigating' ? 'Diselidiki' : r.status === 'resolved' ? 'Selesai / Ditindak' : 'Ditolak'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {r.violation_type === 'parkir_bahu_jalan'
                        ? 'Parkir Liar di Bahu Jalan'
                        : r.violation_type === 'blokir_bay'
                        ? 'Blokir Bay (Tanpa QR)'
                        : r.violation_type === 'overtime'
                        ? 'Durasi Overtime Bongkar Muat'
                        : 'Muatan Overdimension'}
                    </h4>

                    {r.vehicle_plate && (
                      <span className="inline-block text-[11px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        Plat: {r.vehicle_plate}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 font-medium">
                    <div className="flex items-center gap-1 text-[11px] text-slate-700 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{r.location_name}</span>
                    </div>

                    {r.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 bg-white p-2 rounded-xl border border-slate-200 italic">
                        "{r.description}"
                      </p>
                    )}
                  </div>

                  {r.photo_url && (
                    <button
                      onClick={() => setSelectedPhoto(r.photo_url)}
                      className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative group cursor-pointer"
                    >
                      <img src={r.photo_url} alt="Foto Bukti" className="object-cover w-full h-full opacity-85 group-hover:opacity-100 transition" />
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Lihat Bukti Foto
                      </span>
                    </button>
                  )}
                </div>

                {/* Dishub Action Controls */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">Tindakan Petugas Dishub:</span>
                  <div className="flex items-center gap-1.5">
                    {r.status !== 'investigating' && (
                      <Button
                        onClick={() => updateStatus(r.id, 'investigating')}
                        variant="outline"
                        className="flex-1 text-[10px] py-1 h-7 font-bold border-blue-300 text-blue-800 hover:bg-blue-50"
                      >
                        Selidiki
                      </Button>
                    )}

                    {r.status !== 'resolved' && (
                      <Button
                        onClick={() => updateStatus(r.id, 'resolved')}
                        className="flex-1 text-[10px] py-1 h-7 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        Tindak & Sanksi
                      </Button>
                    )}

                    {r.status !== 'dismissed' && (
                      <Button
                        onClick={() => updateStatus(r.id, 'dismissed')}
                        variant="outline"
                        className="text-[10px] py-1 h-7 px-2 font-bold border-slate-200 text-slate-500 hover:bg-slate-100"
                      >
                        Tolak
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal View Photo */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-2 space-y-2">
            <div className="flex justify-between items-center px-2 pt-1 text-white text-xs font-bold">
              <span>Bukti Foto Pelanggaran (CitizenReport)</span>
              <button onClick={() => setSelectedPhoto(null)} className="text-slate-400 hover:text-white p-1">
                Tutup [X]
              </button>
            </div>
            <img src={selectedPhoto} alt="Bukti Foto Full" className="w-full max-h-[70vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </Card>
  );
}
