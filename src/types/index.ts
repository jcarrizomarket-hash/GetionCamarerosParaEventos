/**
 * Tipos TypeScript centralizados para el sistema de gestión de camareros.
 *
 * Domain entity types (Camarero, Pedido, Coordinador, Cliente, etc.) are
 * re-exported from the canonical source at src/src/types.ts to ensure a
 * single definition is used across the entire codebase.
 *
 * This file adds supplementary types introduced by the refactoring:
 * ApiError, ApiResponse (extended), LoadingState, ErrorState, AppState.
 */

import type { Camarero, Pedido, Coordinador, Cliente } from '../src/types';

// ---------------------------------------------------------------------------
// Re-export canonical domain & utility types to avoid duplication
// ---------------------------------------------------------------------------

export type {
  Camarero,
  Pedido,
  Coordinador,
  Cliente,
  Asignacion,
  EstadoAsignacion,
  TokenConfirmacion,
  UserRole,
  UserSession,
  InformeMetrics,
  EventoCalendario,
  WhatsAppConfig,
  EmailConfig,
  PaginatedResponse,
} from '../src/types';

// ---------------------------------------------------------------------------
// Structured API error type
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

// ---------------------------------------------------------------------------
// Extended API response – includes the structured ApiError when available.
// Compatible with the base ApiResponse shape used throughout the app.
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  /** Structured error object populated by the centralized API client. */
  apiError?: ApiError;
}

// ---------------------------------------------------------------------------
// Application state types
// ---------------------------------------------------------------------------

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
