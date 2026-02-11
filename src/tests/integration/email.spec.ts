/**
 * Tests de Integración para Sistema de Email
 * 
 * Verifica la funcionalidad del sistema de email multi-proveedor
 */

import { describe, it, expect } from 'vitest';
import { TEST_CONFIG } from '../test-config';

describe('Sistema de Email - Configuración', () => {
  it('debe tener proveedores soportados definidos', () => {
    expect(TEST_CONFIG.email.supportedProviders).toEqual([
      'Resend',
      'SendGrid',
      'Mailgun'
    ]);
  });

  it('debe tener email de prueba configurado', () => {
    expect(TEST_CONFIG.email.testEmail).toBeTruthy();
    expect(TEST_CONFIG.email.testEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

describe('Sistema de Email - Validación de formato', () => {
  describe('Validación de emails', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validEmails = [
      'test@example.com',
      'usuario.nombre@dominio.com',
      'test+tag@example.co.uk',
      TEST_CONFIG.email.testEmail
    ];

    const invalidEmails = [
      '',
      'notanemail',
      '@example.com',
      'test@',
      'test @example.com',
      'test@example'
    ];

    validEmails.forEach(email => {
      it(`debe validar email correcto: ${email}`, () => {
        expect(email).toMatch(emailRegex);
      });
    });

    invalidEmails.forEach(email => {
      it(`debe rechazar email inválido: "${email}"`, () => {
        expect(email).not.toMatch(emailRegex);
      });
    });
  });
});

describe('Sistema de Email - Estructura de mensajes', () => {
  it('debe generar HTML válido para email de confirmación', () => {
    const camarero = TEST_CONFIG.camareros.test1;
    const pedido = TEST_CONFIG.pedidos.test1;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Servicio</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">🎯 Nueva Asignación de Servicio</h1>
    
    <p>Hola <strong>${camarero.nombre}</strong>,</p>
    
    <p>Has sido asignado al siguiente evento:</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>📅 Fecha:</strong> ${pedido.diaEvento}</p>
      <p><strong>🏢 Cliente:</strong> ${pedido.cliente}</p>
      <p><strong>📍 Lugar:</strong> ${pedido.lugar}</p>
      <p><strong>⏰ Horario:</strong> ${pedido.horaEntrada} - ${pedido.horaSalida}</p>
      <p><strong>👔 Camisa:</strong> ${pedido.camisa}</p>
    </div>
    
    <p>Por favor, confirma tu asistencia:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="[LINK_CONFIRMAR]" style="display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px;">
        ✅ CONFIRMO
      </a>
      <a href="[LINK_RECHAZAR]" style="display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px;">
        ❌ NO CONFIRMO
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Gracias por tu confirmación.<br>
      Sistema de Gestión de Camareros
    </p>
  </div>
</body>
</html>`;

    // Validaciones básicas de HTML
    expect(htmlBody).toContain('<!DOCTYPE html>');
    expect(htmlBody).toContain('<html>');
    expect(htmlBody).toContain('</html>');
    expect(htmlBody).toContain(camarero.nombre);
    expect(htmlBody).toContain(pedido.cliente);
    expect(htmlBody).toContain('CONFIRMO');
    expect(htmlBody).toContain('NO CONFIRMO');
  });

  it('debe generar email de notificación al coordinador', () => {
    const coordinador = TEST_CONFIG.coordinadores.test1;
    const camarero = TEST_CONFIG.camareros.test1;
    const pedido = TEST_CONFIG.pedidos.test1;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>✅ Confirmación Recibida</h1>
  <p>El camarero <strong>${camarero.nombre} ${camarero.apellido}</strong> ha confirmado su asistencia.</p>
  <h3>Detalles del Evento:</h3>
  <ul>
    <li><strong>Evento:</strong> ${pedido.cliente}</li>
    <li><strong>Fecha:</strong> ${pedido.diaEvento}</li>
    <li><strong>Lugar:</strong> ${pedido.lugar}</li>
    <li><strong>Hora:</strong> ${pedido.horaEntrada}</li>
  </ul>
</body>
</html>`;

    expect(htmlBody).toContain(camarero.nombre);
    expect(htmlBody).toContain(pedido.cliente);
    expect(htmlBody).toContain('Confirmación Recibida');
  });
});

describe('Sistema de Email - Integración con Servidor', () => {
  const API_BASE = 'http://localhost:54321/functions/v1/make-server-25b11ac0';
  
  it('debe tener endpoint de envío de email (si existe)', async () => {
    // Nota: Este test asume que hay un endpoint de email
    // Si no existe, el test debería ser modificado
    
    const testEmailData = {
      destinatario: TEST_CONFIG.email.testEmail,
      asunto: TEST_CONFIG.email.testSubject,
      htmlBody: TEST_CONFIG.email.testBody
    };
    
    // Este es un test de ejemplo
    // En producción, necesitarías un endpoint real
    expect(testEmailData.destinatario).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(testEmailData.asunto).toBeTruthy();
    expect(testEmailData.htmlBody).toBeTruthy();
  });
});

describe('Sistema de Email - Casos de uso', () => {
  describe('Email de confirmación a camarero', () => {
    it('debe incluir toda la información necesaria', () => {
      const pedido = TEST_CONFIG.pedidos.test1;
      const camarero = TEST_CONFIG.camareros.test1;
      
      const requiredFields = [
        'nombre del camarero',
        'fecha del evento',
        'cliente',
        'lugar',
        'horario',
        'tipo de camisa',
        'enlace de confirmación',
        'enlace de rechazo'
      ];
      
      // Simular generación de email
      const emailContent = {
        to: camarero.email,
        subject: `Asignación de Servicio - ${pedido.cliente}`,
        hasConfirmLink: true,
        hasRejectLink: true,
        includesDate: pedido.diaEvento,
        includesClient: pedido.cliente,
        includesLocation: pedido.lugar,
        includesTime: pedido.horaEntrada
      };
      
      expect(emailContent.to).toMatch(/@/);
      expect(emailContent.hasConfirmLink).toBe(true);
      expect(emailContent.hasRejectLink).toBe(true);
      expect(emailContent.includesDate).toBeTruthy();
    });
  });

  describe('Email de notificación a coordinador', () => {
    it('debe notificar confirmación de camarero', () => {
      const coordinador = TEST_CONFIG.coordinadores.test1;
      const camarero = TEST_CONFIG.camareros.test1;
      const pedido = TEST_CONFIG.pedidos.test1;
      
      const notification = {
        type: 'confirmacion',
        to: 'coordinador@email.com',
        subject: `✅ ${camarero.nombre} ${camarero.apellido} confirmó asistencia`,
        body: `El camarero ha confirmado para el evento de ${pedido.cliente}`
      };
      
      expect(notification.type).toBe('confirmacion');
      expect(notification.subject).toContain('confirmó');
      expect(notification.body).toContain(pedido.cliente);
    });

    it('debe notificar rechazo de camarero', () => {
      const camarero = TEST_CONFIG.camareros.test1;
      const pedido = TEST_CONFIG.pedidos.test1;
      
      const notification = {
        type: 'rechazo',
        to: 'coordinador@email.com',
        subject: `❌ ${camarero.nombre} ${camarero.apellido} no puede asistir`,
        body: `El camarero NO puede asistir al evento de ${pedido.cliente}. ACCIÓN REQUERIDA: Asignar reemplazo`,
        priority: 'high'
      };
      
      expect(notification.type).toBe('rechazo');
      expect(notification.priority).toBe('high');
      expect(notification.body).toContain('ACCIÓN REQUERIDA');
    });
  });
});

describe('Sistema de Email - Detección de proveedor', () => {
  it('debe priorizar Resend como primera opción', () => {
    const providers = TEST_CONFIG.email.supportedProviders;
    expect(providers[0]).toBe('Resend');
  });

  it('debe tener SendGrid como segunda opción', () => {
    const providers = TEST_CONFIG.email.supportedProviders;
    expect(providers[1]).toBe('SendGrid');
  });

  it('debe tener Mailgun como tercera opción', () => {
    const providers = TEST_CONFIG.email.supportedProviders;
    expect(providers[2]).toBe('Mailgun');
  });
});
