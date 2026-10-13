import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, X, Trash2, RefreshCw } from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRealNotifications = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, zones(name)')
        .order('created_at', { ascending: false })
        .limit(6);

      if (bookings && bookings.length > 0) {
        const notifs = bookings.map((b) => {
          const createdAt = new Date(b.created_at || Date.now());
          const diffMins = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));
          const timeLabel = diffMins === 0 ? 'Baru saja' : `${diffMins} menit lalu`;

          return {
            id: `notif-${b.id}`,
            title: `SmartSlot AI — ${b.zones?.name || 'Zona Logistik'}`,
            message: `Booking slot logistik truk ${b.vehicle_plate || 'Truk'} dikonfirmasi status [${b.status}].`,
            time: timeLabel,
            type: b.status === 'confirmed' ? 'success' : b.status === 'active' ? 'info' : 'warning',
            unread: diffMins < 30,
          };
        });
        setNotifications(notifs);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error('Error loading real notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel('header_notifications_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const newNotif = {
          id: `notif-${payload.new.id}-${Date.now()}`,
          title: 'SmartSlot Realtime Booking',
          message: `Booking baru ${payload.new.vehicle_plate || 'Truk'} dikonfirmasi di database.`,
          time: 'Baru saja',
          type: 'success',
          unread: true,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRealNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition"
        title="Pemberitahuan Sistem Realtime"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 text-white border border-slate-700/80 rounded-3xl shadow-2xl p-4 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase text-teal-400 tracking-wider">
                Pemberitahuan Realtime Database
              </h4>
              {unreadCount > 0 && (
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-slate-400 hover:text-rose-400 text-[10px] font-bold flex items-center gap-1 transition"
                  title="Hapus Semua"
                >
                  <Trash2 className="h-3 w-3" /> Bersihkan
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2 mt-3 max-h-72 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-teal-400" /> Memuat pemberitahuan real...
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada notifikasi transaksi database.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 transition ${
                    n.unread
                      ? 'bg-slate-800/90 border-teal-500/40 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold flex items-center gap-1.5 text-teal-300">
                      {n.type === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                      {n.type === 'info' && <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />}
                      {n.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                      {n.title}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Tandai Semua Telah Dibaca
            </button>
          )}
        </div>
      )}
    </div>
  );
}
