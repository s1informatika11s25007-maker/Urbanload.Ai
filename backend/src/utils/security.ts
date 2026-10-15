/**
 * Security & Input Sanitization Utilities
 * Strips HTML tags, script injection vectors, and enforces safe string lengths and UUID formats.
 */
export function sanitizeString(str: any, maxLength = 500): string {
  if (str === null || str === undefined) return '';
  const s = String(str).trim();
  const sanitized = s
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '');
  return sanitized.slice(0, maxLength);
}

export function sanitizePlateNumber(plate: any): string {
  if (!plate) return '';
  const s = String(plate).trim().toUpperCase();
  return s.replace(/[^A-Z0-9\s-]/g, '').slice(0, 20);
}

export function isValidUuid(id: any): boolean {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
