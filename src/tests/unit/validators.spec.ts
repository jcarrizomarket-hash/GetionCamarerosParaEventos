/**
 * Tests unitarios para funciones de validación
 * Cubre validación de emails, teléfonos y otros campos del dominio
 */

import { describe, it, expect } from 'vitest';
import {
  validarEmail,
  formatearTelefono,
  calcularHoraEncuentro,
  calcularHoras,
} from '../../src/utils/helpers';

describe('validarEmail', () => {
  describe('emails válidos', () => {
    const validosEjemplos = [
      'usuario@ejemplo.com',
      'test.user+tag@domain.co.uk',
      'nombre.apellido@empresa.es',
      'usuario123@gmail.com',
      'test@subdomain.domain.org',
    ];

    validosEjemplos.forEach(email => {
      it(`debe aceptar: ${email}`, () => {
        expect(validarEmail(email)).toBe(true);
      });
    });
  });

  describe('emails inválidos', () => {
    const invalidosEjemplos = [
      { valor: '', descripcion: 'string vacío' },
      { valor: 'invalid', descripcion: 'sin @' },
      { valor: 'invalid@', descripcion: 'sin dominio' },
      { valor: '@domain.com', descripcion: 'sin usuario' },
      { valor: 'user @domain.com', descripcion: 'con espacio' },
      { valor: 'user@domain', descripcion: 'sin TLD' },
    ];

    invalidosEjemplos.forEach(({ valor, descripcion }) => {
      it(`debe rechazar: ${descripcion}`, () => {
        expect(validarEmail(valor)).toBe(false);
      });
    });
  });
});

describe('formatearTelefono - validaciones', () => {
  describe('números válidos para España', () => {
    it('debe formatear número de móvil español (6xx)', () => {
      const resultado = formatearTelefono('612345678');
      expect(resultado).toBe('34612345678');
      expect(resultado).toHaveLength(11);
    });

    it('debe formatear número de fijo español (9xx)', () => {
      const resultado = formatearTelefono('912345678');
      expect(resultado).toBe('34912345678');
      expect(resultado).toHaveLength(11);
    });

    it('debe aceptar número ya con código de país', () => {
      expect(formatearTelefono('34612345678')).toBe('34612345678');
    });

    it('debe retornar string vacío para entrada vacía', () => {
      expect(formatearTelefono('')).toBe('');
    });
  });

  describe('limpieza de caracteres', () => {
    it('debe eliminar guiones', () => {
      expect(formatearTelefono('612-345-678')).toBe('34612345678');
    });

    it('debe eliminar espacios', () => {
      expect(formatearTelefono('612 345 678')).toBe('34612345678');
    });

    it('debe eliminar paréntesis', () => {
      expect(formatearTelefono('(612) 345 678')).toBe('34612345678');
    });

    it('debe eliminar el prefijo +34', () => {
      expect(formatearTelefono('+34 612 345 678')).toBe('34612345678');
    });
  });
});

describe('calcularHoras - validaciones de formato', () => {
  describe('entradas inválidas', () => {
    it('debe retornar 0 para horas vacías', () => {
      expect(calcularHoras('', '')).toBe(0);
    });

    it('debe retornar 0 para hora de entrada inválida', () => {
      expect(calcularHoras('invalid', '17:00')).toBe(0);
    });

    it('debe retornar 0 para hora de salida inválida', () => {
      expect(calcularHoras('09:00', 'invalid')).toBe(0);
    });

    it('debe retornar 0 para ambas inválidas', () => {
      expect(calcularHoras('abc', 'xyz')).toBe(0);
    });
  });

  describe('entradas válidas', () => {
    it('debe calcular 8 horas entre 09:00 y 17:00', () => {
      expect(calcularHoras('09:00', '17:00')).toBe(8);
    });

    it('debe calcular 0.5 horas (30 minutos)', () => {
      expect(calcularHoras('10:00', '10:30')).toBe(0.5);
    });

    it('debe calcular horas que cruzan medianoche', () => {
      expect(calcularHoras('23:00', '02:00')).toBe(3);
    });
  });
});

describe('calcularHoraEncuentro - validaciones', () => {
  describe('entradas inválidas', () => {
    it('debe retornar string vacío para hora vacía', () => {
      expect(calcularHoraEncuentro('', 30)).toBe('');
    });

    it('debe retornar string vacío para tiempo de viaje 0', () => {
      expect(calcularHoraEncuentro('14:00', 0)).toBe('');
    });
  });

  describe('cálculos válidos', () => {
    it('debe restar tiempo de viaje + 10 minutos', () => {
      // 30 min viaje + 10 min buffer = 40 min antes de las 14:00 = 13:20
      expect(calcularHoraEncuentro('14:00', 30)).toBe('13:20');
    });

    it('debe manejar desbordamiento de medianoche', () => {
      // 60 min viaje + 10 min buffer = 70 min antes de las 00:30 = 23:20
      expect(calcularHoraEncuentro('00:30', 60)).toBe('23:20');
    });

    it('debe retornar hora en formato HH:MM con padding', () => {
      const resultado = calcularHoraEncuentro('09:00', 15);
      expect(resultado).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});
