import { z } from 'zod';

const DEFAULT_API_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 3;

const envSchema = z.object({
  VITE_SUPABASE_PROJECT_ID: z.string().nonempty(),
  VITE_SUPABASE_ANON_KEY: z.string().nonempty(),
  VITE_SUPABASE_FUNCTION_ENDPOINT: z.string().url().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional().default('production'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
  VITE_API_TIMEOUT: z.coerce.number().positive().optional().default(DEFAULT_API_TIMEOUT_MS),
  VITE_MAX_RETRIES: z.coerce.number().int().nonnegative().optional().default(DEFAULT_MAX_RETRIES),
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