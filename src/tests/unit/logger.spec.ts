/**
 * Tests unitarios para el logger centralizado
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../utils/logger';

describe('Logger', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.clearContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe llamar console.debug para nivel DEBUG', () => {
    logger.debug('mensaje de debug');
    expect(debugSpy).toHaveBeenCalledOnce();
    expect(debugSpy.mock.calls[0][0]).toContain('[DEBUG]');
    expect(debugSpy.mock.calls[0][0]).toContain('mensaje de debug');
  });

  it('debe llamar console.log para nivel INFO', () => {
    logger.info('mensaje de info');
    expect(infoSpy).toHaveBeenCalledOnce();
    expect(infoSpy.mock.calls[0][0]).toContain('[INFO]');
    expect(infoSpy.mock.calls[0][0]).toContain('mensaje de info');
  });

  it('debe llamar console.warn para nivel WARN', () => {
    logger.warn('mensaje de advertencia');
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain('[WARN]');
    expect(warnSpy.mock.calls[0][0]).toContain('mensaje de advertencia');
  });

  it('debe llamar console.error para nivel ERROR', () => {
    logger.error('mensaje de error');
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toContain('[ERROR]');
    expect(errorSpy.mock.calls[0][0]).toContain('mensaje de error');
  });

  it('debe incluir timestamp ISO en cada log', () => {
    logger.info('con timestamp');
    const call = infoSpy.mock.calls[0][0] as string;
    // Timestamp ISO 8601 pattern
    expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('debe incluir datos adicionales cuando se pasan', () => {
    const extra = { id: 42 };
    logger.error('con datos', extra);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), extra);
  });

  it('debe incluir contexto establecido con setContext', () => {
    logger.setContext({ userId: 'user-123' });
    logger.info('con contexto');
    const call = infoSpy.mock.calls[0][0] as string;
    expect(call).toContain('user-123');
  });

  it('debe limpiar el contexto con clearContext', () => {
    logger.setContext({ userId: 'user-123' });
    logger.clearContext();
    logger.info('sin contexto');
    const call = infoSpy.mock.calls[0][0] as string;
    expect(call).not.toContain('user-123');
  });

  it('debe acumular contexto con múltiples llamadas a setContext', () => {
    logger.setContext({ userId: 'user-123' });
    logger.setContext({ sessionId: 'sess-456' });
    logger.warn('contexto acumulado');
    const call = warnSpy.mock.calls[0][0] as string;
    expect(call).toContain('user-123');
    expect(call).toContain('sess-456');
  });
});
