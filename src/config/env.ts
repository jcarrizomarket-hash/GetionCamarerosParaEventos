/**
 * Configuración centralizada de variables de entorno
 *
 * Las variables se leen desde el entorno de Vite (prefijo VITE_).
 * Copia .env.example a .env y completa los valores reales.
 *
 * Precedencia para el endpoint de funciones (mayor a menor):
 *   1. VITE_SUPABASE_FUNCTION_ENDPOINT  – URL completa a la función concreta
 *   2. VITE_SUPABASE_FUNCTIONS_URL      – URL base de todas las funciones
 *   3. VITE_SUPABASE_URL                – URL del proyecto (Vercel <> Supabase integration)
 *   4. VITE_SUPABASE_PROJECT_ID         – ID del proyecto (modo legacy)
 */

/** Full Supabase project URL, e.g. https://<id>.supabase.co */
export const supabaseUrl: string =
  import.meta.env.VITE_SUPABASE_URL ?? '';

/** Legacy project ID; prefer VITE_SUPABASE_URL when possible */
export const supabaseProjectId: string =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? '';

export const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/** Base URL for all Edge Functions, e.g. https://<id>.supabase.co/functions/v1 */
export const supabaseFunctionsUrl: string =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ??
  (supabaseUrl
    ? `${supabaseUrl}/functions/v1`
    : supabaseProjectId
      ? `https://${supabaseProjectId}.supabase.co/functions/v1`
      : '');

export const supabaseFunctionEndpoint: string =
  import.meta.env.VITE_SUPABASE_FUNCTION_ENDPOINT ??
  (supabaseFunctionsUrl
    ? `${supabaseFunctionsUrl}/make-server-25b11ac0`
    : '');

/**
 * Validates that all required environment variables are present.
 * Call this once at app startup (e.g. in main.tsx) so that missing
 * Vercel environment variables surface as a clear error instead of
 * silent undefined values.
 *
 * Required vars:
 *   VITE_SUPABASE_URL       – Supabase project URL
 *   VITE_SUPABASE_ANON_KEY  – Supabase anon/public key
 *   VITE_SUPABASE_FUNCTIONS_URL (or derived from VITE_SUPABASE_URL)
 */
export function validateRequiredEnvVars(): void {
  // Solo skipper si los valores son literalmente placeholders de CI (no strings vacios)
  const isCIPlaceholder = (v: string) =>
    v.includes('placeholder') || v === 'undefined';

  if (isCIPlaceholder(supabaseUrl) && isCIPlaceholder(supabaseAnonKey)) {
    console.warn('⚠️ Supabase no configurado — modo demo/CI activo. Las llamadas al backend fallarán.');
    return;
  }

  const missing: string[] = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (!supabaseFunctionsUrl) missing.push('VITE_SUPABASE_FUNCTIONS_URL (or VITE_SUPABASE_URL to derive it)');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join('\n  ')}\n\n` +
      'Set these in Vercel → Project → Settings → Environment Variables ' +
      'and redeploy. See README.md § Deployment for details.'
    );
  }
}
