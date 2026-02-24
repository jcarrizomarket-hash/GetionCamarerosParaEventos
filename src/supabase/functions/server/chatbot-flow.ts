// Sistema de flujo conversacional para WhatsApp Chatbot
// Maneja el estado de las conversaciones y el flujo del formulario

export interface ConversationState {
  userId: string;
  phone: string;
  currentStep: string;
  data: Record<string, any>;
  lastUpdate: number;
  mapsResults?: any[];
}

export interface FlowStep {
  id: string;
  type: 'message' | 'input' | 'options' | 'dynamicOptions' | 'customAction';
  text: string;
  next?: string | null;
  options?: Array<{ label: string; value: string }>;
  variable?: string;
  validation?: {
    required?: boolean;
    format?: string;
  };
  inputType?: string;
  action?: string;
  params?: Record<string, any>;
  optionsVariable?: string;
  saveTo?: string;
}

// Definición del flujo completo del formulario
export const CHATBOT_FLOW: Record<string, FlowStep> = {
  // Menú inicial
  menu_inicial: {
    id: 'menu_inicial',
    type: 'options',
    text: '¡Hola! 😊 Bienvenido a nuestro sistema de gestión de eventos.\n\n¿En qué puedo ayudarte hoy?',
    options: [
      { label: '📝 Quiero hacer un pedido', value: 'hacer_pedido' },
      { label: '👤 Quiero enviar un mensaje al coordinador', value: 'mensaje_coordinador' },
      { label: '🏢 Quiero comunicarme con Administración', value: 'mensaje_admin' },
      { label: '📅 Es sobre algún evento', value: 'sobre_evento' }
    ],
    next: null // Se determina dinámicamente según la opción
  },

  // Flujo: Hacer un pedido
  inicio: {
    id: 'inicio',
    type: 'message',
    text: '¡Perfecto! 😊 Para ayudarte con tu solicitud, necesito que completes la siguiente información. Todos los campos son obligatorios.\n\nComencemos...',
    next: 'cliente'
  },

  cliente: {
    id: 'cliente',
    type: 'input',
    inputType: 'text',
    text: '1️⃣ ¿Cuál es el nombre del cliente?',
    variable: 'cliente',
    validation: { required: true },
    next: 'lugar_evento'
  },

  lugar_evento: {
    id: 'lugar_evento',
    type: 'input',
    inputType: 'text',
    text: '2️⃣ ¿Cuál es el lugar del evento?',
    variable: 'lugar_evento',
    validation: { required: true },
    next: 'fecha_evento'
  },

  fecha_evento: {
    id: 'fecha_evento',
    type: 'input',
    inputType: 'date',
    text: '3️⃣ ¿Cuál es la fecha del evento?\n\nPor favor, escribe la fecha en formato: DD/MM/AAAA\n\nEjemplo: 25/12/2024',
    variable: 'fecha_evento',
    validation: { required: true },
    next: 'hora_evento'
  },

  hora_evento: {
    id: 'hora_evento',
    type: 'input',
    inputType: 'time',
    text: '4️⃣ ¿A qué hora comenzará el evento?\n\nPor favor, escribe la hora en formato: HH:MM\n\nEjemplo: 19:30',
    variable: 'hora_evento',
    validation: { required: true },
    next: 'ubicacion_maps'
  },

  ubicacion_maps: {
    id: 'ubicacion_maps',
    type: 'customAction',
    action: 'googleMapsSearch',
    params: { query: '{{lugar_evento}}' },
    text: '🔎 Buscando la ubicación en Google Maps...',
    next: 'ubicacion_confirmar'
  },

  ubicacion_confirmar: {
    id: 'ubicacion_confirmar',
    type: 'dynamicOptions',
    optionsVariable: 'maps_results',
    text: '5️⃣ He encontrado estas posibles ubicaciones.\n\nPor favor, responde con el número de la ubicación correcta:',
    saveTo: 'ubicacion_maps',
    validation: { required: true },
    next: 'cantidad_camareros'
  },

  cantidad_camareros: {
    id: 'cantidad_camareros',
    type: 'input',
    inputType: 'number',
    text: '6️⃣ ¿Cuántos camareros necesitas?',
    variable: 'cantidad_camareros',
    validation: { required: true },
    next: 'color_camisa'
  },

  color_camisa: {
    id: 'color_camisa',
    type: 'options',
    text: '7️⃣ ¿Qué color de camisa prefieres?',
    options: [
      { label: '⚪ Blanca', value: 'blanca' },
      { label: '⚫ Negra', value: 'negra' }
    ],
    variable: 'color_camisa',
    validation: { required: true },
    next: 'mail_contacto'
  },

  mail_contacto: {
    id: 'mail_contacto',
    type: 'input',
    inputType: 'email',
    text: '8️⃣ ¿Cuál es tu correo electrónico de contacto?\n\nEjemplo: contacto@ejemplo.com',
    variable: 'mail_contacto',
    validation: { 
      required: true,
      format: 'email'
    },
    next: 'telefono_contacto'
  },

  telefono_contacto: {
    id: 'telefono_contacto',
    type: 'input',
    inputType: 'phone',
    text: '9️⃣ Déjame tu número de teléfono, por favor.\n\nEjemplo: 612345678 o +34612345678',
    variable: 'telefono_contacto',
    validation: { required: true },
    next: 'enviar_formulario'
  },

  enviar_formulario: {
    id: 'enviar_formulario',
    type: 'options',
    text: '✅ Perfecto, he recibido toda la información:\n\n' +
          '👤 Cliente: {{cliente}}\n' +
          '📍 Lugar: {{lugar_evento}}\n' +
          '📅 Fecha: {{fecha_evento}}\n' +
          '⏰ Hora: {{hora_evento}}\n' +
          '👥 Camareros: {{cantidad_camareros}}\n' +
          '👔 Camisa: {{color_camisa}}\n' +
          '📧 Email: {{mail_contacto}}\n' +
          '📱 Teléfono: {{telefono_contacto}}\n\n' +
          '¿Deseas enviar toda la información?',
    options: [
      { label: '✅ Sí, enviar ahora', value: 'enviar' },
      { label: '❌ Cancelar', value: 'cancelar' }
    ],
    next: 'mensaje_final'
  },

  mensaje_final: {
    id: 'mensaje_final',
    type: 'message',
    text: '🎉 ¡Muchas gracias por confiar en nosotros!\n\n' +
          'Tu solicitud ha sido registrada con éxito. En breve nos pondremos en contacto contigo para confirmar todos los detalles.\n\n' +
          '¿Necesitas algo más? Escribe "menu" para volver al menú principal.',
    next: null
  },

  // Flujos para otras opciones del menú
  mensaje_coordinador: {
    id: 'mensaje_coordinador',
    type: 'message',
    text: '👤 Para enviar un mensaje al coordinador, por favor contacta directamente con:\n\n' +
          '📧 coordinador@empresa.com\n' +
          '📱 +34 600 123 456\n\n' +
          'Escribe "menu" para volver al menú principal.',
    next: null
  },

  mensaje_admin: {
    id: 'mensaje_admin',
    type: 'message',
    text: '🏢 Para comunicarte con Administración, puedes contactar:\n\n' +
          '📧 admin@empresa.com\n' +
          '📱 +34 600 654 321\n\n' +
          'Escribe "menu" para volver al menú principal.',
    next: null
  },

  sobre_evento: {
    id: 'sobre_evento',
    type: 'message',
    text: '📅 Si tienes preguntas sobre un evento específico, por favor indícanos:\n\n' +
          '• Número de pedido (si lo conoces)\n' +
          '• Fecha del evento\n' +
          '• Nombre del cliente\n\n' +
          'O escribe "menu" para volver al menú principal.',
    next: null
  }
};

