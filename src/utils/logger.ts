/**
 * Logger centralizado para el sistema de gestión de camareros
 *
 * Niveles: DEBUG < INFO < WARN < ERROR
 * - En desarrollo: muestra todos los niveles en consola con timestamps
 * - En producción: muestra solo WARN y ERROR; envía logs al servidor
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: unknown;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const isDevelopment =
  typeof import.meta !== 'undefined' &&
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

// Minimum level shown in console
const MIN_CONSOLE_LEVEL: LogLevel = isDevelopment ? 'DEBUG' : 'WARN';

class Logger {
  private context: LogContext = {};

  /** Enrich all subsequent log calls with persistent context (e.g. userId) */
  setContext(ctx: LogContext) {
    this.context = { ...this.context, ...ctx };
  }

  /** Clear runtime context */
  clearContext() {
    this.context = {};
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_CONSOLE_LEVEL];
  }

  private formatEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: Object.keys(this.context).length ? { ...this.context } : undefined,
      data,
    };
  }

  private write(level: LogLevel, entry: LogEntry) {
    if (!this.shouldLog(level)) return;

    const prefix = `[${entry.timestamp}] [${level}]`;
    const msg = entry.context
      ? `${prefix} ${entry.message} ${JSON.stringify(entry.context)}`
      : `${prefix} ${entry.message}`;

    if (entry.data !== undefined) {
      switch (level) {
        case 'ERROR':
          console.error(msg, entry.data);
          break;
        case 'WARN':
          console.warn(msg, entry.data);
          break;
        case 'DEBUG':
          console.debug(msg, entry.data);
          break;
        default:
          console.log(msg, entry.data);
      }
    } else {
      switch (level) {
        case 'ERROR':
          console.error(msg);
          break;
        case 'WARN':
          console.warn(msg);
          break;
        case 'DEBUG':
          console.debug(msg);
          break;
        default:
          console.log(msg);
      }
    }
  }

  debug(message: string, data?: unknown) {
    const entry = this.formatEntry('DEBUG', message, data);
    this.write('DEBUG', entry);
  }

  info(message: string, data?: unknown) {
    const entry = this.formatEntry('INFO', message, data);
    this.write('INFO', entry);
  }

  warn(message: string, data?: unknown) {
    const entry = this.formatEntry('WARN', message, data);
    this.write('WARN', entry);
  }

  error(message: string, data?: unknown) {
    const entry = this.formatEntry('ERROR', message, data);
    this.write('ERROR', entry);
  }
}

/** Singleton logger instance shared across the application */
export const logger = new Logger();
export default logger;
