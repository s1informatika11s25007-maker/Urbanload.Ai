import React from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';

export function ZoneListTable() {
  const zones = [
    { name: 'Zona A - Pasar Tanah Abang', cap: 12 },
    { name: 'Zona B - Monas', cap: 15 },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-base font-black mb-4">Daftar Zona Logistik</h3>
      <div className="space-y-2">
        {zones.map((z, i) => (
          <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-sm">{z.name}</span>
            <span className="text-xs text-slate-500">{z.cap} Truk</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
