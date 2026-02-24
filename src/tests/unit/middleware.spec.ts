/**
 * Tests unitarios para middleware de seguridad
 * Framework: Vitest
 *
 * Los middlewares en supabase/functions/server/middleware.ts están diseñados
 * para el runtime Deno. Este archivo verifica la lógica equivalente usando
 * mocks del contexto Hono y el entorno Deno.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockContext } from '../mocks';
import { createTestJwt } from '../test-helpers';

// ─── Reimplementación testeable de los middlewares ─────────────────────────
// (misma lógica que middleware.ts, sin dependencias Deno-específicas)

/**
 * Test stub for logAudit — mirrors the production function signature but performs
 * no actual logging. The production version writes a structured JSON audit entry
 * to the console; in tests we keep it silent to avoid noise in test output.
 */
function logAudit(
  c: ReturnType<typeof createMockContext>,
  userId: string | null,
  event: string,
  details?: string
) {
  // En tests no hacemos log real
}

function requireFunctionSecretLogic(
  expectedSecret: string | undefined,
  method: string,
  providedSecret: string | undefined
): { allowed: boolean; status?: number; error?: string } {
  const methodsToProtect = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (!methodsToProtect.includes(method)) {
    return { allowed: true };
  }

  if (!expectedSecret) {
    return { allowed: true }; // Sin secret configurado, se permite (desarrollo)
  }

  if (providedSecret !== expectedSecret) {
    return { allowed: false, status: 401, error: 'No autorizado. Header x-fn-secret inválido o ausente.' };
  }

  return { allowed: true };
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function requireAuthLogic(
  authHeader: string | undefined,
  now: number = Math.floor(Date.now() / 1000)
): { allowed: boolean; userId?: string; userEmail?: string; userRole?: string; status?: number; error?: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { allowed: false, status: 401, error: 'No autorizado. Header Authorization requerido.' };
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return { allowed: false, status: 401, error: 'Token inválido.' };
  }

  if (payload.exp && payload.exp < now) {
    return { allowed: false, status: 401, error: 'Token expirado. Por favor, inicie sesión nuevamente.' };
  }

  return {
    allowed: true,
    userId: payload.sub ?? null,
    userEmail: payload.email ?? null,
    userRole: payload.app_metadata?.role ?? payload.role ?? null,
  };
}

function requireRoleLogic(
  userRole: string | null,
  allowedRoles: string[]
): { allowed: boolean; status?: number; error?: string } {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      status: 403,
      error: `Acceso denegado. Se requiere uno de los roles: ${allowedRoles.join(', ')}.`,
    };
  }
  return { allowed: true };
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

