export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  HMAC_SECRET_KEY: process.env.HMAC_SECRET_KEY || 'default-secret-key-urbanload-2025',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
