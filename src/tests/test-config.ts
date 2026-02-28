/**
 * Configuración centralizada para testing
 *
 * Este archivo contiene todos los datos de prueba necesarios
 * para ejecutar tests completos del sistema
 */

export const TEST_CONFIG = {
  // Configuración de WhatsApp para pruebas
  whatsapp: {
    // Número de teléfono de prueba de WhatsApp
    // Este es un número sandbox proporcionado por Meta para testing
    testPhoneNumber: '+15558327331',

    // Número limpio (sin +, usado en la API)
    testPhoneNumberClean: '15558327331',

    // Phone Number ID de ejemplo (reemplazar con el real de tu cuenta)
    // IMPORTANTE: Este NO es un número de teléfono, es el ID que te da Meta
    examplePhoneNumberId: '106540852500791',

    // Mensaje de prueba estándar
    testMessage:
      '🧪 MENSAJE DE PRUEBA\n\nEste es un mensaje de prueba del sistema de gestión de camareros.\n\nFecha: {fecha}\nHora: {hora}\n\n✅ Si recibes este mensaje, la integración está funcionando correctamente.',

    // Formato esperado del token
    minTokenLength: 100,

    // Validación de Phone Number ID
    phoneNumberIdValidation: {
      minLength: 10,
      maxLength: 20,
      shouldNotContain: ['+', ' ', '-', '(', ')'],
      pattern: /^\d+$/,
    },
  },

  // Configuración de Email para pruebas
  email: {
    // Email de prueba para recibir notificaciones
    testEmail: 'pruebas@sistema-camareros.com',

    // Asunto de prueba
    testSubject: '🧪 Prueba de Sistema - Gestión de Camareros',

    // Cuerpo de email de prueba
    testBody: '<h1>Prueba de Sistema</h1><p>Este es un email de prueba del sistema.</p>',

    // Proveedores soportados
    supportedProviders: ['Resend', 'SendGrid', 'Mailgun'],
  },

  // Datos de prueba para Camareros
  camareros: {
    test1: {
      nombre: 'Juan',
      apellido: 'Pérez Test',
      telefono: '+15558327331', // Número de prueba
      email: 'juan.test@ejemplo.com',
      disponibilidad: ['2026-02-15', '2026-02-16', '2026-02-17'],
    },
    test2: {
      nombre: 'María',
      apellido: 'García Test',
      telefono: '+15558327331',
      email: 'maria.test@ejemplo.com',
      disponibilidad: ['2026-02-16', '2026-02-17'],
    },
  },

  // Datos de prueba para Clientes
  clientes: {
    test1: {
      nombre: 'Empresa Test S.L.',
      contacto: 'Pedro Martínez',
      telefono: '+15558327331',
      email: 'contacto@empresatest.com',
    },
  },

  // Datos de prueba para Coordinadores
  coordinadores: {
    test1: {
      nombre: 'Coordinador Test',
      telefono: '+15558327331',
    },
  },

  // Datos de prueba para Pedidos/Eventos
  pedidos: {
    test1: {
      numero: 'TEST-001',
      cliente: 'Empresa Test S.L.',
      lugar: 'Salón de Eventos Test',
      ubicacion: 'Calle Prueba, 123, Madrid',
      diaEvento: '2026-02-20',
      cantidadCamareros: 5,
      horaEntrada: '14:00',
      horaSalida: '22:00',
      totalHoras: '8h',
      catering: 'No',
      camisa: 'negra',
      notas: 'Este es un pedido de prueba para validar el sistema',
    },
    test2: {
      numero: 'TEST-002',
      cliente: 'Empresa Test S.L.',
      lugar: 'Hotel Test',
      ubicacion: 'Avenida Testing, 456, Barcelona',
      diaEvento: '2026-02-25',
      cantidadCamareros: 8,
      horaEntrada: '19:00',
      horaSalida: '02:00',
      totalHoras: '7h',
      cantidadCamareros2: 3,
      horaEntrada2: '23:00',
      horaSalida2: '04:00',
      totalHoras2: '5h',
      catering: 'Sí',
      camisa: 'blanca',
      notas: 'Pedido con segundo turno - Evento de prueba',
    },
  },

  // URLs de la aplicación
  urls: {
    local: 'http://localhost:3000',
    staging: process.env.STAGING_URL || '',
    production: process.env.PRODUCTION_URL || '',
  },

  // Configuración de API
  api: {
    timeout: 10000, // 10 segundos
    retries: 3,
    retryDelay: 1000, // 1 segundo
  },

  // Timeouts para tests
  timeouts: {
    short: 1000,
    medium: 3000,
    long: 10000,
  },
};

/**
 * Valida si un Phone Number ID tiene el formato correcto
 */
export function validatePhoneNumberId(phoneId: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const validation = TEST_CONFIG.whatsapp.phoneNumberIdValidation;

  if (!phoneId || phoneId.length === 0) {
    errors.push('Phone Number ID no puede estar vacío');
    return { valid: false, errors };
  }

  if (phoneId.length < validation.minLength) {
    errors.push(`Phone Number ID muy corto (mínimo ${validation.minLength} caracteres)`);
  }

  if (phoneId.length > validation.maxLength) {
    errors.push(`Phone Number ID muy largo (máximo ${validation.maxLength} caracteres)`);
  }

  for (const char of validation.shouldNotContain) {
    if (phoneId.includes(char)) {
      errors.push(
        `Phone Number ID no debe contener "${char}". Esto indica que probablemente estás usando un número de teléfono en lugar del Phone Number ID.`
      );
    }
  }

  if (!validation.pattern.test(phoneId)) {
    errors.push('Phone Number ID debe contener solo dígitos');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formatea un número de teléfono para WhatsApp API
 * Elimina caracteres especiales y agrega código de país si es necesario
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '34'): string {
  // Check if original has + (already an international number)
  const hasPlus = phone.trim().startsWith('+');

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If already in international format (had + prefix), return as-is
  if (hasPlus) {
    return cleaned;
  }

  // If number doesn't already start with the country code, add it
  if (!cleaned.startsWith(defaultCountryCode)) {
    return defaultCountryCode + cleaned;
  }

  return cleaned;
}

/**
 * Genera un mensaje de WhatsApp con variables reemplazadas
 */
export function generateTestMessage(template: string = TEST_CONFIG.whatsapp.testMessage): string {
  const now = new Date();
  return template
    .replace('{fecha}', now.toLocaleDateString('es-ES'))
    .replace('{hora}', now.toLocaleTimeString('es-ES'));
}

/**
 * Genera datos de prueba aleatorios
 */
export function generateRandomTestData() {
  const timestamp = Date.now();
  return {
    camarero: {
      nombre: `Test${timestamp}`,
      apellido: `Camarero${timestamp}`,
      telefono: TEST_CONFIG.whatsapp.testPhoneNumber,
      email: `test${timestamp}@prueba.com`,
    },
    pedido: {
      numero: `TEST-${timestamp}`,
      cliente: `Cliente Test ${timestamp}`,
      lugar: `Lugar Test ${timestamp}`,
      diaEvento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };
}
