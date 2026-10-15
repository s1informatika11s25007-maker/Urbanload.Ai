import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Building2,
  Shield,
  Activity,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Bot,
  Radio,
  Mic,
  Lock,
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';

const UNIFORM_SIDEBAR_STYLE = {
  badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  activeBg: 'bg-teal-600 text-white shadow-md shadow-teal-900/40',
  iconColor: 'text-teal-400',
};

const ROLE_SIDEBAR_CONFIG = {
  rider: {
    roleKey: 'rider',
    roleLabel: 'Kurir Logistik',
    perspectiveBadge: 'KONSOL KURIR',
    ...UNIFORM_SIDEBAR_STYLE,
    description: 'Fokus: Rute, Slot Booking & Dispatch',
    sections: [
      {
        title: 'Operasional Kurir',
        items: [
          { to: '/rider/dashboard', label: 'Dashboard Kurir', icon: Truck, desc: 'Status GPS & Slot' },
          { to: '/rider/bookings/new', label: 'SmartSlot Booking AI', icon: Calendar, desc: 'Pesan Unloading Bay' },
          { to: '/dispatch/voice', label: 'Voice Dispatch Console', icon: Mic, badge: 'Hands-Free', desc: 'Perintah Suara AI' },
          { to: '/city/livemap', label: 'Peta Navigasi & Telemetri', icon: Shield, desc: 'Rute & Live Map' },
          { to: '/rider/congestion', label: 'Skor Kepadatan Rute', icon: Activity, desc: 'Prediksi Kemacetan' },
        ],
      },
      {
        title: 'Asisten Kurir',
        items: [
          { to: '/logitalk', label: 'LogiTalk AI Assistant', icon: Bot, isAi: true, desc: 'Tanya Rute & Tarif' },
        ],
      },
    ],
  },

  city_admin: {
    roleKey: 'city_admin',
    roleLabel: 'Admin Kota',
    perspectiveBadge: 'TATA KOTA HUB',
    ...UNIFORM_SIDEBAR_STYLE,
    description: 'Fokus: Zona PostGIS & Edge Security',
    sections: [
      {
        title: 'Manajemen Tata Kota',
        items: [
          { to: '/city/zones', label: 'Editor Zona PostGIS', icon: Building2, desc: 'Kelola Geofence Bay' },
          { to: '/city/livemap', label: 'Telemetri & LiveMap 3D', icon: Shield, desc: 'Pantau Lalu Lintas Kota' },
          { to: '/rider/congestion', label: 'Analisis Kepadatan Kota', icon: Activity, desc: 'Pigovian Tariff AI' },
        ],
      },
      {
        title: 'Keamanan & Intelligence',
        items: [
          { to: '/security/prompt-guard', label: 'Proteksi & Anti-Fraud GPS', icon: Lock, badge: 'Guard', desc: 'Siber & Anti-Spoofing' },
          { to: '/logitalk', label: 'LogiTalk Governance AI', icon: Bot, isAi: true, desc: 'Analisa Kebijakan Kota' },
        ],
      },
    ],
  },

  dishub_officer: {
    roleKey: 'dishub_officer',
    roleLabel: 'Petugas Dishub',
    perspectiveBadge: 'PATROLI DISHUB',
    ...UNIFORM_SIDEBAR_STYLE,
    description: 'Fokus: Laporan Warga & Sirene Darurat',
    sections: [
      {
        title: 'Pengawasan Lapangan',
        items: [
          { to: '/dishub/reports', label: 'Pusat Laporan Pelanggaran', icon: ShieldAlert, badge: 'Citizen', desc: 'Penindakan Parkir Liar' },
          { to: '/city/livemap', label: 'Command Center LiveMap', icon: Shield, desc: 'Pantau Posisi Patroli' },
          { to: '/dispatch/voice', label: 'Siren Emergency Preemption', icon: Radio, badge: 'Sirene', desc: 'Kosongkan Bahu Jalan' },
          { to: '/rider/congestion', label: 'Monitoring Traffic AI', icon: Activity, desc: 'Poin Kepadatan Tinggi' },
        ],
      },
      {
        title: 'Asisten Taktis',
        items: [
          { to: '/logitalk', label: 'LogiTalk Tactical AI', icon: Bot, isAi: true, desc: 'Panduan Operasional' },
        ],
      },
    ],
  },

  admin: {
    roleKey: 'admin',
    roleLabel: 'System Admin',
    perspectiveBadge: 'SUPERUSER CONTROL',
    ...UNIFORM_SIDEBAR_STYLE,
    description: 'Fokus: Pengawasan Sistem, Audit & Governance',
    sections: [
      {
        title: 'Manajemen System Admin',
        items: [
          { to: '/city/zones', label: 'Editor Zona PostGIS', icon: Building2, desc: 'Kelola Geofence Bay' },
          { to: '/security/prompt-guard', label: 'Proteksi & Anti-Fraud GPS', icon: Lock, badge: 'Guard', desc: 'Siber & Anti-Spoofing' },
          { to: '/dishub/reports', label: 'Pusat Laporan Pelanggaran', icon: ShieldAlert, badge: 'Audit', desc: 'Laporan & Enforcement' },
          { to: '/city/livemap', label: 'Telemetri & LiveMap 3D', icon: Shield, desc: 'Full City Spatial Map' },
        ],
      },
      {
        title: 'Intelligence & Superuser AI',
        items: [
          { to: '/logitalk', label: 'LogiTalk AI Superuser', icon: Bot, isAi: true, desc: 'Pusat Inteligensi AI' },
        ],
      },
    ],
  },
};

