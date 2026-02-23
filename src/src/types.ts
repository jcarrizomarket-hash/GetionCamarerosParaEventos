/**
 * Tipos TypeScript para las entidades del dominio
 * Sistema de Gestión de Camareros
 */

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

// Tipos para respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  pageSize?: number;
}

// Tipos para configuración
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

// Tipos para informes
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
