/**
 * Unit tests for validateRequiredEnvVars()
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('validateRequiredEnvVars', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('VITE_SUPABASE_FUNCTIONS_URL', 'https://abc.supabase.co/functions/v1');

    const { validateRequiredEnvVars } = await import('../../config/env');
    expect(() => validateRequiredEnvVars()).not.toThrow();
  });

  it('throws when VITE_SUPABASE_URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('VITE_SUPABASE_FUNCTIONS_URL', 'https://abc.supabase.co/functions/v1');

    const { validateRequiredEnvVars } = await import('../../config/env');
    expect(() => validateRequiredEnvVars()).toThrow('VITE_SUPABASE_URL');
  });

  it('throws when VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_SUPABASE_FUNCTIONS_URL', 'https://abc.supabase.co/functions/v1');

    const { validateRequiredEnvVars } = await import('../../config/env');
    expect(() => validateRequiredEnvVars()).toThrow('VITE_SUPABASE_ANON_KEY');
  });

  it('throws when all required environment variables are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_SUPABASE_FUNCTIONS_URL', '');

    const { validateRequiredEnvVars } = await import('../../config/env');
    expect(() => validateRequiredEnvVars()).toThrow('Missing required environment variables');
  });

  it('error message mentions Vercel setup steps', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_SUPABASE_FUNCTIONS_URL', '');

    const { validateRequiredEnvVars } = await import('../../config/env');
    expect(() => validateRequiredEnvVars()).toThrow('Vercel');
  });
});