// Validaciones
export function validateInput(value: string, step: FlowStep): { valid: boolean; error?: string } {
  if (step.validation?.required && (!value || value.trim() === '')) {
    return { valid: false, error: '⚠️ Este campo es obligatorio. Por favor, proporciona la información.' };
  }

  if (step.inputType === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, error: '⚠️ Por favor, proporciona un email válido. Ejemplo: contacto@ejemplo.com' };
    }
  }

  if (step.inputType === 'date') {
    // Validar formato DD/MM/AAAA
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    if (!match) {
      return { valid: false, error: '⚠️ Por favor, usa el formato DD/MM/AAAA. Ejemplo: 25/12/2024' };
    }
    
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) {
      return { valid: false, error: '⚠️ Fecha inválida. Por favor, verifica el día, mes y año.' };
    }
  }

  if (step.inputType === 'time') {
    // Validar formato HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(value)) {
      return { valid: false, error: '⚠️ Por favor, usa el formato HH:MM. Ejemplo: 19:30' };
    }
  }

  if (step.inputType === 'number') {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      return { valid: false, error: '⚠️ Por favor, proporciona un número válido mayor que 0.' };
    }
  }

  if (step.inputType === 'phone') {
    // Permitir formatos: 612345678, +34612345678, 34612345678
    const phoneRegex = /^(\+?34)?[6-9]\d{8}$/;
    const cleanPhone = value.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return { valid: false, error: '⚠️ Por favor, proporciona un teléfono español válido. Ejemplo: 612345678' };
    }
  }

  return { valid: true };
}

