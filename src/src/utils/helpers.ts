/**
 * Utilidades reutilizables para el sistema de gestión de camareros
 */

/**
 * Calcula las horas trabajadas entre dos horas (formato HH:MM)
 * @param horaEntrada - Hora de entrada en formato HH:MM
 * @param horaSalida - Hora de salida en formato HH:MM
 * @returns Número de horas trabajadas (puede incluir decimales para minutos)
 */
export function calcularHoras(horaEntrada: string, horaSalida: string): number {
  if (!horaEntrada || !horaSalida) return 0;

  try {
    const [entradaHoras, entradaMinutos] = horaEntrada.split(':').map(Number);
    const [salidaHoras, salidaMinutos] = horaSalida.split(':').map(Number);

    if (isNaN(entradaHoras) || isNaN(entradaMinutos) || isNaN(salidaHoras) || isNaN(salidaMinutos)) {
      return 0;
    }

    let totalMinutos = (salidaHoras * 60 + salidaMinutos) - (entradaHoras * 60 + entradaMinutos);

    // Si la salida es menor que la entrada, asumimos que cruza medianoche
    if (totalMinutos < 0) {
      totalMinutos += 24 * 60;
    }

    return totalMinutos / 60;
  } catch (error) {
    console.error('Error al calcular horas:', error);
    return 0;
  }
}

/**
 * Formatea las horas en formato legible (ej: 8.5 -> "8h 30min")
 * @param horas - Número de horas (puede incluir decimales)
 * @returns String formateado
 */
export function formatearHoras(horas: number): string {
  const horasCompletas = Math.floor(horas);
  const minutos = Math.round((horas - horasCompletas) * 60);

  if (minutos === 0) {
    return `${horasCompletas}h`;
  }

  return `${horasCompletas}h ${minutos}min`;
}

/**
 * Calcula el total de camareros necesarios sumando turnos 1 y 2
 * @param cantidadCamareros - Camareros del turno 1
 * @param cantidadCamareros2 - Camareros del turno 2 (opcional)
 * @returns Total de camareros necesarios
 */
export function calcularCamarerosNecesarios(
  cantidadCamareros: number,
  cantidadCamareros2?: number
): number {
  return (cantidadCamareros || 0) + (cantidadCamareros2 || 0);
}

/**
 * Calcula la hora de encuentro restando tiempo de viaje + 10 minutos
 * @param horaEvento - Hora del evento en formato HH:MM
 * @param tiempoViaje - Tiempo de viaje en minutos
 * @returns Hora de encuentro en formato HH:MM
 */
export function calcularHoraEncuentro(horaEvento: string, tiempoViaje: number): string {
  if (!horaEvento || !tiempoViaje) return '';

  try {
    const [horas, minutos] = horaEvento.split(':').map(Number);
    const minutosAntes = tiempoViaje + 10;

    let totalMinutos = horas * 60 + minutos - minutosAntes;

    // Manejar horas negativas (día anterior)
    if (totalMinutos < 0) {
      totalMinutos += 24 * 60;
    }

    const horaEncuentro = Math.floor(totalMinutos / 60);
    const minutosEncuentro = totalMinutos % 60;

    return `${String(horaEncuentro).padStart(2, '0')}:${String(minutosEncuentro).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error al calcular hora de encuentro:', error);
    return '';
  }
}

/**
 * Formatea un número de teléfono español
 * @param telefono - Número de teléfono
 * @returns Número formateado con código de país
 */
export function formatearTelefono(telefono: string): string {
  if (!telefono) return '';

  // Eliminar todos los caracteres no numéricos
  let numeroLimpio = telefono.replace(/\D/g, '');

  // Si el número tiene 9 dígitos (formato español), agregar código de país
  if (numeroLimpio.length === 9) {
    numeroLimpio = '34' + numeroLimpio;
  }

  return numeroLimpio;
}

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true si el email es válido
 */
export function validarEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Formatea una fecha en formato español
 * @param fecha - Fecha en formato YYYY-MM-DD o Date
 * @param opciones - Opciones de formato Intl.DateTimeFormat
 * @returns Fecha formateada
 */
export function formatearFecha(
  fecha: string | Date,
  opciones?: Intl.DateTimeFormatOptions
): string {
  try {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    const opcionesPorDefecto: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...opciones
    };

    return fechaObj.toLocaleDateString('es-ES', opcionesPorDefecto);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
}

/**
 * Genera un ID único simple
 * @returns ID único en formato timestamp-random
 */
export function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Deduplica un array de objetos por ID
 * @param array - Array a deduplicar
 * @returns Array sin duplicados
 */
export function deduplicarPorId<T extends { id: string }>(array: T[]): T[] {
  return Array.from(new Map(array.map(item => [item.id, item])).values());
}

/**
 * Verifica si un pedido está completo (todos los camareros confirmados)
 * @param pedido - Pedido a verificar
 * @returns true si el pedido está completo
 */
export function isPedidoCompleto(pedido: {
  cantidadCamareros: number;
  cantidadCamareros2?: number;
  asignaciones: Array<{ estado: string }>;
}): boolean {
  if (!pedido.asignaciones || pedido.asignaciones.length === 0) return false;

  const totalRequeridos = calcularCamarerosNecesarios(
    pedido.cantidadCamareros,
    pedido.cantidadCamareros2
  );
  const totalConfirmados = pedido.asignaciones.filter(
    a => a.estado === 'confirmado'
  ).length;

  return totalConfirmados >= totalRequeridos;
}

/**
 * Calcula el porcentaje de confirmación de un pedido
 * @param pedido - Pedido a calcular
 * @returns Porcentaje de confirmación (0-100)
 */
export function calcularPorcentajeConfirmacion(pedido: {
  cantidadCamareros: number;
  cantidadCamareros2?: number;
  asignaciones: Array<{ estado: string }>;
}): number {
  const totalRequeridos = calcularCamarerosNecesarios(
    pedido.cantidadCamareros,
    pedido.cantidadCamareros2
  );

  if (totalRequeridos === 0) return 0;

  const totalConfirmados = pedido.asignaciones.filter(
    a => a.estado === 'confirmado'
  ).length;

  return Math.round((totalConfirmados / totalRequeridos) * 100);
}

/**
 * Genera un token único para confirmaciones
 * @returns Token único
 */
export function generarToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Convierte una fecha YYYY-MM-DD a objeto Date a medianoche local
 * @param fechaStr - Fecha en formato YYYY-MM-DD
 * @returns Objeto Date
 */
export function parsearFechaEvento(fechaStr: string): Date {
  const [year, month, day] = fechaStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
