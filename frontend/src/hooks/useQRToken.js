import { useState } from 'react';
import { generateQRToken } from '../lib/api/qr.js';

export function useQRToken(bookingId) {
  const [qrData, setQrData] = useState(null);
  const generate = async () => {
    const res = await generateQRToken(bookingId);
    if (res.success) setQrData(res.data);
  };
  return { qrData, generate };
}
