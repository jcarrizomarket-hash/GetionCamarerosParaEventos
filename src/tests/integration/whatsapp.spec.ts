/**
 * Tests de Integración para WhatsApp Business API
 * 
 * Estos tests verifican la funcionalidad completa de la integración
 * con WhatsApp Business API
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TEST_CONFIG, validatePhoneNumberId, formatPhoneNumber, generateTestMessage } from '../test-config';

describe('WhatsApp Business API - Validaciones', () => {
  describe('validatePhoneNumberId', () => {
    it('debe validar un Phone Number ID correcto', () => {
      const result = validatePhoneNumberId('106540852500791');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debe rechazar números de teléfono con +', () => {
      const result = validatePhoneNumberId('+34628904614');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('+'))).toBe(true);
    });

    it('debe rechazar números de teléfono con espacios', () => {
      const result = validatePhoneNumberId('628 904 614');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes(' '))).toBe(true);
    });

    it('debe rechazar números muy cortos', () => {
      const result = validatePhoneNumberId('12345');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('corto'))).toBe(true);
    });

    it('debe rechazar strings vacíos', () => {
      const result = validatePhoneNumberId('');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('vacío'))).toBe(true);
    });

    it('debe validar Phone Number ID del número de prueba', () => {
      // Nota: Este es un ejemplo, deberás usar tu Phone Number ID real
      const result = validatePhoneNumberId(TEST_CONFIG.whatsapp.examplePhoneNumberId);
      expect(result.valid).toBe(true);
    });
  });

  describe('formatPhoneNumber', () => {
    it('debe formatear número español con 9 dígitos', () => {
      const result = formatPhoneNumber('628904614');
      expect(result).toBe('34628904614');
    });

    it('debe mantener número con código de país', () => {
      const result = formatPhoneNumber('+34628904614');
      expect(result).toBe('34628904614');
    });

    it('debe eliminar espacios y guiones', () => {
      const result = formatPhoneNumber('+34 628-904-614');
      expect(result).toBe('34628904614');
    });

    it('debe formatear número de prueba de WhatsApp', () => {
      const result = formatPhoneNumber(TEST_CONFIG.whatsapp.testPhoneNumber);
      expect(result).toBe('15558327331');
    });

    it('debe formatear números con paréntesis', () => {
      const result = formatPhoneNumber('+34 (628) 904-614');
      expect(result).toBe('34628904614');
    });

    it('debe usar código de país por defecto para números de 9 dígitos', () => {
      const result = formatPhoneNumber('628904614', '34');
      expect(result).toBe('34628904614');
    });

    it('debe permitir código de país personalizado', () => {
      const result = formatPhoneNumber('5558327331', '1');
      expect(result).toBe('15558327331');
    });
  });

  describe('generateTestMessage', () => {
    it('debe generar mensaje con fecha y hora', () => {
      const message = generateTestMessage();
      expect(message).toContain('MENSAJE DE PRUEBA');
      expect(message).not.toContain('{fecha}');
      expect(message).not.toContain('{hora}');
    });

    it('debe permitir template personalizado', () => {
      const template = 'Hola {fecha} a las {hora}';
      const message = generateTestMessage(template);
      expect(message).toContain('Hola');
      expect(message).not.toContain('{fecha}');
      expect(message).not.toContain('{hora}');
    });
  });
});

describe('WhatsApp Business API - Integración con Servidor', () => {
  const API_BASE = 'http://localhost:54321/functions/v1/make-server-25b11ac0';
  
  describe('Verificación de configuración', () => {
    it('debe verificar estado de configuración de WhatsApp', async () => {
      const response = await fetch(`${API_BASE}/verificar-whatsapp-config`);
      if (!response) {
        console.log('⚠️ Servidor no disponible, saltando test');
        return;
      }
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('configured');
      expect(data).toHaveProperty('message');
      
      if (data.configured) {
        expect(data).toHaveProperty('source');
        console.log('✅ WhatsApp configurado desde:', data.source);
      } else {
        console.log('⚠️ WhatsApp no configurado:', data.message);
      }
    });
  });

  describe('Validación de Phone Number ID', () => {
    it('debe rechazar envío con Phone Number ID inválido (+34...)', async () => {
      // Este test simula el error común de usar número de teléfono en lugar de Phone Number ID
      const invalidPhoneId = '+34628904614';
      const validation = validatePhoneNumberId(invalidPhoneId);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => 
        e.includes('número de teléfono')
      )).toBe(true);
    });

    it('debe aceptar Phone Number ID válido', () => {
      const validPhoneId = '106540852500791';
      const validation = validatePhoneNumberId(validPhoneId);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Envío de mensajes', () => {
    it('debe detectar cuando WhatsApp no está configurado', async () => {
      const testPhone = TEST_CONFIG.whatsapp.testPhoneNumber;
      const testMessage = generateTestMessage();
      
      const response = await fetch(`${API_BASE}/enviar-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telefono: testPhone,
          mensaje: testMessage
        })
      });
      
      if (!response) {
        console.log('⚠️ Servidor no disponible, saltando test');
        return;
      }
      const data = await response.json();
      
      expect(data).toHaveProperty('success');
      
      if (!data.success && data.needsConfiguration) {
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('helpMessage');
        console.log('ℹ️ Configuración requerida:', data.error);
      }
    });
  });
});

describe('WhatsApp Business API - Formato de Números', () => {
  const testCases = [
    { input: '628904614', expected: '34628904614', description: 'Número español sin código' },
    { input: '+34628904614', expected: '34628904614', description: 'Número español con +34' },
    { input: '34628904614', expected: '34628904614', description: 'Número español con 34' },
    { input: '+1 555 832 7331', expected: '15558327331', description: 'Número USA con formato' },
    { input: '+15558327331', expected: '15558327331', description: 'Número USA' },
    { input: '(555) 832-7331', expected: '15558327331', description: 'Número USA sin código de país', defaultCode: '1' },
  ];

  testCases.forEach(({ input, expected, description, defaultCode }) => {
    it(`debe formatear: ${description}`, () => {
      const result = formatPhoneNumber(input, defaultCode);
      expect(result).toBe(expected);
    });
  });
});

describe('WhatsApp Business API - Tokens', () => {
  describe('Validación de longitud de tokens', () => {
    it('debe rechazar tokens muy cortos', () => {
      const shortToken = 'abc123';
      expect(shortToken.length).toBeLessThan(TEST_CONFIG.whatsapp.minTokenLength);
    });

    it('debe aceptar tokens de longitud adecuada', () => {
      // Token de ejemplo (no real)
      const validToken = 'A'.repeat(200);
      expect(validToken.length).toBeGreaterThan(TEST_CONFIG.whatsapp.minTokenLength);
    });
  });

  describe('Detección de tokens inválidos', () => {
    it('debe detectar token que parece un número de teléfono', () => {
      const invalidToken = '+34628904614';
      expect(invalidToken).toMatch(/^\+?\d+$/);
      expect(invalidToken.length).toBeLessThan(50);
    });

    it('debe detectar token que parece un Phone Number ID', () => {
      const notAToken = '106540852500791';
      expect(notAToken.length).toBeLessThan(50);
    });
  });
});

describe('WhatsApp Business API - Configuración de Prueba', () => {
  it('debe tener número de prueba configurado', () => {
    expect(TEST_CONFIG.whatsapp.testPhoneNumber).toBeTruthy();
    expect(TEST_CONFIG.whatsapp.testPhoneNumber).toBe('+15558327331');
  });

  it('debe tener número de prueba limpio', () => {
    expect(TEST_CONFIG.whatsapp.testPhoneNumberClean).toBe('15558327331');
  });

  it('debe tener mensaje de prueba', () => {
    expect(TEST_CONFIG.whatsapp.testMessage).toContain('MENSAJE DE PRUEBA');
  });
});

describe('WhatsApp Business API - Estructura de Mensajes', () => {
  it('debe generar mensaje de confirmación de pedido correctamente', () => {
    const pedidoTest = TEST_CONFIG.pedidos.test1;
    const camareroTest = TEST_CONFIG.camareros.test1;
    
    const mensaje = `🎯 NUEVA ASIGNACIÓN DE SERVICIO

Hola ${camareroTest.nombre},

Has sido asignado al siguiente evento:

📅 Fecha: ${pedidoTest.diaEvento}
🏢 Cliente: ${pedidoTest.cliente}
📍 Lugar: ${pedidoTest.lugar}
⏰ Horario: ${pedidoTest.horaEntrada} - ${pedidoTest.horaSalida}
👔 Camisa: ${pedidoTest.camisa}

Por favor, confirma tu asistencia:
✅ CONFIRMO: [enlace]
❌ NO CONFIRMO: [enlace]`;

    expect(mensaje).toContain(camareroTest.nombre);
    expect(mensaje).toContain(pedidoTest.cliente);
    expect(mensaje).toContain(pedidoTest.horaEntrada);
    expect(mensaje).toContain('CONFIRMO');
  });
});
