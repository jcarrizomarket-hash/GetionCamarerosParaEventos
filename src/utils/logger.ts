/**
 * Utilidad de logging centralizado para el sistema de gestión de camareros.
 * Proporciona logging estructurado con niveles de severidad y contexto.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

const isDevelopment = import.meta.env?.DEV ?? false;

function formatEntry(entry: LogEntry): string {
  return JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    context: entry.context,
    message: entry.message,
    ...(entry.data !== undefined ? { data: entry.data } : {}),
  });
}

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    };
  }
  return error;
}

function createLogger(context: string) {
  function log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data: data instanceof Error ? serializeError(data) : data,
    };

    if (isDevelopment) {
      const prefix = `[${entry.context}]`;
      switch (level) {
        case 'debug':
          console.debug(prefix, message, data ?? '');
          break;
        case 'info':
          console.info(prefix, message, data ?? '');
          break;
        case 'warn':
          console.warn(prefix, message, data ?? '');
          break;
        case 'error':
          console.error(prefix, message, data ?? '');
          break;
      }
    } else {
      // In production, emit structured JSON log
      if (level === 'error' || level === 'warn') {
        console.error(formatEntry(entry));
      } else {
        console.log(formatEntry(entry));
      }
    }
  }

  return {
    debug: (message: string, data?: unknown) => log('debug', message, data),
    info: (message: string, data?: unknown) => log('info', message, data),
    warn: (message: string, data?: unknown) => log('warn', message, data),
    error: (message: string, data?: unknown) => log('error', message, data),
  };
}

export const logger = {
  /**
   * Crea un logger con contexto específico de módulo/componente.
   * Uso: const log = logger.forContext('MiComponente');
   *      log.info('Mensaje', { datos });
   */
  forContext: createLogger,
};

export type Logger = ReturnType<typeof createLogger>;
