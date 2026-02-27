/**
 * Centralized environment configuration.
 *
 * All VITE_ variables are read here and exported as typed constants.
 * Copy .env.example to .env and fill in your values before running.
 */

export const env = {
  supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  appEnv: (import.meta.env.VITE_APP_ENV ?? 'production') as 'development' | 'production' | 'demo',
  logLevel: (import.meta.env.VITE_LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'warn' | 'error',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 5000),
  maxRetries: Number(import.meta.env.VITE_MAX_RETRIES ?? 3),

  get supabaseFunctionEndpoint(): string {
    return (
      import.meta.env.VITE_SUPABASE_FUNCTION_ENDPOINT ??
      (this.supabaseProjectId
        ? `https://${this.supabaseProjectId}.supabase.co/functions/v1/make-server-25b11ac0`
        : '')
    );
  },

  get isDemo(): boolean {
    return this.appEnv === 'demo';
  },

  get isDev(): boolean {
    return this.appEnv === 'development';
  },

  get isProd(): boolean {
    return this.appEnv === 'production';
  },

  /** PDF/Excel export is disabled in demo mode */
  get exportEnabled(): boolean {
    return !this.isDemo;
  },
} as const;
