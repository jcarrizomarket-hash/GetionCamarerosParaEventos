/**
 * Tests unitarios para validadores
 * Framework: Vitest
 */

import { describe, it, expect } from 'vitest';
import {
  validarEmail,
  validarTelefono,
  validarFecha,
  validarNumeroPedido,
} from '../../src/utils/validators';

describe('validarEmail', () => {
  describe('emails válidos', () => {
    it('debe aceptar email básico', () => {
      const result = validarEmail('usuario@ejemplo.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('debe aceptar email con subdominio', () => {
      const result = validarEmail('test@mail.example.com');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar email con punto en nombre de usuario', () => {
      const result = validarEmail('user.name@domain.com');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar email con + en nombre de usuario', () => {
      const result = validarEmail('user+tag@domain.com');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar email con guión en dominio', () => {
      const result = validarEmail('user@my-domain.co.uk');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar email con TLD largo', () => {
      const result = validarEmail('test@example.company');
      expect(result.valid).toBe(true);
    });
  });

  describe('emails inválidos', () => {
    it('debe rechazar email vacío', () => {
      const result = validarEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('debe rechazar email sin @', () => {
      const result = validarEmail('usuarioejemplo.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('debe rechazar email sin dominio', () => {
      const result = validarEmail('usuario@');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar email sin nombre de usuario', () => {
      const result = validarEmail('@domain.com');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar email con espacios', () => {
      const result = validarEmail('user @domain.com');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar email con doble @', () => {
      const result = validarEmail('user@@domain.com');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar solo texto sin estructura', () => {
      const result = validarEmail('invalid');
      expect(result.valid).toBe(false);
    });
  });

  describe('valores límite', () => {
    it('debe rechazar null como string vacío', () => {
      const result = validarEmail(null as unknown as string);
      expect(result.valid).toBe(false);
    });

    it('debe rechazar undefined como string vacío', () => {
      const result = validarEmail(undefined as unknown as string);
      expect(result.valid).toBe(false);
    });
  });
});

describe('validarTelefono', () => {
  describe('teléfonos válidos', () => {
    it('debe aceptar número español de 9 dígitos', () => {
      const result = validarTelefono('612345678');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar número con código de país español', () => {
      const result = validarTelefono('+34612345678');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar número con espacios', () => {
      const result = validarTelefono('612 345 678');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar número con guiones', () => {
      const result = validarTelefono('612-345-678');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar número internacional USA', () => {
      const result = validarTelefono('+15558327331');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar número de teléfono fijo español', () => {
      const result = validarTelefono('912345678');
      expect(result.valid).toBe(true);
    });
  });

  describe('teléfonos inválidos', () => {
    it('debe rechazar teléfono vacío', () => {
      const result = validarTelefono('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('debe rechazar número muy corto', () => {
      const result = validarTelefono('1234');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar número muy largo', () => {
      const result = validarTelefono('12345678901234567890');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar letras como número', () => {
      const result = validarTelefono('abc-def-ghij');
      expect(result.valid).toBe(false);
    });
  });

  describe('valores límite', () => {
    it('debe rechazar null', () => {
      const result = validarTelefono(null as unknown as string);
      expect(result.valid).toBe(false);
    });
  });
});

describe('validarFecha', () => {
  describe('fechas válidas', () => {
    it('debe aceptar fecha en formato YYYY-MM-DD', () => {
      const result = validarFecha('2024-06-15');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar fecha de inicio de año', () => {
      const result = validarFecha('2024-01-01');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar fecha de fin de año', () => {
      const result = validarFecha('2024-12-31');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar año bisiesto', () => {
      const result = validarFecha('2024-02-29');
      expect(result.valid).toBe(true);
    });
  });

  describe('fechas inválidas', () => {
    it('debe rechazar fecha vacía', () => {
      const result = validarFecha('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('debe rechazar formato incorrecto DD/MM/YYYY', () => {
      const result = validarFecha('15/06/2024');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('YYYY-MM-DD');
    });

    it('debe rechazar formato incorrecto MM-DD-YYYY', () => {
      const result = validarFecha('06-15-2024');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar fecha con mes inválido', () => {
      const result = validarFecha('2024-13-01');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar fecha con día inválido', () => {
      const result = validarFecha('2024-01-32');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar 29 de febrero en año no bisiesto', () => {
      const result = validarFecha('2023-02-29');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar texto en lugar de fecha', () => {
      const result = validarFecha('fecha-invalida');
      expect(result.valid).toBe(false);
    });
  });

  describe('valores límite', () => {
    it('debe rechazar null', () => {
      const result = validarFecha(null as unknown as string);
      expect(result.valid).toBe(false);
    });

    it('debe rechazar undefined', () => {
      const result = validarFecha(undefined as unknown as string);
      expect(result.valid).toBe(false);
    });
  });
});

describe('validarNumeroPedido', () => {
  describe('números válidos', () => {
    it('debe aceptar formato alfanumérico simple', () => {
      const result = validarNumeroPedido('P2024001');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar formato con guiones', () => {
      const result = validarNumeroPedido('P-2024-001');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar número de solo dígitos', () => {
      const result = validarNumeroPedido('20240001');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar formato TEST-001', () => {
      const result = validarNumeroPedido('TEST-001');
      expect(result.valid).toBe(true);
    });

    it('debe aceptar letras mayúsculas y minúsculas', () => {
      const result = validarNumeroPedido('Abc-123');
      expect(result.valid).toBe(true);
    });
  });

  describe('números inválidos', () => {
    it('debe rechazar número vacío', () => {
      const result = validarNumeroPedido('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('debe rechazar número muy largo (más de 20 caracteres)', () => {
      const result = validarNumeroPedido('A-' + '1'.repeat(25));
      expect(result.valid).toBe(false);
    });

    it('debe rechazar carácter especial inválido @', () => {
      const result = validarNumeroPedido('P@2024-001');
      expect(result.valid).toBe(false);
    });

    it('debe rechazar solo un carácter', () => {
      const result = validarNumeroPedido('A');
      expect(result.valid).toBe(false);
    });
  });

  describe('valores límite', () => {
    it('debe rechazar null', () => {
      const result = validarNumeroPedido(null as unknown as string);
      expect(result.valid).toBe(false);
    });

    it('debe rechazar undefined', () => {
      const result = validarNumeroPedido(undefined as unknown as string);
      expect(result.valid).toBe(false);
    });
  });
});
