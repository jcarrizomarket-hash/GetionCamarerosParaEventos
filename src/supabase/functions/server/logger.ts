/**
 * Logger compatible con Deno para las Supabase Edge Functions
 *
 * Niveles: debug < info < warn < error
 * Emite JSON estructurado para facilitar el parsing en producción.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// En Deno, leer env directamente sin import.meta
const isDevelopment = (() => {
  try {
    return (Deno.env.get('ENVIRONMENT') ?? 'production') !== 'production';
  } catch (err) {
    console.error('Failed to read ENVIRONMENT variable', err);
    return false;
  }
})();

let currentMinLevel: LogLevel = isDevelopment ? 'debug' : 'info';

export function setLogLevel(level: LogLevel): void {
  currentMinLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentMinLevel];
}

function emitLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case 'debug':
      console.debug(output);
      break;
    case 'info':
      console.info(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
  }
}

export const serverLogger = {
  debug: (message: string, context?: Record<string, unknown>) => emitLog('debug', message, context),
  info:  (message: string, context?: Record<string, unknown>) => emitLog('info', message, context),
  warn:  (message: string, context?: Record<string, unknown>) => emitLog('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => emitLog('error', message, context),
};

export default serverLogger;
