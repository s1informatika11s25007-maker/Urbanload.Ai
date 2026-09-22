
import { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';

export function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const [manualId, setManualId] = useState('');

  return (
     className="p-6 border-slate-300 bg-slate-50">
      <h4 className="text-sm font-bold text-slate-800 mb-3">Kamera Scanner QR & Input Manual (Role)</h4>

      <div className="h-48 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono mb-4">
        [ Visualizer Kamera QR Scanner / react-qr-reader Active ]
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Input Booking ID Manual..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
        />
         onClick={() => onScan(manualId || 'UL-2025-091823')} className="text-xs">
          Verifikasi QR
        </Button>
      </div>
    </Card>
  );
}
