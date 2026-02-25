/**
 * Helpers reutilizables para tests
 */

import type { Pedido, Camarero } from '../src/types';

let _idCounter = 1;

/**
 * Crea un pedido de prueba con valores por defecto
 */
export function createTestPedido(overrides: Partial<Pedido> = {}): Pedido {
  const id = `test-pedido-${_idCounter++}`;
  return {
    id,
    numero: `TEST-${id}`,
    cliente: 'Cliente Test',
    lugar: 'Lugar Test',
    diaEvento: '2024-06-15',
    cantidadCamareros: 3,
    horaEntrada: '14:00',
    horaSalida: '22:00',
    catering: 'no',
    camisa: 'negra',
    asignaciones: [],
    ...overrides,
  };
}

/**
 * Crea un camarero de prueba con valores por defecto
 */
export function createTestCamarero(overrides: Partial<Camarero> = {}): Camarero {
  const id = `test-cam-${_idCounter++}`;
  return {
    id,
    numero: _idCounter,
    nombre: `Camarero ${id}`,
    telefono: '612345678',
    email: `camarero${id}@test.com`,
    activo: true,
    ...overrides,
  };
}

/**
 * Crea un mock de Response HTTP
 */
export function createMockResponse(data: any, status: number = 200): Response {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  } as unknown as Response;
}

/**
 * Crea un JWT de prueba con los claims dados
 */
export function createTestJwt(claims: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    ...claims,
  })).replace(/=/g, '');
  return `${header}.${payload}.test_signature`;
}

/**
 * Espera que una promesa se resuelva en el siguiente tick
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
