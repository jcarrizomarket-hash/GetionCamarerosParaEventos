/**
 * Sistema de logging estructurado con niveles
 * Funciona tanto en cliente (browser) como en servidor (Node/Deno)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#888',
  info: '#2563eb',
  warn: '#d97706',
  error: '#dc2626',
};

const LOG_PREFIXES: Record<LogLevel, string> = {
  debug: '🔍 DEBUG',
  info: 'ℹ️  INFO',
  warn: '⚠️  WARN',
  error: '❌ ERROR',
};

let currentMinLevel: LogLevel = 'info';

/**
 * Establece el nivel mínimo de log
 */
export function setLogLevel(level: LogLevel): void {
  currentMinLevel = level;
}

/**
 * Verifica si un nivel de log debe procesarse
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentMinLevel];
}

/**
 * Formatea y emite una entrada de log
 */
function emitLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  const prefix = LOG_PREFIXES[level];
  const timestamp = entry.timestamp;

  if (typeof window !== 'undefined') {
    // Browser: usar estilos CSS
    const color = LOG_COLORS[level];
    const args: unknown[] = [
      `%c${prefix}%c [${timestamp}] ${message}`,
      `color: ${color}; font-weight: bold`,
      'color: inherit',
    ];
    if (context) args.push(context);

    switch (level) {
      case 'debug': console.debug(...args); break;
      case 'info':  console.info(...args);  break;
      case 'warn':  console.warn(...args);  break;
      case 'error': console.error(...args); break;
    }
  } else {
    // Servidor: output estructurado
    const logMessage = `${prefix} [${timestamp}] ${message}`;
    const logData = context ? { ...context } : undefined;

    switch (level) {
      case 'debug': console.debug(logMessage, logData ?? ''); break;
      case 'info':  console.info(logMessage, logData ?? '');  break;
      case 'warn':  console.warn(logMessage, logData ?? '');  break;
      case 'error': console.error(logMessage, logData ?? ''); break;
    }
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emitLog('debug', message, context),
  info:  (message: string, context?: Record<string, unknown>) => emitLog('info', message, context),
  warn:  (message: string, context?: Record<string, unknown>) => emitLog('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => emitLog('error', message, context),

  /**
   * Crea un logger con contexto fijo (útil para módulos específicos)
   */
  withContext: (fixedContext: Record<string, unknown>) => ({
    debug: (message: string, context?: Record<string, unknown>) =>
      emitLog('debug', message, { ...fixedContext, ...context }),
    info:  (message: string, context?: Record<string, unknown>) =>
      emitLog('info', message, { ...fixedContext, ...context }),
    warn:  (message: string, context?: Record<string, unknown>) =>
      emitLog('warn', message, { ...fixedContext, ...context }),
    error: (message: string, context?: Record<string, unknown>) =>
      emitLog('error', message, { ...fixedContext, ...context }),
  }),
};

export default logger;
