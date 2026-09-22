import React from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';

export function BookingSummary({ bookingData, onConfirm, onCancel }) {
  if (!bookingData) return null;
  return (
    <Card className="p-6 border-teal-200 bg-teal-50/30">
      <h3 className="text-base font-bold mb-3">Ringkasan Pesanan</h3>
      <div className="flex gap-4">
        <Button onClick={onConfirm} className="bg-teal-700">Konfirmasi & Bayar</Button>
        <Button onClick={onCancel} variant="outline">Batal</Button>
      </div>
    </Card>
  );
}