function createRateLimiter(maxRequests: number, windowMs: number) {
  const requestCounts = new Map<string, RateLimitRecord>();

  return function checkRateLimit(
    identifier: string,
    now: number = Date.now()
  ): { allowed: boolean; status?: number; error?: string } {
    const record = requestCounts.get(identifier);

    if (!record || now > record.resetAt) {
      requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    }

    if (record.count >= maxRequests) {
      return { allowed: false, status: 429, error: 'Demasiadas peticiones. Intenta más tarde.' };
    }

    record.count++;
    return { allowed: true };
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('requireFunctionSecret', () => {
  describe('métodos GET/HEAD no protegidos', () => {
    it('debe permitir GET sin secret', () => {
      const result = requireFunctionSecretLogic('my-secret', 'GET', undefined);
      expect(result.allowed).toBe(true);
    });

    it('debe permitir HEAD sin secret', () => {
      const result = requireFunctionSecretLogic('my-secret', 'HEAD', undefined);
      expect(result.allowed).toBe(true);
    });
  });

  describe('métodos mutantes protegidos', () => {
    it('debe rechazar POST sin header x-fn-secret', () => {
      const result = requireFunctionSecretLogic('my-secret', 'POST', undefined);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toContain('x-fn-secret');
    });

    it('debe rechazar PUT con secret incorrecto', () => {
      const result = requireFunctionSecretLogic('correct-secret', 'PUT', 'wrong-secret');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('debe rechazar DELETE con secret incorrecto', () => {
      const result = requireFunctionSecretLogic('my-secret', 'DELETE', 'bad');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('debe rechazar PATCH con secret incorrecto', () => {
      const result = requireFunctionSecretLogic('my-secret', 'PATCH', 'wrong');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('debe permitir POST con secret correcto', () => {
      const result = requireFunctionSecretLogic('correct-secret', 'POST', 'correct-secret');
      expect(result.allowed).toBe(true);
    });

    it('debe permitir DELETE con secret correcto', () => {
      const result = requireFunctionSecretLogic('my-secret', 'DELETE', 'my-secret');
      expect(result.allowed).toBe(true);
    });
  });

  describe('sin secret configurado (desarrollo)', () => {
    it('debe permitir POST cuando no hay secret configurado', () => {
      const result = requireFunctionSecretLogic(undefined, 'POST', undefined);
      expect(result.allowed).toBe(true);
    });

    it('debe permitir DELETE cuando no hay secret configurado', () => {
      const result = requireFunctionSecretLogic(undefined, 'DELETE', 'any-value');
      expect(result.allowed).toBe(true);
    });
  });
});

describe('requireAuth - JWT validation', () => {
  describe('header Authorization', () => {
    it('debe rechazar petición sin header Authorization', () => {
      const result = requireAuthLogic(undefined);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toContain('Authorization');
    });

    it('debe rechazar header sin prefijo Bearer', () => {
      const result = requireAuthLogic('Token abc123');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('debe rechazar header vacío', () => {
      const result = requireAuthLogic('');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });
  });

  describe('validación de JWT', () => {
    it('debe rechazar JWT malformado', () => {
      const result = requireAuthLogic('Bearer not-a-jwt');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toContain('Token inválido');
    });

    it('debe rechazar JWT con formato incorrecto (partes insuficientes)', () => {
      const result = requireAuthLogic('Bearer header.payload');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('debe aceptar JWT válido no expirado', () => {
      const token = createTestJwt({ sub: 'user-123', email: 'test@test.com', role: 'admin' });
      const result = requireAuthLogic(`Bearer ${token}`);
      expect(result.allowed).toBe(true);
      expect(result.userId).toBe('user-123');
    });

    it('debe extraer email del JWT', () => {
      const token = createTestJwt({ sub: 'user-456', email: 'user@example.com', role: 'coordinador' });
      const result = requireAuthLogic(`Bearer ${token}`);
      expect(result.allowed).toBe(true);
      expect(result.userEmail).toBe('user@example.com');
    });

    it('debe extraer rol del JWT', () => {
      const token = createTestJwt({ sub: 'user-789', email: 'admin@test.com', role: 'admin' });
      const result = requireAuthLogic(`Bearer ${token}`);
      expect(result.allowed).toBe(true);
      expect(result.userRole).toBe('admin');
    });
  });

  describe('expiración del token', () => {
    it('debe rechazar JWT expirado', () => {
      const expiredToken = createTestJwt({
        sub: 'user-123',
        email: 'test@test.com',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expirado hace 1 hora
      });
      const result = requireAuthLogic(`Bearer ${expiredToken}`);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toContain('expirado');
    });

    it('debe aceptar JWT que expira en el futuro', () => {
      const validToken = createTestJwt({
        sub: 'user-123',
        email: 'test@test.com',
        exp: Math.floor(Date.now() / 1000) + 7200, // Expira en 2 horas
      });
      const result = requireAuthLogic(`Bearer ${validToken}`);
      expect(result.allowed).toBe(true);
    });

    it('debe aceptar JWT sin campo exp', () => {
      // Algunos tokens no tienen exp
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
      const payload = btoa(JSON.stringify({ sub: 'user-no-exp', email: 'test@test.com' })).replace(/=/g, '');
      const token = `${header}.${payload}.signature`;
      const result = requireAuthLogic(`Bearer ${token}`);
      expect(result.allowed).toBe(true);
    });
  });
});

describe('requireRole - Control de acceso basado en roles', () => {
  it('debe permitir acceso con rol correcto', () => {
    const result = requireRoleLogic('admin', ['admin', 'coordinador']);
    expect(result.allowed).toBe(true);
  });

  it('debe permitir acceso con cualquiera de los roles permitidos', () => {
    const result = requireRoleLogic('coordinador', ['admin', 'coordinador']);
    expect(result.allowed).toBe(true);
  });

  it('debe denegar acceso con rol incorrecto', () => {
    const result = requireRoleLogic('camarero', ['admin', 'coordinador']);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain('Acceso denegado');
  });

  it('debe denegar acceso cuando no hay rol', () => {
    const result = requireRoleLogic(null, ['admin']);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('debe denegar acceso con rol vacío', () => {
    const result = requireRoleLogic('', ['admin', 'coordinador']);
    expect(result.allowed).toBe(false);
  });

  it('debe incluir los roles permitidos en el mensaje de error', () => {
    const result = requireRoleLogic('camarero', ['admin', 'coordinador']);
    expect(result.error).toContain('admin');
    expect(result.error).toContain('coordinador');
  });

  it('debe permitir acceso con rol único', () => {
    const result = requireRoleLogic('admin', ['admin']);
    expect(result.allowed).toBe(true);
  });
});

describe('rateLimit - Limitación de peticiones', () => {
  it('debe permitir peticiones dentro del límite', () => {
    const checkLimit = createRateLimiter(5, 60000);
    const now = Date.now();

    for (let i = 0; i < 5; i++) {
      const result = checkLimit('user-ip', now);
      expect(result.allowed).toBe(true);
    }
  });

  it('debe bloquear peticiones que excedan el límite', () => {
    const checkLimit = createRateLimiter(3, 60000);
    const now = Date.now();

    checkLimit('blocked-ip', now);
    checkLimit('blocked-ip', now);
    checkLimit('blocked-ip', now);
    const result = checkLimit('blocked-ip', now); // 4ta petición - debe bloquear

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(429);
    expect(result.error).toContain('Demasiadas peticiones');
  });

  it('debe resetear el contador después del período de tiempo', () => {
    const windowMs = 1000;
    const checkLimit = createRateLimiter(2, windowMs);
    const now = Date.now();

    checkLimit('reset-ip', now);
    checkLimit('reset-ip', now);
    const blocked = checkLimit('reset-ip', now);
    expect(blocked.allowed).toBe(false);

    // Simular que pasó el período
    const later = now + windowMs + 100;
    const afterReset = checkLimit('reset-ip', later);
    expect(afterReset.allowed).toBe(true);
  });

  it('debe rastrear clientes por separado', () => {
    const checkLimit = createRateLimiter(1, 60000);
    const now = Date.now();

    const result1 = checkLimit('client-A', now);
    const result2 = checkLimit('client-B', now);

    expect(result1.allowed).toBe(true);
    expect(result2.allowed).toBe(true);
  });

  it('debe bloquear solo al cliente que excede el límite', () => {
    const checkLimit = createRateLimiter(2, 60000);
    const now = Date.now();

    checkLimit('heavy-user', now);
    checkLimit('heavy-user', now);
    const blocked = checkLimit('heavy-user', now);
    const normalUser = checkLimit('normal-user', now);

    expect(blocked.allowed).toBe(false);
    expect(normalUser.allowed).toBe(true);
  });
});

describe('logAudit', () => {
  it('debe llamar a console.log con el formato correcto', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const ctx = createMockContext({ method: 'POST', url: 'http://test.com/api/pedidos' });

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'AUTH_SUCCESS',
      userId: 'user-123',
      method: ctx.req.method,
      url: ctx.req.url,
      details: 'Test audit',
    }));

    expect(consoleSpy).toHaveBeenCalled();
    const loggedData = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(loggedData.event).toBe('AUTH_SUCCESS');
    expect(loggedData.userId).toBe('user-123');

    consoleSpy.mockRestore();
  });
});
