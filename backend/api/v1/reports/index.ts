import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '@/middleware/cors';
import { sendError, sendSuccess } from '@/utils/response';
import { getAllReports, createReport, updateReportStatus } from '@/modules/reports';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const reports = await getAllReports();
      return sendSuccess(res, reports);
    } catch (err: any) {
      return sendError(res, `Gagal mengambil data laporan: ${err.message}`, 500);
    }
  }

  if (req.method === 'POST') {
    const { violationType, vehiclePlate, locationName, description, photoUrl } = req.body || {};

    try {
      const newReport = await createReport({
        violationType,
        vehiclePlate,
        locationName,
        description,
        photoUrl,
      });

      return sendSuccess(res, newReport, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};

    try {
      const updatedReport = await updateReportStatus(id, status);
      return sendSuccess(res, updatedReport);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
