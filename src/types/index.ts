/**
 * Tipos TypeScript centralizados para las entidades del dominio
 * Sistema de Gestión de Camareros
 */

// ==================== ENTIDADES ====================

export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  createdAt?: string;
}

export interface Coordinador {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  createdAt?: string;
}

export interface Camarero {
  id: string;
  numero: number;
  nombre: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  notas?: string;
  createdAt?: string;
}

export type EstadoAsignacion = 'pendiente' | 'enviado' | 'confirmado' | 'no confirmado';

export interface Asignacion {
  camareroId: string;
  camareroNumero: number;
  camareroNombre: string;
  estado: EstadoAsignacion;
  turno?: 1 | 2;
  horaEntrada?: string;
  horaSalida?: string;
}

export interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  lugar: string;
  ubicacion?: string;
  diaEvento: string; // Format: YYYY-MM-DD

  // Turno 1
  cantidadCamareros: number;
  horaEntrada: string;
  horaSalida?: string;
  totalHoras?: string;

  // Turno 2 (opcional)
  cantidadCamareros2?: number;
  horaEntrada2?: string;
  horaSalida2?: string;
  totalHoras2?: string;

  // Catering
  catering: 'si' | 'no';
  tiempoViaje?: string;

  // Vestimenta
  camisa: 'blanca' | 'negra';

  // Asignaciones
  asignaciones: Asignacion[];

  // Notas
  notas?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface TokenConfirmacion {
  token: string;
  pedidoId: string;
  camareroId: string;
  coordinadorId: string;
  usado?: boolean;
  createdAt: string;
}

// ==================== RESPUESTAS API ====================

/** Minimal API response used by most endpoints */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Extended API response with audit fields (timestamp, requestId).
 * Used by endpoints that need traceability. For most cases, prefer ApiResponse.
 */
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  pageSize?: number;
}

// ==================== CONFIGURACIÓN ====================

export interface WhatsAppConfig {
  configured: boolean;
  phoneId?: string;
  hasApiKey?: boolean;
}

export interface EmailConfig {
  configured: boolean;
  provider?: 'resend' | 'sendgrid' | 'mailgun';
  emailFrom?: string;
}

// ==================== INFORMES ====================

export interface InformeMetrics {
  totalEventos: number;
  totalCamareros: number;
  totalHoras: number;
  confirmados: number;
  pendientes: number;
  noConfirmados: number;
  eventosPendientes: number;
  eventosCompletos: number;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  fecha: string;
  completo: boolean;
  totalCamareros: number;
  confirmados: number;
}
