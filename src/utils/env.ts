import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_PROJECT_ID: z.string().nonempty(),
  VITE_SUPABASE_ANON_KEY: z.string().nonempty(),
  VITE_SUPABASE_FUNCTION_ENDPOINT: z.string().url(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  VITE_API_TIMEOUT: z.number().positive(),
  VITE_MAX_RETRIES: z.number().int().nonnegative(),
});

const validateEnv = () => {
  const parsed = envSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    console.error('Environment variable validation failed:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
};

export const config = validateEnv();