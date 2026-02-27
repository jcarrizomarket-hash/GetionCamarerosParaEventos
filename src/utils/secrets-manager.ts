/**
 * Manejo seguro de secrets y variables de entorno
 *
 * - Lee secrets desde variables de entorno (nunca hardcodeados)
 * - Enmascara valores en logs
 * - Documenta rotación periódica recomendada
 *
 * ROTACIÓN DE CREDENTIALS:
 *   - VITE_SUPABASE_ANON_KEY: rotar cada 90 días o ante sospecha de exposición
 *   - VITE_SUPABASE_FN_SECRET: rotar mensualmente
 *   - WHATSAPP_API_KEY: rotar mensualmente
 *   En producción, preferir Supabase Vault sobre archivos .env
 */

import { maskSensitiveData } from './data-masking';
import { logger } from './logger';

export interface SecretConfig {
  supabaseProjectId: string;
  supabaseAnonKey: string;
  supabaseFunctionEndpoint: string;
  fnSecret: string | undefined;
}

/**
 * Lee y valida los secrets desde las variables de entorno de Vite.
 * Lanza una advertencia (sin exponer valores) si alguno falta.
 */
export function getSecrets(): SecretConfig {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  const fnEndpoint =
    import.meta.env.VITE_SUPABASE_FUNCTION_ENDPOINT ??
    (projectId
      ? `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`
      : '');
  const fnSecret: string | undefined = import.meta.env.VITE_SUPABASE_FN_SECRET;

  if (!projectId) {
    logger.warn('VITE_SUPABASE_PROJECT_ID is not configured', { hint: 'Copy .env.example to .env' });
  }
  if (!anonKey) {
    logger.warn('VITE_SUPABASE_ANON_KEY is not configured');
  }

  return {
    supabaseProjectId: projectId,
    supabaseAnonKey: anonKey,
    supabaseFunctionEndpoint: fnEndpoint,
    fnSecret,
  };
}

/**
 * Registra el estado de configuración de secrets (sin exponer valores).
 */
export function logSecretsStatus(): void {
  const secrets = getSecrets();
  logger.info('Secrets configuration status', {
    supabaseProjectId: maskSensitiveData(secrets.supabaseProjectId),
    supabaseAnonKey: maskSensitiveData(secrets.supabaseAnonKey),
    supabaseFunctionEndpoint: secrets.supabaseFunctionEndpoint ? '[configured]' : '[missing]',
    fnSecret: secrets.fnSecret ? '[configured]' : '[missing]',
  });
}
