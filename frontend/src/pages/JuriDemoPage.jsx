import React from 'react';

/**
 * [KILL LIST #1] Juri Demo Page - DEPRECATED & REMOVED
 * Halaman demo juri dan hardcoded simulation trigger telah dihapus
 * demi menjaga lingkungan produksi yang deterministik dan ramping.
 */
export default function JuriDemoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 max-w-md">
        <h2 className="font-bold text-lg">Modul Demo Non-Produksi Dihapus</h2>
        <p className="text-xs mt-2 text-amber-700">
          Modul simulasi artifisial dan demo juri telah di-drop dari sistem produksi UrbanLoad.AI untuk memastikan keandalan operasional deterministik real-time.
        </p>
      </div>
    </div>
  );
}
