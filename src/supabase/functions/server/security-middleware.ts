/**
 * Middleware de seguridad para las Supabase Edge Functions
 * Re-exporta las funciones de middleware.ts para una interfaz unificada
 */

export {
  requireFunctionSecret,
  requireAuth,
  rateLimit,
  errorLogger,
  corsMiddleware,
  logFunctionAccess,
} from './middleware.ts';
