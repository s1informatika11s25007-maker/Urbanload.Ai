import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RiderDashboard from './pages/RiderDashboard.jsx';
import RiderCongestion from './pages/RiderCongestion.jsx';
import CityZones from './pages/CityZones.jsx';
import LiveMap from './pages/LiveMap.jsx';
import NewBooking from './pages/NewBooking.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';
import Tentang from './pages/Tentang.jsx';
import FeatureCongestion from './pages/FeatureCongestion.jsx';
import FeatureGeofence from './pages/FeatureGeofence.jsx';
import JuriDemoPage from './pages/JuriDemoPage.jsx';
import { Header } from './components/layout/Header.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { MobileTabBar } from './components/layout/MobileTabBar.jsx';
import { ToastProvider } from './components/ui/ToastNotification.jsx';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans">
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tentang" element={<Tentang />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/demo/juri" element={<JuriDemoPage />} />
              <Route path="/rider/dashboard" element={<RiderDashboard />} />
              <Route path="/rider/bookings/new" element={<NewBooking />} />
              <Route path="/rider/congestion" element={<RiderCongestion />} />
              <Route path="/city/zones" element={<CityZones />} />
              <Route path="/city/livemap" element={<LiveMap />} />
              <Route path="/fitur/congestion" element={<FeatureCongestion />} />
              <Route path="/fitur/geofence" element={<FeatureGeofence />} />
            </Routes>
          </main>
          <Footer />
          <MobileTabBar />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
