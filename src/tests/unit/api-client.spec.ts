/**
 * Tests unitarios para el cliente API centralizado
 * Verifica todas las operaciones CRUD con manejo de errores y fetch mock
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockFetchSuccess,
  mockFetchNetworkError,
  mockFetchHttpError,
  resetFetchMock,
} from '../mocks/fetch';

// ---------------------------------------------------------------------------
// Module under test – imported AFTER mocks are configured
// ---------------------------------------------------------------------------
import {
  getPedidos,
  getPedido,
  createPedido,
  updatePedido,
  deletePedido,
  getCamareros,
  getCamarero,
  createCamarero,
  updateCamarero,
  deleteCamarero,
  getCoordinadores,
  getCoordinador,
  getClientes,
  enviarWhatsApp,
  isConfigValid,
  getConfig,
} from '../../src/api/client';

import { pedidoCompleto, pedidoParcial } from '../fixtures/pedidos';
import { camareroActivo, listaCamareros } from '../fixtures/camareros';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure fetch is a vi.fn (set up in setup.ts)
  global.fetch = vi.fn();
});

afterEach(() => {
  resetFetchMock();
});

// ---------------------------------------------------------------------------
// PEDIDOS
// ---------------------------------------------------------------------------

describe('getPedidos', () => {
  it('debe devolver lista de pedidos exitosamente', async () => {
    const apiResponse = { success: true, data: [pedidoCompleto, pedidoParcial] };
    mockFetchSuccess(apiResponse);

    const result = await getPedidos();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledOnce();
    const [url, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/pedidos');
    expect(options.method).toBe('GET');
  });

  it('debe manejar error de red', async () => {
    mockFetchNetworkError('Connection refused');

    const result = await getPedidos();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Connection refused');
  });

  it('debe manejar error HTTP 500', async () => {
    mockFetchHttpError('Internal server error', 500);

    const result = await getPedidos();

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('getPedido', () => {
  it('debe obtener un pedido por ID', async () => {
    const apiResponse = { success: true, data: pedidoCompleto };
    mockFetchSuccess(apiResponse);

    const result = await getPedido('pedido-001');

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('pedido-001');
    const [url] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/pedidos/pedido-001');
  });

  it('debe manejar pedido no encontrado (404)', async () => {
    mockFetchHttpError('Pedido no encontrado', 404);

    const result = await getPedido('id-inexistente');

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('createPedido', () => {
  it('debe crear un nuevo pedido con método POST', async () => {
    const { id, ...nuevoPedido } = pedidoCompleto;
    const apiResponse = { success: true, data: pedidoCompleto };
    mockFetchSuccess(apiResponse);

    const result = await createPedido(nuevoPedido);

    expect(result.success).toBe(true);
    const [url, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/pedidos');
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify(nuevoPedido));
  });

  it('debe manejar error de validación (400)', async () => {
    mockFetchHttpError('Campos requeridos faltantes', 400);
    const { id, ...pedidoInvalido } = pedidoCompleto;

    const result = await createPedido(pedidoInvalido);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Campos requeridos faltantes');
  });

  it('debe manejar error de red al crear', async () => {
    mockFetchNetworkError('Timeout');
    const { id, ...nuevoPedido } = pedidoCompleto;

    const result = await createPedido(nuevoPedido);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Timeout');
  });
});

describe('updatePedido', () => {
  it('debe actualizar un pedido con método PUT', async () => {
    const cambios = { notas: 'Actualizado' };
    const apiResponse = { success: true, data: { ...pedidoCompleto, ...cambios } };
    mockFetchSuccess(apiResponse);

    const result = await updatePedido('pedido-001', cambios);

    expect(result.success).toBe(true);
    const [url, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/pedidos/pedido-001');
    expect(options.method).toBe('PUT');
    expect(options.body).toBe(JSON.stringify(cambios));
  });
});

describe('deletePedido', () => {
  it('debe eliminar un pedido con método DELETE', async () => {
    const apiResponse = { success: true };
    mockFetchSuccess(apiResponse);

    const result = await deletePedido('pedido-001');

    expect(result.success).toBe(true);
    const [url, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/pedidos/pedido-001');
    expect(options.method).toBe('DELETE');
  });
});

// ---------------------------------------------------------------------------
// CAMAREROS
// ---------------------------------------------------------------------------

describe('getCamareros', () => {
  it('debe devolver lista de camareros', async () => {
    const apiResponse = { success: true, data: listaCamareros };
    mockFetchSuccess(apiResponse);

    const result = await getCamareros();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(4);
    const [url, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/camareros');
    expect(options.method).toBe('GET');
  });

  it('debe manejar lista vacía', async () => {
    mockFetchSuccess({ success: true, data: [] });

    const result = await getCamareros();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('debe manejar error de red', async () => {
    mockFetchNetworkError('Network error');

    const result = await getCamareros();

    expect(result.success).toBe(false);
  });
});

describe('getCamarero', () => {
  it('debe obtener un camarero por ID', async () => {
    mockFetchSuccess({ success: true, data: camareroActivo });

    const result = await getCamarero('cam-001');

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('cam-001');
  });
});

describe('createCamarero', () => {
  it('debe crear un camarero con método POST', async () => {
    const { id, ...nuevoCamarero } = camareroActivo;
    mockFetchSuccess({ success: true, data: camareroActivo });

    const result = await createCamarero(nuevoCamarero);

    expect(result.success).toBe(true);
    const [, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe('POST');
  });
});

describe('updateCamarero', () => {
  it('debe actualizar un camarero con método PUT', async () => {
    const cambios = { activo: false };
    mockFetchSuccess({ success: true, data: { ...camareroActivo, ...cambios } });

    const result = await updateCamarero('cam-001', cambios);

    expect(result.success).toBe(true);
    const [, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe('PUT');
  });
});

describe('deleteCamarero', () => {
  it('debe eliminar un camarero con método DELETE', async () => {
    mockFetchSuccess({ success: true });

    const result = await deleteCamarero('cam-001');

    expect(result.success).toBe(true);
    const [, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe('DELETE');
  });
});

// ---------------------------------------------------------------------------
// COORDINADORES
// ---------------------------------------------------------------------------

describe('getCoordinadores', () => {
  it('debe devolver lista de coordinadores', async () => {
    const coordinadores = [{ id: 'coord-1', nombre: 'Coord Test', activo: true }];
    mockFetchSuccess({ success: true, data: coordinadores });

    const result = await getCoordinadores();

    expect(result.success).toBe(true);
    const [url] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/coordinadores');
  });
});

describe('getCoordinador', () => {
  it('debe obtener un coordinador por ID', async () => {
    const coordinador = { id: 'coord-1', nombre: 'Test' };
    mockFetchSuccess({ success: true, data: coordinador });

    const result = await getCoordinador('coord-1');

    expect(result.success).toBe(true);
    const [url] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/coordinadores/coord-1');
  });
});

// ---------------------------------------------------------------------------
// CLIENTES
// ---------------------------------------------------------------------------

describe('getClientes', () => {
  it('debe devolver lista de clientes', async () => {
    const clientes = [{ id: 'cli-1', nombre: 'Cliente Test' }];
    mockFetchSuccess({ success: true, data: clientes });

    const result = await getClientes();

    expect(result.success).toBe(true);
    const [url] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/clientes');
  });
});

// ---------------------------------------------------------------------------
// WHATSAPP
// ---------------------------------------------------------------------------

describe('enviarWhatsApp', () => {
  it('debe enviar mensaje con POST y parámetros correctos', async () => {
    mockFetchSuccess({ success: true, message: 'Enviado' });

    const result = await enviarWhatsApp('34612345678', 'Hola, tu turno es mañana');

    expect(result.success).toBe(true);
    const [url, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/enviar-whatsapp');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body as string);
    expect(body.telefono).toBe('34612345678');
    expect(body.mensaje).toBe('Hola, tu turno es mañana');
  });

  it('debe manejar error al enviar', async () => {
    mockFetchNetworkError('WhatsApp API unreachable');

    const result = await enviarWhatsApp('34612345678', 'Test');

    expect(result.success).toBe(false);
    expect(result.error).toContain('WhatsApp API unreachable');
  });
});

// ---------------------------------------------------------------------------
// CONFIGURACIÓN Y UTILIDADES
// ---------------------------------------------------------------------------

describe('getConfig', () => {
  it('debe devolver objeto de configuración con projectId y publicAnonKey', () => {
    const config = getConfig();
    expect(config).toHaveProperty('projectId');
    expect(config).toHaveProperty('publicAnonKey');
  });
});

describe('isConfigValid', () => {
  it('debe devolver boolean', () => {
    const resultado = isConfigValid();
    expect(typeof resultado).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// HEADERS
// ---------------------------------------------------------------------------

describe('headers de autorización', () => {
  it('debe incluir Authorization header en peticiones GET', async () => {
    mockFetchSuccess({ success: true, data: [] });

    await getPedidos();

    const [, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['Authorization']).toMatch(/^Bearer /);
  });

  it('debe incluir Content-Type en peticiones POST', async () => {
    const { id, ...nuevoPedido } = pedidoCompleto;
    mockFetchSuccess({ success: true, data: pedidoCompleto });

    await createPedido(nuevoPedido);

    const [, options] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });
});
