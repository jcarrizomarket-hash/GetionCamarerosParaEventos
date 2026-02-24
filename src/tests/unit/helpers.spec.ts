/**
 * Tests unitarios para utilidades del sistema
 * Framework: Vitest
 * 
 * Para ejecutar:
 * npm install -D vitest
 * npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calcularHoras,
  formatearHoras,
  calcularCamarerosNecesarios,
  calcularHoraEncuentro,
  formatearTelefono,
  validarEmail,
  formatearFecha,
  generarId,
  deduplicarPorId,
  isPedidoCompleto,
  calcularPorcentajeConfirmacion,
  parsearFechaEvento,
  parseApiResponse,
  fetchConReintento,
} from '../../src/utils/helpers';

describe('calcularHoras', () => {
  it('debe calcular correctamente las horas trabajadas', () => {
    expect(calcularHoras('09:00', '17:00')).toBe(8);
    expect(calcularHoras('14:30', '18:45')).toBe(4.25);
    expect(calcularHoras('23:00', '02:00')).toBe(3); // Cruza medianoche
  });

  it('debe retornar 0 para entradas inválidas', () => {
    expect(calcularHoras('', '')).toBe(0);
    expect(calcularHoras('invalid', '17:00')).toBe(0);
    expect(calcularHoras('09:00', 'invalid')).toBe(0);
  });

  it('debe manejar formato de 24 horas', () => {
    expect(calcularHoras('00:00', '23:59')).toBeCloseTo(23.98, 1);
    expect(calcularHoras('12:00', '13:30')).toBe(1.5);
  });
});

describe('formatearHoras', () => {
  it('debe formatear horas correctamente', () => {
    expect(formatearHoras(8)).toBe('8h');
    expect(formatearHoras(8.5)).toBe('8h 30min');
    expect(formatearHoras(0.25)).toBe('0h 15min');
    expect(formatearHoras(10.75)).toBe('10h 45min');
  });

  it('debe redondear minutos correctamente', () => {
    expect(formatearHoras(8.33)).toBe('8h 20min'); // 8.33 * 60 = 19.8 ≈ 20
  });
});

describe('calcularCamarerosNecesarios', () => {
  it('debe sumar correctamente los camareros de ambos turnos', () => {
    expect(calcularCamarerosNecesarios(5, 3)).toBe(8);
    expect(calcularCamarerosNecesarios(10, 0)).toBe(10);
    expect(calcularCamarerosNecesarios(7)).toBe(7);
  });

  it('debe manejar valores undefined y null', () => {
    expect(calcularCamarerosNecesarios(5, undefined)).toBe(5);
    expect(calcularCamarerosNecesarios(0, 0)).toBe(0);
  });
});

describe('calcularHoraEncuentro', () => {
  it('debe restar tiempo de viaje + 10 minutos correctamente', () => {
    expect(calcularHoraEncuentro('14:00', 30)).toBe('13:20'); // 30 + 10 = 40 min antes
    expect(calcularHoraEncuentro('09:00', 15)).toBe('08:35'); // 15 + 10 = 25 min antes
  });

  it('debe manejar casos que cruzan medianoche', () => {
    expect(calcularHoraEncuentro('00:30', 60)).toBe('23:20'); // Día anterior
  });

  it('debe retornar string vacío para entradas inválidas', () => {
    expect(calcularHoraEncuentro('', 30)).toBe('');
    expect(calcularHoraEncuentro('14:00', 0)).toBe('');
  });
});

describe('formatearTelefono', () => {
  it('debe agregar código de país a números españoles', () => {
    expect(formatearTelefono('612345678')).toBe('34612345678');
    expect(formatearTelefono('912345678')).toBe('34912345678');
  });

  it('debe limpiar caracteres no numéricos', () => {
    expect(formatearTelefono('612-345-678')).toBe('34612345678');
    expect(formatearTelefono('612 345 678')).toBe('34612345678');
    expect(formatearTelefono('+34 612 345 678')).toBe('34612345678');
  });

  it('debe mantener números con código de país', () => {
    expect(formatearTelefono('34612345678')).toBe('34612345678');
  });

  it('debe retornar string vacío para entrada vacía', () => {
    expect(formatearTelefono('')).toBe('');
  });
});

describe('validarEmail', () => {
  it('debe validar emails correctos', () => {
    expect(validarEmail('usuario@ejemplo.com')).toBe(true);
    expect(validarEmail('test.user+tag@domain.co.uk')).toBe(true);
  });

  it('debe rechazar emails inválidos', () => {
    expect(validarEmail('invalid')).toBe(false);
    expect(validarEmail('invalid@')).toBe(false);
    expect(validarEmail('@domain.com')).toBe(false);
    expect(validarEmail('user @domain.com')).toBe(false);
    expect(validarEmail('')).toBe(false);
  });
});

describe('formatearFecha', () => {
  it('debe formatear fechas correctamente en español', () => {
    const fecha = '2024-01-15';
    const resultado = formatearFecha(fecha);
    expect(resultado).toContain('2024');
    expect(resultado).toContain('enero');
  });

  it('debe aceptar objetos Date', () => {
    const fecha = new Date('2024-01-15');
    const resultado = formatearFecha(fecha);
    expect(resultado).toContain('2024');
  });

  it('debe retornar string vacío para fechas inválidas', () => {
    expect(formatearFecha('fecha-invalida')).toBe('');
  });
});

describe('generarId', () => {
  it('debe generar IDs únicos', () => {
    const id1 = generarId();
    const id2 = generarId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('debe tener formato timestamp-random', () => {
    const id = generarId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('deduplicarPorId', () => {
  it('debe eliminar duplicados por ID', () => {
    const items = [
      { id: '1', nombre: 'A' },
      { id: '2', nombre: 'B' },
      { id: '1', nombre: 'A duplicado' }, // Duplicado
      { id: '3', nombre: 'C' },
    ];

    const resultado = deduplicarPorId(items);
    
    expect(resultado).toHaveLength(3);
    expect(resultado.find(i => i.id === '1')?.nombre).toBe('A');
  });

  it('debe retornar array vacío para entrada vacía', () => {
    expect(deduplicarPorId([])).toEqual([]);
  });
});

describe('isPedidoCompleto', () => {
  it('debe retornar true cuando todos los camareros están confirmados', () => {
    const pedido = {
      cantidadCamareros: 3,
      cantidadCamareros2: 2,
      asignaciones: [
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
      ],
    };

    expect(isPedidoCompleto(pedido)).toBe(true);
  });

  it('debe retornar false cuando faltan confirmaciones', () => {
    const pedido = {
      cantidadCamareros: 5,
      asignaciones: [
        { estado: 'confirmado' },
        { estado: 'pendiente' },
        { estado: 'confirmado' },
      ],
    };

    expect(isPedidoCompleto(pedido)).toBe(false);
  });

  it('debe retornar false cuando no hay asignaciones', () => {
    const pedido = {
      cantidadCamareros: 5,
      asignaciones: [],
    };

    expect(isPedidoCompleto(pedido)).toBe(false);
  });
});

describe('calcularPorcentajeConfirmacion', () => {
  it('debe calcular el porcentaje correctamente', () => {
    const pedido = {
      cantidadCamareros: 10,
      asignaciones: [
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'pendiente' },
        { estado: 'pendiente' },
      ],
    };

    expect(calcularPorcentajeConfirmacion(pedido)).toBe(50); // 5/10 = 50%
  });

  it('debe retornar 0 cuando no hay camareros requeridos', () => {
    const pedido = {
      cantidadCamareros: 0,
      asignaciones: [],
    };

    expect(calcularPorcentajeConfirmacion(pedido)).toBe(0);
  });

  it('debe retornar 100 cuando todos están confirmados', () => {
    const pedido = {
      cantidadCamareros: 5,
      asignaciones: [
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
        { estado: 'confirmado' },
      ],
    };

    expect(calcularPorcentajeConfirmacion(pedido)).toBe(100);
  });
});

describe('parsearFechaEvento', () => {
  it('debe parsear fecha correctamente', () => {
    const fecha = parsearFechaEvento('2024-01-15');
    
    expect(fecha.getFullYear()).toBe(2024);
    expect(fecha.getMonth()).toBe(0); // Enero = 0
    expect(fecha.getDate()).toBe(15);
  });

  it('debe crear fecha a medianoche local', () => {
    const fecha = parsearFechaEvento('2024-06-15');
    
    expect(fecha.getHours()).toBe(0);
    expect(fecha.getMinutes()).toBe(0);
    expect(fecha.getSeconds()).toBe(0);
  });
});

describe('parseApiResponse', () => {
  it('debe retornar error cuando response.ok es false', async () => {
    const response = new Response(JSON.stringify({}), { status: 500, statusText: 'Internal Server Error' });
    const result = await parseApiResponse(response, 'camareros');
    expect(result.data).toBeNull();
    expect(result.error).toContain('Error del servidor en camareros');
    expect(result.error).toContain('500');
  });

  it('debe retornar error cuando el JSON es inválido', async () => {
    const response = new Response('texto no json', { status: 200 });
    const result = await parseApiResponse(response, 'pedidos');
    expect(result.data).toBeNull();
    expect(result.error).toContain('Error al parsear JSON de pedidos');
  });

  it('debe retornar error cuando falta la propiedad success', async () => {
    const response = new Response(JSON.stringify({ data: [] }), { status: 200 });
    const result = await parseApiResponse(response, 'coordinadores');
    expect(result.data).toBeNull();
    expect(result.error).toContain('Estructura inválida');
  });

  it('debe retornar error cuando falta la propiedad data', async () => {
    const response = new Response(JSON.stringify({ success: true }), { status: 200 });
    const result = await parseApiResponse(response, 'clientes');
    expect(result.data).toBeNull();
    expect(result.error).toContain('Estructura inválida');
  });

  it('debe retornar error cuando success es false', async () => {
    const response = new Response(JSON.stringify({ success: false, message: 'No autorizado' }), { status: 200 });
    const result = await parseApiResponse(response, 'camareros');
    expect(result.data).toBeNull();
    expect(result.error).toContain('camareros reportó error: No autorizado');
  });

  it('debe retornar datos cuando la respuesta es válida', async () => {
    const data = [{ id: '1', nombre: 'Juan' }];
    const response = new Response(JSON.stringify({ success: true, data }), { status: 200 });
    const result = await parseApiResponse(response, 'camareros');
    expect(result.error).toBeNull();
    expect(result.data).toEqual(data);
  });
});

describe('fetchConReintento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar la respuesta si el fetch tiene éxito en el primer intento', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true, data: [] }), { status: 200 });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    const result = await fetchConReintento('https://example.com/api', {}, 'endpoint');
    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('debe reintentar y tener éxito tras un fallo', async () => {
    vi.useFakeTimers();
    const mockResponse = new Response(JSON.stringify({ success: true, data: [] }), { status: 200 });
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockResponse);

    let result: Response | undefined;
    await Promise.all([
      vi.runAllTimersAsync(),
      fetchConReintento('https://example.com/api', {}, 'endpoint').then((r) => { result = r; }),
    ]);
    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('debe lanzar error tras agotar los reintentos', async () => {
    vi.useFakeTimers();
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    await Promise.all([
      vi.runAllTimersAsync(),
      expect(fetchConReintento('https://example.com/api', {}, 'endpoint', 2)).rejects.toThrow('Network error'),
    ]);

    vi.useRealTimers();
  });
});
