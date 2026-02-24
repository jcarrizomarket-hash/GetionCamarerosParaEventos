/**
 * Tipos TypeScript centralizados para el sistema de gestión de camareros
 */

// Tipos de dominio
export interface Camarero {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  disponibilidad: string[];
  habilidades?: string[];
  estado: 'activo' | 'inactivo';
  createdAt: string;
  updatedAt: string;
}

export interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  diaEvento: string;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  cantidadCamareros: number;
  camarerrosAsignados: Camarero[]; // Note: kept as-is to match API response field name
  estado: 'pendiente' | 'confirmado' | 'rechazado' | 'completado';
  createdAt: string;
  updatedAt: string;
}

export interface Coordinador {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  estado: 'activo' | 'inactivo';
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

// Tipos de estado
export interface AppState {
  camareros: Camarero[];
  pedidos: Pedido[];
  coordinadores: Coordinador[];
  clientes: Cliente[];
  loading: boolean;
  error: ApiError | null;
}

export interface LoadingState {
  camareros: boolean;
  pedidos: boolean;
  coordinadores: boolean;
  clientes: boolean;
}

export interface ErrorState {
  camareros: ApiError | null;
  pedidos: ApiError | null;
  coordinadores: ApiError | null;
  clientes: ApiError | null;
}
