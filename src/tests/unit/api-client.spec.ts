/**
 * Tests unitarios para el cliente API
 * Framework: Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  createCoordinador,
  getClientes,
  createCliente,
  verificarWhatsAppConfig,
  enviarWhatsApp,
  verificarEmailConfig,
  isConfigValid,
  getConfig,
} from '../../src/api/client';
import { createMockFetch, createMockFetchError } from '../mocks';
import { mockApiResponses, mockPedidos, mockCamareros } from '../fixtures';

// Helpers para crear respuestas mock de fetch
function mockFetchOnce(data: any, status: number = 200) {
  const ok = status >= 200 && status < 300;
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getPedidos', () => {
  it('debe retornar lista de pedidos en respuesta exitosa', async () => {
    mockFetchOnce(mockApiResponses.pedidosSuccess);

    const result = await getPedidos();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('debe llamar al endpoint correcto', async () => {
    mockFetchOnce(mockApiResponses.pedidosSuccess);

    await getPedidos();

    expect(global.fetch).toHaveBeenCalledOnce();
    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/pedidos');
  });

  it('debe incluir header Authorization', async () => {
    mockFetchOnce(mockApiResponses.pedidosSuccess);

    await getPedidos();

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers['Authorization']).toBeDefined();
    expect(options.headers['Authorization']).toContain('Bearer');
  });

  it('debe manejar respuesta 404 correctamente', async () => {
    mockFetchOnce(mockApiResponses.notFound, 404);

    const result = await getPedidos();

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Connection refused');

    const result = await getPedidos();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Connection refused');
  });

  it('debe manejar error 500 del servidor', async () => {
    mockFetchOnce(mockApiResponses.serverError, 500);

    const result = await getPedidos();

    expect(result.success).toBe(false);
  });
});

describe('getPedido', () => {
  it('debe retornar un pedido por ID', async () => {
    mockFetchOnce(mockApiResponses.pedidoSuccess);

    const result = await getPedido('pedido-001');

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('pedido-001');
  });

  it('debe incluir el ID en la URL', async () => {
    mockFetchOnce(mockApiResponses.pedidoSuccess);

    await getPedido('pedido-123');

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('pedido-123');
  });

  it('debe manejar pedido no encontrado', async () => {
    mockFetchOnce(mockApiResponses.notFound, 404);

    const result = await getPedido('no-existe');

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Timeout');

    const result = await getPedido('pedido-001');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Timeout');
  });
});

describe('createPedido', () => {
  const nuevoPedido = {
    numero: 'P-2024-NEW',
    cliente: 'Nuevo Cliente',
    lugar: 'Nuevo Lugar',
    diaEvento: '2024-09-15',
    cantidadCamareros: 5,
    horaEntrada: '18:00',
    catering: 'no' as const,
    camisa: 'negra' as const,
    asignaciones: [],
  };

  it('debe crear un pedido y retornar el resultado', async () => {
    mockFetchOnce(mockApiResponses.createSuccess);

    const result = await createPedido(nuevoPedido);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('debe usar método POST', async () => {
    mockFetchOnce(mockApiResponses.createSuccess);

    await createPedido(nuevoPedido);

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe('POST');
  });

  it('debe enviar el cuerpo del pedido en JSON', async () => {
    mockFetchOnce(mockApiResponses.createSuccess);

    await createPedido(nuevoPedido);

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.body).toBe(JSON.stringify(nuevoPedido));
  });

  it('debe incluir Content-Type application/json', async () => {
    mockFetchOnce(mockApiResponses.createSuccess);

    await createPedido(nuevoPedido);

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('debe manejar error de validación 400', async () => {
    mockFetchOnce({ success: false, error: 'Datos inválidos' }, 400);

    const result = await createPedido(nuevoPedido);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await createPedido(nuevoPedido);

    expect(result.success).toBe(false);
  });
});

describe('updatePedido', () => {
  it('debe actualizar un pedido existente', async () => {
    const updated = { ...mockPedidos.pedidoSimple, cliente: 'Cliente Actualizado' };
    mockFetchOnce({ success: true, data: updated });

    const result = await updatePedido('pedido-001', { cliente: 'Cliente Actualizado' });

    expect(result.success).toBe(true);
  });

  it('debe usar método PUT', async () => {
    mockFetchOnce({ success: true, data: mockPedidos.pedidoSimple });

    await updatePedido('pedido-001', { cliente: 'Nuevo' });

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe('PUT');
  });

  it('debe incluir el ID en la URL', async () => {
    mockFetchOnce({ success: true, data: mockPedidos.pedidoSimple });

    await updatePedido('pedido-456', { cliente: 'Nuevo' });

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('pedido-456');
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Connection timeout');

    const result = await updatePedido('pedido-001', { cliente: 'Nuevo' });

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('deletePedido', () => {
  it('debe eliminar un pedido', async () => {
    mockFetchOnce(mockApiResponses.deleteSuccess);

    const result = await deletePedido('pedido-001');

    expect(result.success).toBe(true);
  });

  it('debe usar método DELETE', async () => {
    mockFetchOnce(mockApiResponses.deleteSuccess);

    await deletePedido('pedido-001');

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe('DELETE');
  });

  it('debe incluir el ID en la URL', async () => {
    mockFetchOnce(mockApiResponses.deleteSuccess);

    await deletePedido('pedido-789');

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('pedido-789');
  });

  it('debe manejar error 404', async () => {
    mockFetchOnce(mockApiResponses.notFound, 404);

    const result = await deletePedido('no-existe');

    expect(result.success).toBe(false);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await deletePedido('pedido-001');

    expect(result.success).toBe(false);
  });
});

describe('getCamareros', () => {
  it('debe retornar lista de camareros', async () => {
    mockFetchOnce({ success: true, data: [mockCamareros.camarero1, mockCamareros.camarero2] });

    const result = await getCamareros();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('debe llamar al endpoint de camareros', async () => {
    mockFetchOnce({ success: true, data: [] });

    await getCamareros();

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/camareros');
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await getCamareros();

    expect(result.success).toBe(false);
  });
});

describe('getCamarero', () => {
  it('debe retornar un camarero por ID', async () => {
    mockFetchOnce({ success: true, data: mockCamareros.camarero1 });

    const result = await getCamarero('cam-001');

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('cam-001');
  });

  it('debe manejar camarero no encontrado', async () => {
    mockFetchOnce(mockApiResponses.notFound, 404);

    const result = await getCamarero('no-existe');

    expect(result.success).toBe(false);
  });
});

describe('createCamarero', () => {
  const nuevoCamarero = {
    numero: 10,
    nombre: 'Nuevo Camarero',
    telefono: '612345678',
    activo: true,
    asignaciones: [],
  };

  it('debe crear un camarero', async () => {
    mockFetchOnce({ success: true, data: { id: 'cam-new', ...nuevoCamarero } });

    const result = await createCamarero(nuevoCamarero);

    expect(result.success).toBe(true);
  });

  it('debe usar método POST', async () => {
    mockFetchOnce({ success: true, data: { id: 'cam-new', ...nuevoCamarero } });

    await createCamarero(nuevoCamarero);

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe('POST');
  });
});

describe('updateCamarero', () => {
  it('debe actualizar un camarero', async () => {
    mockFetchOnce({ success: true, data: { ...mockCamareros.camarero1, nombre: 'Actualizado' } });

    const result = await updateCamarero('cam-001', { nombre: 'Actualizado' });

    expect(result.success).toBe(true);
  });

  it('debe usar método PUT', async () => {
    mockFetchOnce({ success: true, data: mockCamareros.camarero1 });

    await updateCamarero('cam-001', { nombre: 'Nuevo' });

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe('PUT');
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await updateCamarero('cam-001', { nombre: 'Nuevo' });

    expect(result.success).toBe(false);
  });
});

describe('deleteCamarero', () => {
  it('debe eliminar un camarero', async () => {
    mockFetchOnce({ success: true, message: 'Camarero eliminado' });

    const result = await deleteCamarero('cam-001');

    expect(result.success).toBe(true);
  });

  it('debe usar método DELETE', async () => {
    mockFetchOnce({ success: true });

    await deleteCamarero('cam-001');

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe('DELETE');
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await deleteCamarero('cam-001');

    expect(result.success).toBe(false);
  });
});

describe('getCoordinadores', () => {
  it('debe retornar lista de coordinadores', async () => {
    mockFetchOnce({ success: true, data: [] });

    const result = await getCoordinadores();

    expect(result.success).toBe(true);
  });

  it('debe llamar al endpoint de coordinadores', async () => {
    mockFetchOnce({ success: true, data: [] });

    await getCoordinadores();

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/coordinadores');
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await getCoordinadores();

    expect(result.success).toBe(false);
  });
});

describe('getCoordinador', () => {
  it('debe retornar un coordinador por ID', async () => {
    const coord = { id: 'coord-001', nombre: 'Carlos' };
    mockFetchOnce({ success: true, data: coord });

    const result = await getCoordinador('coord-001');

    expect(result.success).toBe(true);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await getCoordinador('coord-001');

    expect(result.success).toBe(false);
  });
});

describe('createCoordinador', () => {
  it('debe crear un coordinador', async () => {
    const nuevoCoord = { nombre: 'Nuevo', telefono: '612345678', activo: true };
    mockFetchOnce({ success: true, data: { id: 'coord-new', ...nuevoCoord } });

    const result = await createCoordinador(nuevoCoord);

    expect(result.success).toBe(true);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await createCoordinador({ nombre: 'Test', activo: true });

    expect(result.success).toBe(false);
  });
});

describe('getClientes', () => {
  it('debe retornar lista de clientes', async () => {
    mockFetchOnce({ success: true, data: [] });

    const result = await getClientes();

    expect(result.success).toBe(true);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await getClientes();

    expect(result.success).toBe(false);
  });
});

describe('createCliente', () => {
  it('debe crear un cliente', async () => {
    const nuevoCliente = { nombre: 'Empresa Test' };
    mockFetchOnce({ success: true, data: { id: 'cli-new', ...nuevoCliente } });

    const result = await createCliente(nuevoCliente);

    expect(result.success).toBe(true);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await createCliente({ nombre: 'Test' });

    expect(result.success).toBe(false);
  });
});

describe('verificarWhatsAppConfig', () => {
  it('debe retornar configuración de WhatsApp', async () => {
    mockFetchOnce({ success: true, data: { configured: true } });

    const result = await verificarWhatsAppConfig();

    expect(result.success).toBe(true);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await verificarWhatsAppConfig();

    expect(result.success).toBe(false);
  });
});

describe('enviarWhatsApp', () => {
  it('debe enviar mensaje de WhatsApp', async () => {
    mockFetchOnce({ success: true });

    const result = await enviarWhatsApp('+34612345678', 'Hola');

    expect(result.success).toBe(true);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await enviarWhatsApp('+34612345678', 'Hola');

    expect(result.success).toBe(false);
  });
});

describe('verificarEmailConfig', () => {
  it('debe retornar configuración de email', async () => {
    mockFetchOnce({ success: true, data: { configured: true } });

    const result = await verificarEmailConfig();

    expect(result.success).toBe(true);
  });

  it('debe manejar error de red', async () => {
    global.fetch = createMockFetchError('Network error');

    const result = await verificarEmailConfig();

    expect(result.success).toBe(false);
  });
});

describe('isConfigValid', () => {
  it('debe retornar true cuando las variables de entorno están configuradas', () => {
    const result = isConfigValid();
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true); // env vars set in vitest.config.ts
  });
});

describe('getConfig', () => {
  it('debe retornar la configuración actual', () => {
    const config = getConfig();
    expect(config).toHaveProperty('projectId');
    expect(config).toHaveProperty('publicAnonKey');
  });
});
