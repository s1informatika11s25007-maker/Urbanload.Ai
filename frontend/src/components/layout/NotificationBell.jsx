import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, X, Trash2, RefreshCw, Zap } from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';

const STORAGE_CLEARED_TIME = 'urbanload_notif_cleared_time';
const STORAGE_READ_TIME = 'urbanload_notif_read_time';
const STORAGE_DISMISSED_IDS = 'urbanload_notif_dismissed_ids';

function getClearedTime() {
  try {
    return parseInt(localStorage.getItem(STORAGE_CLEARED_TIME) || '0', 10);
  } catch {
    return 0;
  }
}

function getReadTime() {
  try {
    return parseInt(localStorage.getItem(STORAGE_READ_TIME) || '0', 10);
  } catch {
    return 0;
  }
}

function getDismissedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_DISMISSED_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDismissedId(id) {
  try {
    const list = getDismissedIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(STORAGE_DISMISSED_IDS, JSON.stringify(list.slice(-50)));
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Format relative time intelligently in Indonesian.
 */
function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Baru saja';
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (isNaN(diffMs) || diffMs < 0) {
    return 'Baru saja';
  }

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) {
    return 'Baru saja';
  }

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return `${diffMins} menit lalu`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} hari lalu`;
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Build dynamic notification object and check against persistence state.
 */
function formatBookingNotification(b, eventType = 'SELECT', clearedTime = 0, readTime = 0, dismissedIds = []) {
  const createdAtMs = new Date(b.created_at || b.updated_at || Date.now()).getTime();

  // If created before clearedTime or dismissed, skip this notification
  if (clearedTime > 0 && createdAtMs <= clearedTime) {
    return null;
  }

  const bookingId = b.id;
  if (dismissedIds.includes(bookingId) || dismissedIds.includes(`notif-${bookingId}`)) {
    return null;
  }

  const zoneName = b.zones?.name || b.zone_name || 'Zona Logistik';
  const vehicle = b.vehicle_plate || 'Truk Logistik';
  const timeLabel = formatRelativeTime(b.created_at || b.updated_at || Date.now());

  let title = `SmartSlot AI — ${zoneName}`;
  let message = '';
  let type = 'info';

  if (eventType === 'DELETE') {
    title = `SmartSlot AI — ${zoneName}`;
    message = `Booking slot logistik truk ${vehicle} telah dibatalkan / dihapus dari database.`;
    type = 'warning';
  } else if (eventType === 'UPDATE') {
    if (b.status === 'confirmed') {
      message = `Booking slot logistik truk ${vehicle} dikonfirmasi [status: confirmed].`;
      type = 'success';
    } else if (b.status === 'active') {
      message = `Truk ${vehicle} telah memasuki zona loading bay [status: active].`;
      type = 'info';
    } else if (b.status === 'completed') {
      message = `Aktivitas bongkar muat truk ${vehicle} telah selesai [status: completed].`;
      type = 'success';
    } else if (b.status === 'cancelled') {
      message = `Booking slot logistik truk ${vehicle} telah dibatalkan [status: cancelled].`;
      type = 'warning';
    } else {
      message = `Status booking truk ${vehicle} diperbarui menjadi [status: ${b.status || 'updated'}].`;
      type = 'info';
    }
  } else if (eventType === 'INSERT') {
    message = `Aksi Baru: Booking slot truk ${vehicle} berhasil dibuat di ${zoneName} [status: ${b.status || 'pending'}].`;
    type = 'success';
  } else {
    // Initial fetch / select
    if (b.status === 'confirmed') {
      message = `Booking slot logistik truk ${vehicle} dikonfirmasi status [confirmed].`;
      type = 'success';
    } else if (b.status === 'active') {
      message = `Truk ${vehicle} sedang aktif di area loading bay [active].`;
      type = 'info';
    } else if (b.status === 'completed') {
      message = `Bongkar muat truk ${vehicle} telah selesai [completed].`;
      type = 'success';
    } else if (b.status === 'cancelled') {
      message = `Booking slot logistik truk ${vehicle} dibatalkan [cancelled].`;
      type = 'warning';
    } else {
      message = `Permintaan booking slot truk ${vehicle} terdaftar [status: ${b.status || 'pending'}].`;
      type = 'info';
    }
  }

  const isRealtimeEvent = eventType === 'INSERT' || eventType === 'UPDATE' || eventType === 'DELETE';

  // Determine unread status based on read time persistence
  let unread = true;
  if (readTime > 0 && createdAtMs <= readTime) {
    unread = false;
  } else if (!isRealtimeEvent) {
    const diffMs = Date.now() - createdAtMs;
    unread = diffMs < 15 * 60 * 1000;
  }

  return {
    id: `notif-${bookingId || Math.random()}-${eventType}`,
    bookingId,
    title,
    message,
    time: isRealtimeEvent ? 'Baru saja' : timeLabel,
    type,
    unread,
    timestamp: createdAtMs,
  };
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRealNotifications = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const clearedTime = getClearedTime();
      const readTime = getReadTime();
      const dismissedIds = getDismissedIds();

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, zones(name)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (bookings && bookings.length > 0) {
        const notifs = bookings
          .map((b) => formatBookingNotification(b, 'SELECT', clearedTime, readTime, dismissedIds))
          .filter(Boolean);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async (payload) => {
        const eventType = payload.eventType; // 'INSERT' | 'UPDATE' | 'DELETE'
        const record = payload.new && Object.keys(payload.new).length > 0 ? payload.new : payload.old;
        if (!record) return;

        let zoneName = 'Zona Logistik';
        if (record.zone_id) {
          const { data: zoneData } = await supabase
            .from('zones')
            .select('name')
            .eq('id', record.zone_id)
            .maybeSingle();
          if (zoneData?.name) zoneName = zoneData.name;
        }

        const clearedTime = getClearedTime();
        const readTime = getReadTime();
        const dismissedIds = getDismissedIds();

        const newNotif = formatBookingNotification(
          { ...record, zone_name: zoneName },
          eventType,
          clearedTime,
          readTime,
          dismissedIds
        );

        if (newNotif) {
          setNotifications((prev) => {
            const filtered = prev.filter((n) => n.bookingId !== record.id || eventType === 'DELETE');
            return [newNotif, ...filtered];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRealNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_READ_TIME, now.toString());
    } catch (e) {
      console.error(e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_CLEARED_TIME, now.toString());
    } catch (e) {
      console.error(e);
    }
    setNotifications([]);
  };

  const dismissSingle = (notif) => {
    if (notif.bookingId) addDismissedId(notif.bookingId);
    if (notif.id) addDismissedId(notif.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id && n.bookingId !== notif.bookingId));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition"
        title="Pemberitahuan Sistem Realtime Database"
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
              <h4 className="text-xs font-black uppercase text-teal-400 tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                Pemberitahuan Realtime Database
              </h4>
              {unreadCount > 0 && (
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchRealNotifications}
                className="text-slate-400 hover:text-teal-300 p-1 transition"
                title="Muat Ulang Notifikasi"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-slate-400 hover:text-rose-400 text-[10px] font-bold flex items-center gap-1 transition bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60"
                  title="Bersihkan Semua Notifikasi"
                >
                  <Trash2 className="h-3 w-3 text-rose-400" /> Bersihkan
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2 mt-3 max-h-72 overflow-y-auto pr-1">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-teal-400" /> Memuat pemberitahuan realtime...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-2">
                <div className="h-10 w-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Belum ada notifikasi transaksi database.</p>
                <p className="text-[10px] text-slate-500">
                  Setiap aksi seperti pembuatan, perubahan status, atau pembatalan slot booking akan muncul otomatis secara realtime.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 transition group relative ${
                    n.unread
                      ? 'bg-slate-800/90 border-teal-500/40 text-white shadow-lg'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold flex items-center gap-1.5 text-teal-300 truncate max-w-[210px]">
                      {n.type === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                      {n.type === 'info' && <ShieldCheck className="h-3.5 w-3.5 text-teal-400 shrink-0" />}
                      {n.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                      <span className="truncate">{n.title}</span>
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                      <button
                        onClick={() => dismissSingle(n)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition opacity-60 hover:opacity-100"
                        title="Hapus notifikasi ini"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pr-2">{n.message}</p>
                </div>
              ))
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
              Tandai Semua Telah Dibaca
            </button>
          )}
        </div>
      )}
    </div>
  );
}


