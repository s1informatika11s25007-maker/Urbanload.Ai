import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { RefreshCw } from 'lucide-react';

export function SlotAvailabilityTable({ onSelectSlot }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/zones/11111111-1111-1111-1111-111111111111/available-slots');
      const data = await res.json();
      if (data.success) setSlots(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold">Ketersediaan Slot</h3>
        <Button onClick={loadSlots} variant="outline" className="h-8 text-xs">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-3">Waktu</th>
              <th className="p-3">Kapasitas Sisa</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s, i) => (
              <tr key={i} className="border-b hover:bg-slate-50">
                <td className="p-3 font-bold">{s.time}</td>
                <td className="p-3">{s.remainingCapacity} truk</td>
                <td className="p-3 text-right">
                  <Button onClick={() => onSelectSlot(s)} disabled={s.status === 'full'} className="h-7 text-[10px]">Pilih</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
