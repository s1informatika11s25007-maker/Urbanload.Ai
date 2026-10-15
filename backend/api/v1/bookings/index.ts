import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '@/middleware/cors';
import { sendError, sendSuccess } from '@/utils/response';
import { getAllBookings, createBooking, deleteBooking } from '@/modules/bookings';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const rows = await getAllBookings();
      return sendSuccess(res, rows);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  if (req.method === 'POST') {
    const { userId, zoneId, vehiclePlate, cargoType, truckDimension, timeWindowStart, timeWindowEnd, notes } = req.body || {};

    if (!zoneId || !timeWindowStart || !timeWindowEnd) {
      return sendError(res, 'Field zoneId, timeWindowStart, dan timeWindowEnd wajib diisi', 400);
    }

    try {
      const newBooking = await createBooking({
        userId,
        zoneId,
        vehiclePlate,
        cargoType,
        truckDimension,
        timeWindowStart,
        timeWindowEnd,
        notes,
      });

      return sendSuccess(res, newBooking, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || (req.body && req.body.id);
    if (!id) {
      return sendError(res, 'Parameter id wajib diisi untuk menghapus booking', 400);
    }

    try {
      const deleted = await deleteBooking(id);
      return sendSuccess(res, deleted);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
