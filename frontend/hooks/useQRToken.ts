import { useState } from 'react';
import { generateQRToken } from '../lib/api/qr';

export function useQRToken(bookingId: string) {
  const [qrData, setQrData] = useState<any>(null);

  const generate = async () => {
    const res = await generateQRToken(bookingId);
    if (res.success) setQrData(res.data);
  };

  return { qrData, generate };
}
