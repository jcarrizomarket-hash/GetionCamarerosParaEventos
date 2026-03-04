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
