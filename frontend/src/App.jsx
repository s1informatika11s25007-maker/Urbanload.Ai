import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header.jsx';
import { AppSidebar } from './components/layout/AppSidebar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { MobileTabBar } from './components/layout/MobileTabBar.jsx';
import { ToastProvider } from './components/ui/ToastNotification.jsx';
import { Loader2 } from 'lucide-react';

/**
 * Smart lazy loader with automatic reload recovery for stale asset chunk deployment errors
 */
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasAlreadyBeenReloaded = JSON.parse(
      sessionStorage.getItem('urbanload_chunk_reloaded') || 'false'
    );

    try {
      const component = await componentImport();
      sessionStorage.removeItem('urbanload_chunk_reloaded');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenReloaded) {
        sessionStorage.setItem('urbanload_chunk_reloaded', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

// Code-split pages with automatic stale chunk reload recovery
const Home = lazyWithRetry(() => import('./pages/Home.jsx'));
const Login = lazyWithRetry(() => import('./pages/Login.jsx'));
const Register = lazyWithRetry(() => import('./pages/Register.jsx'));
const RiderDashboard = lazyWithRetry(() => import('./pages/RiderDashboard.jsx'));
const RiderCongestion = lazyWithRetry(() => import('./pages/RiderCongestion.jsx'));
const CityZones = lazyWithRetry(() => import('./pages/CityZones.jsx'));
const LiveMap = lazyWithRetry(() => import('./pages/LiveMap.jsx'));
const NewBooking = lazyWithRetry(() => import('./pages/NewBooking.jsx'));
const VerifyOtp = lazyWithRetry(() => import('./pages/VerifyOtp.jsx'));
const Tentang = lazyWithRetry(() => import('./pages/Tentang.jsx'));
const FeatureCongestion = lazyWithRetry(() => import('./pages/FeatureCongestion.jsx'));
const FeatureGeofence = lazyWithRetry(() => import('./pages/FeatureGeofence.jsx'));
const DishubReportsPage = lazyWithRetry(() => import('./pages/DishubReportsPage.jsx'));
const LogiTalkPage = lazyWithRetry(() => import('./pages/LogiTalkPage.jsx'));
const PublicReportPage = lazyWithRetry(() => import('./pages/PublicReportPage.jsx'));
const VoiceDispatchPage = lazyWithRetry(() => import('./pages/VoiceDispatchPage.jsx'));
const EdgeSecurityPage = lazyWithRetry(() => import('./pages/EdgeSecurityPage.jsx'));

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <span className="text-xs font-bold text-slate-500 font-mono">Memuat Halaman UrbanLoad.AI...</span>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
          {/* Left Sidebar for Operational Pages on Desktop */}
          <AppSidebar />

          <div className="flex flex-1 flex-col min-w-0">
            {/* Top Compact Header for Public / Mobile */}
            <Header />

            {/* Main Operational Content Viewport */}
            <main className="flex-1 pb-16 lg:pb-0 min-w-0">
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tentang" element={<Tentang />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/rider/dashboard" element={<RiderDashboard />} />
                  <Route path="/rider/bookings/new" element={<NewBooking />} />
                  <Route path="/rider/congestion" element={<RiderCongestion />} />
                  <Route path="/city/zones" element={<CityZones />} />
                  <Route path="/city/livemap" element={<LiveMap />} />
                  <Route path="/dishub/reports" element={<DishubReportsPage />} />
                  <Route path="/logitalk" element={<LogiTalkPage />} />
                  <Route path="/lapor" element={<PublicReportPage />} />
                  <Route path="/dispatch/voice" element={<VoiceDispatchPage />} />
                  <Route path="/security/prompt-guard" element={<EdgeSecurityPage />} />
                  <Route path="/fitur/congestion" element={<FeatureCongestion />} />
                  <Route path="/fitur/geofence" element={<FeatureGeofence />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
            <MobileTabBar />
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