export function AppSidebar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Pengguna',
    role: 'rider',
    roleLabel: 'Kurir Logistik',
    initial: 'K',
    email: ''
  });

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadUserProfile() {
      if (isMounted) setLoadingProfile(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && isMounted) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role, email')
            .eq('id', user.id)
            .maybeSingle();

          if (isMounted) {
            const name = profile?.full_name || user.user_metadata?.full_name || 'Pengguna';
            const role = profile?.role || user.user_metadata?.role || 'rider';
            const email = profile?.email || user.email || '';

            let roleLabel = 'Kurir Logistik';
            if (role === 'city_admin') roleLabel = 'Admin Kota';
            else if (role === 'dishub_officer') roleLabel = 'Petugas Dishub';
            else if (role === 'admin') roleLabel = 'System Admin';

            const initial = name.charAt(0).toUpperCase() || 'K';
            setUserProfile({ name, role, roleLabel, initial, email });
          }
        } else if (isMounted) {
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Sidebar profile fetch notice:', err);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setCurrentUser(null);
          setUserProfile({ name: 'Pengguna', role: 'rider', roleLabel: 'Kurir Logistik', initial: 'K', email: '' });
          setLoadingProfile(false);
        }
      } else {
        loadUserProfile();
      }
    });

    loadUserProfile();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [pathname]);

  const isPublicPreviewMap = pathname === '/city/livemap' && searchParams.get('preview') === 'public';
  const isPublicPage = pathname === '/' || pathname === '/lapor' || pathname.startsWith('/lapor') || (
    !currentUser && (
      pathname.startsWith('/fitur') ||
      pathname.startsWith('/tentang') ||
      pathname.startsWith('/lapor') ||
      pathname === '/login' ||
      pathname === '/register' ||
      isPublicPreviewMap
    )
  );

  if (isPublicPage || pathname === '/lapor' || pathname.startsWith('/lapor')) return null;

  const activeRoleKey = userProfile.role || 'rider';
  const roleConfig = ROLE_SIDEBAR_CONFIG[activeRoleKey] || ROLE_SIDEBAR_CONFIG.rider;

  const handleLogout = async () => {
    setLoadingProfile(true);
    setCurrentUser(null);
    setUserProfile({ name: 'Pengguna', role: 'rider', roleLabel: 'Kurir Logistik', initial: 'K', email: '' });

    const supabase = createClient();
    await supabase.auth.signOut();
    const { performCleanLogout } = await import('../../lib/auth-logout.js');
    await performCleanLogout(navigate);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between border-r border-slate-800 bg-[#0F172A] text-slate-100 transition-all duration-300 z-40 sticky top-0 h-screen shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ATAS: Logo Brand & Sidebar Collapse Toggle */}
      <div>
        <div className={`p-3 border-b border-slate-800/80 flex items-center ${collapsed ? 'flex-col gap-2 justify-center py-4' : 'justify-between p-4'}`}>
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden" title="UrbanLoad.AI Logistics OS">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
              <Truck className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight animate-in fade-in">
                <span className="text-base font-black tracking-tight text-white block">
                  UrbanLoad<span className="text-teal-400">.AI</span>
                </span>
                <span className="text-[10px] font-mono text-teal-300 font-bold uppercase block tracking-widest">
                  Logistics OS
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/80 transition shadow-sm"
            title={collapsed ? 'Perluas Sidebar' : 'Menciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ROLE PERSPECTIVE BADGE HEADER */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className={`p-2 rounded-xl border flex items-center justify-between text-xs font-mono bg-slate-800/80 ${roleConfig.badgeClass}`}>
              <div className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping"></span>
                <span className="font-extrabold uppercase text-[10px] tracking-wider truncate">{roleConfig.perspectiveBadge}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TENGAH: Menu Navigasi Per Role */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {loadingProfile ? (
          <div className="space-y-3 p-1 animate-pulse">
            <div className="h-3 bg-slate-800/80 rounded w-20 mb-2"></div>
            <div className="h-9 bg-slate-800/90 rounded-xl border border-slate-700/60"></div>
            <div className="h-9 bg-slate-800/90 rounded-xl border border-slate-700/60"></div>
            <div className="h-9 bg-slate-800/90 rounded-xl border border-slate-700/60"></div>
          </div>
        ) : (
          roleConfig.sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed ? (
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1">
                  {section.title}
                </span>
              ) : idx > 0 ? (
                <div className="my-2 border-t border-slate-800/80" />
              ) : null}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to;

                if (item.isAi) {
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-xs font-bold transition border shadow-sm ${
                        collapsed ? 'justify-center px-0' : 'px-3'
                      } ${
                        isActive
                          ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                          : 'bg-slate-800/90 hover:bg-slate-800 text-teal-200 border-teal-700/50'
                      }`}
                      title={collapsed ? `${item.label} (${item.desc})` : item.label}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-teal-300 animate-pulse" />
                      {!collapsed && (
                        <div className="truncate">
                          <span className="block truncate">{item.label}</span>
                          <span className="text-[9px] text-teal-300/80 font-mono block font-normal truncate">{item.desc}</span>
                        </div>
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center py-2.5 rounded-xl text-xs font-bold transition ${
                      collapsed ? 'justify-center px-0' : 'justify-between px-3'
                    } ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40 border-r-4 border-teal-300'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                    title={collapsed ? `${item.label}${item.desc ? ` - ${item.desc}` : ''}` : item.label}
                  >
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'truncate'}`}>
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {!collapsed && (
                        <div className="truncate">
                          <span className="block truncate">{item.label}</span>
                          {item.desc && !isActive && (
                            <span className="text-[9px] text-slate-400 font-normal block truncate">{item.desc}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {!collapsed && item.badge && (
                      <span className="text-[9px] bg-slate-800 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* BAWAH KIRI POJOK: Tombol Keluar Akun Langsung */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 font-bold text-xs transition shadow-sm group ${
            collapsed ? 'px-0' : 'px-3'
          }`}
          title="Keluar Akun"
        >
          <LogOut className="h-4 w-4 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
          {!collapsed && <span>Keluar Akun</span>}
        </button>
      </div>
    </aside>
  );
}
