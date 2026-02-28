/**
 * Cliente API centralizado para las Supabase Functions
 * Unifica todas las llamadas al backend con manejo de errores consistente
 */

import { logger } from '../utils/logger';
import type {
  ApiResponse,
  Pedido,
  Camarero,
  Coordinador,
  Cliente,
  WhatsAppConfig,
  EmailConfig,
} from '../types';
import { supabaseFunctionEndpoint, supabaseAnonKey, supabaseProjectId } from '../config/env';
import { fetchWithRetry } from '../utils/retry';

const REQUEST_TIMEOUT_MS = 5000;
const MAX_RETRY_ATTEMPTS = 3;

// Configuración de la API - lee de variables de entorno
const getApiConfig = () => {
  return {
    projectId: supabaseProjectId,
    publicAnonKey: supabaseAnonKey,
  };
};

// Base URL para las Supabase Functions
const getBaseUrl = (): string => {
  if (!supabaseFunctionEndpoint) {
    logger.warn('Supabase function endpoint is not configured. Please set VITE_SUPABASE_FUNCTION_ENDPOINT or VITE_SUPABASE_PROJECT_ID in your .env file.');
    return '';
  }
  return supabaseFunctionEndpoint;
};

// Headers comunes para todas las peticiones
const getHeaders = (includeSecret: boolean = false): HeadersInit => {
  const { publicAnonKey } = getApiConfig();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
  };

  // Agregar secret header si se requiere (para operaciones mutantes)
  if (includeSecret && typeof import.meta !== 'undefined') {
    const fnSecret = import.meta.env?.VITE_SUPABASE_FN_SECRET;
    if (fnSecret) {
      headers['x-fn-secret'] = fnSecret;
    }
  }

  return headers;
};

// Función auxiliar para manejar respuestas
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error HTTP ${response.status}`,
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Función auxiliar para hacer fetch con timeout y reintentos
function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetchWithRetry(url, options, {
    timeoutMs: REQUEST_TIMEOUT_MS,
    maxAttempts: MAX_RETRY_ATTEMPTS,
  });
}

// ==================== PEDIDOS ====================

export async function getPedidos(): Promise<ApiResponse<Pedido[]>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Pedido[]>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener pedidos',
    };
  }
}

export async function getPedido(id: string): Promise<ApiResponse<Pedido>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Pedido>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener pedido',
    };
  }
}

export async function createPedido(pedido: Omit<Pedido, 'id'>): Promise<ApiResponse<Pedido>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(pedido),
    });
    return handleResponse<Pedido>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear pedido',
    };
  }
}

export async function updatePedido(id: string, pedido: Partial<Pedido>): Promise<ApiResponse<Pedido>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(pedido),
    });
    return handleResponse<Pedido>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar pedido',
    };
  }
}

export async function deletePedido(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar pedido',
    };
  }
}

// ==================== CAMAREROS ====================

export async function getCamareros(): Promise<ApiResponse<Camarero[]>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Camarero[]>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener camareros',
    };
  }
}

export async function getCamarero(id: string): Promise<ApiResponse<Camarero>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Camarero>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener camarero',
    };
  }
}

export async function createCamarero(camarero: Omit<Camarero, 'id'>): Promise<ApiResponse<Camarero>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(camarero),
    });
    return handleResponse<Camarero>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear camarero',
    };
  }
}

export async function updateCamarero(id: string, camarero: Partial<Camarero>): Promise<ApiResponse<Camarero>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(camarero),
    });
    return handleResponse<Camarero>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar camarero',
    };
  }
}

export async function deleteCamarero(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar camarero',
    };
  }
}

// ==================== COORDINADORES ====================

export async function getCoordinadores(): Promise<ApiResponse<Coordinador[]>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Coordinador[]>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener coordinadores',
    };
  }
}

export async function getCoordinador(id: string): Promise<ApiResponse<Coordinador>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Coordinador>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener coordinador',
    };
  }
}

export async function createCoordinador(coordinador: Omit<Coordinador, 'id'>): Promise<ApiResponse<Coordinador>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(coordinador),
    });
    return handleResponse<Coordinador>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear coordinador',
    };
  }
}

export async function updateCoordinador(id: string, coordinador: Partial<Coordinador>): Promise<ApiResponse<Coordinador>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(coordinador),
    });
    return handleResponse<Coordinador>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar coordinador',
    };
  }
}

export async function deleteCoordinador(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar coordinador',
    };
  }
}

// ==================== CLIENTES ====================

export async function getClientes(): Promise<ApiResponse<Cliente[]>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/clientes`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Cliente[]>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener clientes',
    };
  }
}

export async function createCliente(cliente: Omit<Cliente, 'id'>): Promise<ApiResponse<Cliente>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/clientes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(cliente),
    });
    return handleResponse<Cliente>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear cliente',
    };
  }
}

// ==================== WHATSAPP ====================

export async function verificarWhatsAppConfig(): Promise<ApiResponse<WhatsAppConfig>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/verificar-whatsapp-config`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<WhatsAppConfig>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al verificar configuración WhatsApp',
    };
  }
}

export async function enviarWhatsApp(telefono: string, mensaje: string): Promise<ApiResponse<unknown>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/enviar-whatsapp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ telefono, mensaje }),
    });
    return handleResponse<unknown>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar WhatsApp',
    };
  }
}

// ==================== EMAIL ====================

export async function verificarEmailConfig(): Promise<ApiResponse<EmailConfig>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/verificar-email-config`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<EmailConfig>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al verificar configuración Email',
    };
  }
}

export async function enviarEmailParte(params: {
  destinatario: string;
  cc?: string | null;
  asunto: string;
  mensaje: string;
  parteHTML: string;
  pedido: {
    cliente: string;
    fecha: string;
    lugar: string;
  };
}): Promise<ApiResponse<unknown>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/enviar-email-parte`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<unknown>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email',
    };
  }
}

// ==================== UTILIDADES ====================

/**
 * Exportar configuración actual para debugging
 */
export function getConfig() {
  return getApiConfig();
}

/**
 * Validar si la configuración está completa
 */
export function isConfigValid(): boolean {
  const { projectId, publicAnonKey } = getApiConfig();
  return Boolean(projectId && publicAnonKey);
}
