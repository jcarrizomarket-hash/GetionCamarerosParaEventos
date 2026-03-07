/**
 * messageTemplates.ts
 * Genera el texto del mensaje de servicio según tipo de evento y perfil del camarero.
 *
 * Tipos de evento: 'catering' | 'restauracion'  (pedido.catering === 'si' → catering)
 * Perfiles: 'CAM' | 'COC' | 'PIC' | 'AZA'
 */

const PUNTO_ENCUENTRO = 'https://maps.app.goo.gl/BrZDDaZLpdZWLYrN9';

/** Formatea la fecha como "Lunes 14 de Julio de 2025" */
function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Calcula hora de encuentro: horaEntrada − tiempo de viaje estimado − 15 min extra.
 *  Como no tenemos acceso a Google Maps API en el frontend en tiempo real,
 *  calculamos la hora de encuentro como horaEntrada - 30 minutos (15 min buffer + ~15 min viaje medio).
 *  El coordinador puede ajustar esto manualmente si necesita mayor precisión.
 */
function calcularHoraEncuentro(horaEntrada: string): string {
  if (!horaEntrada) return '(ver indicaciones)';
  const [h, m] = horaEntrada.split(':').map(Number);
  const total = h * 60 + m - 30; // -30 min: 15 desplazamiento + 15 buffer
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Uniforme por perfil */
function getUniforme(tipoPerfil: string, camisa?: string): string {
  switch (tipoPerfil) {
    case 'CAM':
      return `Zapatos, pantalón y delantal francés largo. *DE COLOR NEGRO*\n*Camisa: ${camisa || '(ver pedido)'}`;
    case 'COC':
      return 'Zapatos de cocina, Chaqueta blanca o negra. Cuchillos.';
    case 'PIC':
      return 'Ropa cómoda y zapatos de cocina.';
    case 'AZA':
      return 'Zapatos negros, traje con pollera azul marino o negro, camisa blanca.';
    default:
      return 'Ver indicaciones del coordinador.';
  }
}

/** Nombre legible del perfil */
function labelPerfil(tipoPerfil: string): string {
  const map: Record<string, string> = {
    CAM: 'Camarero',
    COC: 'Cocina',
    PIC: 'Pica',
    AZA: 'Azafata',
  };
  return map[tipoPerfil] ?? tipoPerfil;
}

export interface MensajeParams {
  /** 'catering' cuando pedido.catering === 'si', sino 'restauracion' */
  modalidad: 'catering' | 'restauracion';
  tipoPerfil: string; // 'CAM' | 'COC' | 'PIC' | 'AZA'
  fecha: string;      // ISO date string
  cliente: string;
  evento: string;
  horaEntrada: string;
  ubicacion: string;  // link Google Maps del pedido
  camisa?: string;    // solo relevante para CAM y AZA
}

/** Genera el mensaje completo de servicio (WhatsApp-formatted) */
export function generarMensajeServicio(p: MensajeParams): string {
  const fechaStr = formatFecha(p.fecha);
  const diaStr = new Date(p.fecha).toLocaleDateString('es-ES', { weekday: 'long' });
  const esCapital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const lineas: string[] = [];

  // Cabecera
  lineas.push(`📅 *${esCapital(diaStr)}, ${new Date(p.fecha).toLocaleDateString('es-ES')}*`);
  lineas.push(`👤 *${p.cliente}* | ${p.evento}`);
  lineas.push(`🕐 *Hora de entrada:* ${p.horaEntrada}`);
  lineas.push('');

  // Hora de encuentro (solo Catering)
  if (p.modalidad === 'catering') {
    const horaEncuentro = calcularHoraEncuentro(p.horaEntrada);
    lineas.push(`🤝 *Hora de Encuentro:* ${horaEncuentro}`);
    lineas.push(`📍 Punto de encuentro: ${PUNTO_ENCUENTRO}`);
    lineas.push('');
  }

  // Dirección del evento
  lineas.push(`🗺️ *Ubicación del evento:*`);
  lineas.push(p.ubicacion || '(ver coordenadas en pedido)');
  lineas.push('');

  // Uniforme
  lineas.push(`👔 *Uniforme:*`);
  lineas.push(getUniforme(p.tipoPerfil, p.camisa));
  lineas.push('');

  // Presentación
  lineas.push('⏰ Presentarse *15 minutos antes* para estar a la hora exacta listo para el servicio.');

  return lineas.join('\n');
}

/** Genera el mensaje de confirmación que se envía al aceptar */
export function generarMensajeConfirmacion(params: {
  fecha: string;
  cliente: string;
  evento: string;
  horaEntrada: string;
  qrUrl?: string;
}): string {
  const diaStr = new Date(params.fecha).toLocaleDateString('es-ES', { weekday: 'long' });
  const fechaCorta = new Date(params.fecha).toLocaleDateString('es-ES');

  return [
    '✅ *Servicio confirmado.*',
    'Recuerda estar *15 minutos antes* para evitar llegadas tarde.',
    '',
    `📅 ${diaStr.charAt(0).toUpperCase() + diaStr.slice(1)}, ${fechaCorta}`,
    `👤 *${params.cliente}* | ${params.evento}`,
    `🕐 *Hora de entrada:* ${params.horaEntrada}`,
    '',
    params.qrUrl
      ? `🔲 *Tu código QR de acceso:*\n${params.qrUrl}`
      : '🔲 *(QR no disponible en este momento)*',
    '',
    '¡Gracias por tu asistencia! 🙌',
  ].join('\n');
}

export { formatFecha, labelPerfil, calcularHoraEncuentro };
