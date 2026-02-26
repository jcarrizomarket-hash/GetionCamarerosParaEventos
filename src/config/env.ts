/**
 * Configuración centralizada de variables de entorno
 *
 * Las variables se leen desde el entorno de Vite (prefijo VITE_).
 * Copia .env.example a .env y completa los valores reales.
 */

export const supabaseProjectId: string =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? '';

export const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabaseFunctionEndpoint: string =
  import.meta.env.VITE_SUPABASE_FUNCTION_ENDPOINT ??
  (supabaseProjectId
    ? `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-25b11ac0`
    : '');
