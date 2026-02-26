/**
 * Validación de variables de entorno al inicio de la aplicación
 * Verifica que todas las variables requeridas estén definidas
 */

import logger from './logger';

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Variables de entorno requeridas para el funcionamiento básico
 */
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_PROJECT_ID',
  'VITE_SUPABASE_ANON_KEY',
] as const;

/**
 * Variables de entorno opcionales (producción recomendada)
 */
const OPTIONAL_ENV_VARS = [
  'VITE_SUPABASE_FUNCTION_ENDPOINT',
] as const;

/**
 * Valida que las variables de entorno requeridas estén presentes
 * @returns Resultado de la validación con lista de variables faltantes
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = (import.meta.env as Record<string, string | undefined>)[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL_ENV_VARS) {
    const value = (import.meta.env as Record<string, string | undefined>)[key];
    if (!value || value.trim() === '') {
      warnings.push(key);
    }
  }

  const valid = missing.length === 0;

  if (!valid) {
    logger.error('Variables de entorno requeridas no configuradas', { missing });
    if (import.meta.env.DEV) {
      logger.warn(
        'Copia .env.example a .env y completa los valores. La aplicación puede no funcionar correctamente.'
      );
    }
  }

  if (warnings.length > 0) {
    logger.warn('Variables de entorno opcionales no configuradas', { warnings });
  }

  if (valid && warnings.length === 0) {
    logger.info('Variables de entorno validadas correctamente');
  }

  return { valid, missing, warnings };
}

/**
 * Valida las variables de entorno y lanza un error si hay variables requeridas faltantes
 * Solo usar en producción donde queremos un fallo rápido
 * @throws Error si hay variables requeridas faltantes
 */
export function assertEnv(): void {
  const result = validateEnv();
  if (!result.valid) {
    throw new Error(
      `Configuración incompleta. Variables de entorno requeridas faltantes: ${result.missing.join(', ')}`
    );
  }
}

export default validateEnv;
