import { VercelResponse } from '@vercel/node';

export function sendSuccess(res: VercelResponse, data: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function sendError(res: VercelResponse, message: string, statusCode = 400, details?: any) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString(),
  });
}