// Reemplazar variables en el texto
export function replaceVariables(text: string, data: Record<string, any>): string {
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

// Formatear opciones para mostrar
export function formatOptions(options: Array<{ label: string; value: string }>): string {
  return options.map((opt, idx) => `${idx + 1}. ${opt.label}`).join('\n');
}

// Procesar respuesta del usuario según el tipo de paso
export function processUserResponse(
  message: string,
  step: FlowStep,
  state: ConversationState
): { nextStep: string | null; data?: Record<string, any>; error?: string } {
  
  // Comandos especiales
  const lowerMessage = message.toLowerCase().trim();
  if (lowerMessage === 'menu' || lowerMessage === 'inicio') {
    return { nextStep: 'menu_inicial' };
  }

  if (step.type === 'options') {
    // Verificar si es una opción válida (número o texto)
    const optionIndex = parseInt(message) - 1;
    let selectedOption;

    if (!isNaN(optionIndex) && step.options && optionIndex >= 0 && optionIndex < step.options.length) {
      selectedOption = step.options[optionIndex];
    } else if (step.options) {
      // Buscar por texto
      selectedOption = step.options.find(opt => 
        opt.label.toLowerCase().includes(lowerMessage) || 
        opt.value.toLowerCase() === lowerMessage
      );
    }

    if (!selectedOption) {
      return { error: `⚠️ Por favor, selecciona una opción válida (1-${step.options?.length || 0})` };
    }

    // Determinar el siguiente paso según la opción seleccionada
    if (step.id === 'menu_inicial') {
      const nextStepMap: Record<string, string> = {
        'hacer_pedido': 'inicio',
        'mensaje_coordinador': 'mensaje_coordinador',
        'mensaje_admin': 'mensaje_admin',
        'sobre_evento': 'sobre_evento'
      };
      return { 
        nextStep: nextStepMap[selectedOption.value],
        data: { [step.variable || 'selection']: selectedOption.value }
      };
    }

    if (step.id === 'enviar_formulario') {
      if (selectedOption.value === 'enviar') {
        return { nextStep: step.next || null, data: { confirmed: true } };
      } else {
        return { 
          nextStep: 'menu_inicial', 
          error: '❌ Solicitud cancelada. Volviendo al menú principal...' 
        };
      }
    }

    return { 
      nextStep: step.next || null, 
      data: step.variable ? { [step.variable]: selectedOption.value } : {}
    };
  }

  if (step.type === 'dynamicOptions') {
    // Opciones dinámicas (ej: resultados de Google Maps)
    const optionIndex = parseInt(message) - 1;
    const mapsResults = state.mapsResults || [];

    if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= mapsResults.length) {
      return { error: `⚠️ Por favor, selecciona un número válido (1-${mapsResults.length})` };
    }

    const selectedLocation = mapsResults[optionIndex];
    return {
      nextStep: step.next || null,
      data: { [step.saveTo || 'selected']: selectedLocation.url }
    };
  }

  if (step.type === 'input') {
    // Validar entrada
    const validation = validateInput(message, step);
    if (!validation.valid) {
      return { error: validation.error };
    }

    return {
      nextStep: step.next || null,
      data: step.variable ? { [step.variable]: message } : {}
    };
  }

  return { nextStep: step.next || null };
}
