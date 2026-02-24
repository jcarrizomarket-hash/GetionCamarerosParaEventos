/**
 * Tests unitarios para middleware de servidor
 * Cubre: requireFunctionSecret, requireAuth, requireRole, rateLimit,
 *        errorLogger, logFunctionAccess, corsMiddleware
 *
 * Nota: el módulo middleware usa imports estilo Deno (npm:hono, Deno.env.get).
 * Vitest los resuelve mediante los alias configurados en vitest.config.ts
 * y el mock de Deno definido en tests/setup.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de @supabase/supabase-js antes de importar el módulo bajo test
vi.mock('npm:@supabase/supabase-js@2.39.3', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'not found' } }),
    },
  })),
}));

import {
  requireFunctionSecret,
  requireAuth,
  requireRole,
  rateLimit,
  errorLogger,
  logFunctionAccess,
  corsMiddleware,
  logAudit,
} from '../../supabase/functions/server/middleware';

// ---------------------------------------------------------------------------
// Helpers – crear un contexto Hono mínimo para tests
// ---------------------------------------------------------------------------

function buildContext(overrides: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  contextValues?: Record<string, unknown>;
} = {}): any {
  const { method = 'GET', url = 'http://localhost/test', headers = {}, contextValues = {} } = overrides;
  const store: Record<string, unknown> = { ...contextValues };

  return {
    req: {
      method,
      url,
      header: (name: string) => headers[name.toLowerCase()] ?? headers[name] ?? undefined,
    },
    json: vi.fn().mockReturnValue({ body: 'json-response' }),
    text: vi.fn().mockReturnValue('text-response'),
    header: vi.fn(),
    get: (key: string) => store[key],
    set: (key: string, value: unknown) => { store[key] = value; },
  };
}

// ---------------------------------------------------------------------------
// requireFunctionSecret
// ---------------------------------------------------------------------------

describe('requireFunctionSecret', () => {
  let denoEnvGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    denoEnvGet = vi.fn();
    (global as any).Deno = { env: { get: denoEnvGet } };
  });

  it('debe pasar llamadas GET sin validar el secret', async () => {
    const c = buildContext({ method: 'GET' });
    const next = vi.fn().mockResolvedValue(undefined);

    await requireFunctionSecret(c, next);

    expect(next).toHaveBeenCalledOnce();
    expect(c.json).not.toHaveBeenCalled();
  });

  it('debe pasar POST cuando no hay secret configurado (desarrollo)', async () => {
    denoEnvGet.mockReturnValue(undefined); // no secret configured
    const c = buildContext({ method: 'POST' });
    const next = vi.fn().mockResolvedValue(undefined);

    await requireFunctionSecret(c, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('debe rechazar POST con secret incorrecto (401)', async () => {
    denoEnvGet.mockReturnValue('expected-secret');
    const c = buildContext({
      method: 'POST',
      headers: { 'x-fn-secret': 'wrong-secret' },
    });
    const next = vi.fn();

    await requireFunctionSecret(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      401
    );
  });

  it('debe rechazar POST sin header secret (401)', async () => {
    denoEnvGet.mockReturnValue('expected-secret');
    const c = buildContext({ method: 'POST', headers: {} });
    const next = vi.fn();

    await requireFunctionSecret(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      401
    );
  });

  it('debe aprobar POST con secret correcto', async () => {
    denoEnvGet.mockReturnValue('correct-secret');
    const c = buildContext({
      method: 'POST',
      headers: { 'x-fn-secret': 'correct-secret' },
    });
    const next = vi.fn().mockResolvedValue(undefined);

    await requireFunctionSecret(c, next);

    expect(next).toHaveBeenCalledOnce();
    expect(c.json).not.toHaveBeenCalled();
  });

  it('debe proteger también PUT y DELETE', async () => {
    denoEnvGet.mockReturnValue('secret');

    for (const method of ['PUT', 'DELETE', 'PATCH']) {
      const c = buildContext({ method, headers: {} });
      const next = vi.fn();
      await requireFunctionSecret(c, next);
      expect(next).not.toHaveBeenCalled();
    }
  });
});

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------

describe('requireAuth', () => {
  beforeEach(() => {
    (global as any).Deno = { env: { get: vi.fn().mockReturnValue(undefined) } };
  });

  it('debe rechazar petición sin header Authorization (401)', async () => {
    const c = buildContext({ headers: {} });
    const next = vi.fn();

    await requireAuth(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      401
    );
  });

  it('debe rechazar Authorization sin prefijo Bearer (401)', async () => {
    const c = buildContext({ headers: { authorization: 'Basic abc123' } });
    const next = vi.fn();

    await requireAuth(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      401
    );
  });

  it('debe rechazar JWT malformado (401)', async () => {
    const c = buildContext({ headers: { authorization: 'Bearer notajwt' } });
    const next = vi.fn();

    await requireAuth(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      401
    );
  });

  it('debe rechazar token expirado (401)', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const payload = { sub: 'user-1', email: 'u@e.com', exp: pastExp };
    const encoded = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const token = `header.${encoded}.signature`;

    const c = buildContext({ headers: { authorization: `Bearer ${token}` } });
    const next = vi.fn();

    await requireAuth(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      401
    );
  });

  it('debe continuar con token válido (sin cliente Supabase)', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = { sub: 'user-1', email: 'u@e.com', role: 'admin', exp: futureExp };
    const encoded = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const token = `header.${encoded}.signature`;

    const c = buildContext({ headers: { authorization: `Bearer ${token}` } });
    const next = vi.fn().mockResolvedValue(undefined);

    await requireAuth(c, next);

    // Sin SUPABASE_URL/KEY configurados, el fallback JWT se usa
    expect(next).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------

describe('requireRole', () => {
  beforeEach(() => {
    (global as any).Deno = { env: { get: vi.fn().mockReturnValue(undefined) } };
  });

  it('debe denegar acceso si el rol del usuario no está permitido (403)', async () => {
    const c = buildContext({ contextValues: { userRole: 'camarero', userId: 'u1' } });
    const next = vi.fn();

    await requireRole('admin', 'coordinador')(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      403
    );
  });

  it('debe denegar acceso si no hay rol (403)', async () => {
    const c = buildContext({ contextValues: { userRole: null } });
    const next = vi.fn();

    await requireRole('admin')(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      403
    );
  });

  it('debe permitir acceso si el rol está en la lista', async () => {
    const c = buildContext({ contextValues: { userRole: 'admin', userId: 'u1' } });
    const next = vi.fn().mockResolvedValue(undefined);

    await requireRole('admin', 'coordinador')(c, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('debe permitir acceso al coordinador cuando está en la lista', async () => {
    const c = buildContext({ contextValues: { userRole: 'coordinador', userId: 'u1' } });
    const next = vi.fn().mockResolvedValue(undefined);

    await requireRole('admin', 'coordinador')(c, next);

    expect(next).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// rateLimit
// ---------------------------------------------------------------------------

describe('rateLimit', () => {
  it('debe permitir peticiones dentro del límite', async () => {
    const limiter = rateLimit(5, 60000);
    const c = buildContext({ headers: { 'x-forwarded-for': 'unique-ip-1' } });
    const next = vi.fn().mockResolvedValue(undefined);

    await limiter(c, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('debe bloquear peticiones que superan el límite (429)', async () => {
    const maxRequests = 2;
    const limiter = rateLimit(maxRequests, 60000);
    const ip = `test-ip-${Date.now()}`;
    const next = vi.fn().mockResolvedValue(undefined);

    // Agotar el límite
    for (let i = 0; i < maxRequests; i++) {
      const c = buildContext({ headers: { 'x-forwarded-for': ip } });
      await limiter(c, next);
    }

    // La siguiente petición debe ser bloqueada
    const c = buildContext({ headers: { 'x-forwarded-for': ip } });
    const blockedNext = vi.fn();
    await limiter(c, blockedNext);

    expect(blockedNext).not.toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      429
    );
  });

  it('debe usar identificador "unknown" cuando no hay IP', async () => {
    const limiter = rateLimit(100, 60000);
    const c = buildContext({ headers: {} });
    const next = vi.fn().mockResolvedValue(undefined);

    await limiter(c, next);

    expect(next).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// errorLogger
// ---------------------------------------------------------------------------

describe('errorLogger', () => {
  it('debe llamar a next y no interferir cuando no hay errores', async () => {
    const c = buildContext();
    const next = vi.fn().mockResolvedValue(undefined);

    await errorLogger(c, next);

    expect(next).toHaveBeenCalledOnce();
    expect(c.json).not.toHaveBeenCalled();
  });

  it('debe capturar errores y devolver 500', async () => {
    const c = buildContext();
    const next = vi.fn().mockRejectedValue(new Error('Unexpected failure'));

    await errorLogger(c, next);

    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      500
    );
  });

  it('debe manejar errores no-Error (string, etc.)', async () => {
    const c = buildContext();
    const next = vi.fn().mockRejectedValue('string error');

    await errorLogger(c, next);

    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      500
    );
  });
});

// ---------------------------------------------------------------------------
// logFunctionAccess
// ---------------------------------------------------------------------------

describe('logFunctionAccess', () => {
  it('debe llamar a next sin bloquear', async () => {
    const c = buildContext({ method: 'GET', url: 'http://localhost/test' });
    const next = vi.fn().mockResolvedValue(undefined);

    await logFunctionAccess(c, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('debe llamar a next con o sin header secret', async () => {
    const cSinSecret = buildContext({ headers: {} });
    const cConSecret = buildContext({ headers: { 'x-fn-secret': 'some-secret' } });
    const next = vi.fn().mockResolvedValue(undefined);

    await logFunctionAccess(cSinSecret, next);
    await logFunctionAccess(cConSecret, next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// corsMiddleware
// ---------------------------------------------------------------------------

describe('corsMiddleware', () => {
  it('debe establecer headers CORS por defecto', async () => {
    const cors = corsMiddleware();
    const c = buildContext({ method: 'GET' });
    const next = vi.fn().mockResolvedValue(undefined);

    await cors(c, next);

    expect(c.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(c.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      expect.stringContaining('GET')
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it('debe manejar preflight OPTIONS sin llamar a next', async () => {
    const cors = corsMiddleware();
    const c = buildContext({ method: 'OPTIONS' });
    const next = vi.fn();

    await cors(c, next);

    expect(next).not.toHaveBeenCalled();
    expect(c.text).toHaveBeenCalledWith('', 204);
  });

  it('debe aceptar opciones personalizadas de origen', async () => {
    const cors = corsMiddleware({ origin: 'https://mi-app.com' });
    const c = buildContext({ method: 'GET' });
    const next = vi.fn().mockResolvedValue(undefined);

    await cors(c, next);

    expect(c.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'https://mi-app.com'
    );
  });
});

// ---------------------------------------------------------------------------
// logAudit
// ---------------------------------------------------------------------------

describe('logAudit', () => {
  it('debe registrar evento de auditoría sin lanzar errores', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const c = buildContext({ method: 'POST', url: 'http://localhost/test' });

    expect(() => {
      logAudit(c, 'user-123', 'AUTH_SUCCESS', 'Test detail');
    }).not.toThrow();

    consoleSpy.mockRestore();
  });

  it('debe aceptar userId nulo', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const c = buildContext();

    expect(() => {
      logAudit(c, null, 'AUTH_FAILED');
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
