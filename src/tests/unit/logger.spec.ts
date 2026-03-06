/**
 * Tests unitarios para el logger centralizado
 * Actualizado para la API del logger v2 (withContext, sin setContext/clearContext)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, setLogLevel } from '../../utils/logger';

describe('Logger', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setLogLevel('debug');
  });

  afterEach(() => {
    setLogLevel('info');
    vi.restoreAllMocks();
  });

  it('debe llamar console.debug para nivel debug', () => {
    logger.debug('mensaje de debug');
    expect(debugSpy).toHaveBeenCalledOnce();
    expect(debugSpy.mock.calls[0][0]).toContain('DEBUG');
    expect(debugSpy.mock.calls[0][0]).toContain('mensaje de debug');
  });

  it('debe llamar console.info para nivel info', () => {
    logger.info('mensaje de info');
    expect(infoSpy).toHaveBeenCalledOnce();
    expect(infoSpy.mock.calls[0][0]).toContain('INFO');
    expect(infoSpy.mock.calls[0][0]).toContain('mensaje de info');
  });

  it('debe llamar console.warn para nivel warn', () => {
    logger.warn('mensaje de advertencia');
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain('WARN');
    expect(warnSpy.mock.calls[0][0]).toContain('mensaje de advertencia');
  });

  it('debe llamar console.error para nivel error', () => {
    logger.error('mensaje de error');
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toContain('ERROR');
    expect(errorSpy.mock.calls[0][0]).toContain('mensaje de error');
  });

  it('debe incluir timestamp ISO en cada log', () => {
    logger.info('con timestamp');
    const call = infoSpy.mock.calls[0][0] as string;
    expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('debe incluir datos adicionales cuando se pasan como context', () => {
    const extra = { id: 42 };
    logger.error('con datos', extra);
    expect(errorSpy).toHaveBeenCalled();
    // En entorno jsdom (browser): args[0]=format, args[1]=CSS, args[2]=CSS, args[3]=context
    const contextArg = errorSpy.mock.calls[0][3] as Record<string, unknown>;
    expect(contextArg).toMatchObject({ id: 42 });
  });

  it('withContext debe inyectar contexto fijo en todos los logs derivados', () => {
    const scopedLogger = logger.withContext({ userId: 'user-123' });
    scopedLogger.info('con contexto');
    expect(infoSpy).toHaveBeenCalledOnce();
    // En entorno jsdom (browser): args[0]=format, args[1]=CSS, args[2]=CSS, args[3]=context
    const contextArg = infoSpy.mock.calls[0][3] as Record<string, unknown>;
    expect(contextArg).toMatchObject({ userId: 'user-123' });
  });

  it('withContext debe poder combinar contexto fijo con contexto adicional', () => {
    const scopedLogger = logger.withContext({ userId: 'user-123' });
    scopedLogger.warn('contexto combinado', { sessionId: 'sess-456' });
    expect(warnSpy).toHaveBeenCalledOnce();
    // En entorno jsdom (browser): args[0]=format, args[1]=CSS, args[2]=CSS, args[3]=context
    const contextArg = warnSpy.mock.calls[0][3] as Record<string, unknown>;
    expect(contextArg).toMatchObject({ userId: 'user-123', sessionId: 'sess-456' });
  });

  it('setLogLevel debe suprimir logs por debajo del nivel configurado', () => {
    setLogLevel('warn');
    logger.debug('esto no deberia aparecer');
    logger.info('esto tampoco');
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    logger.warn('esto si');
    expect(warnSpy).toHaveBeenCalledOnce();
  });
});
