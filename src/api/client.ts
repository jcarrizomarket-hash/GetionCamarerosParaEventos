/**
 * Cliente API centralizado para las Supabase Functions
 * Unifica todas las llamadas al backend con manejo de errores consistente
 *
 * En modo demo (VITE_DEMO_MODE=true) todas las llamadas se redirigen
 * al demoStore en memoria — sin necesidad de backend.
 */

import type { 
  ApiResponse, 
  Pedido, 
  Camarero, 
  Coordinador, 
  Cliente,
  WhatsAppConfig,
  EmailConfig 
} from '../types';
import { supabaseFunctionEndpoint, supabaseAnonKey } from '../config/env';
import { fetchWithRetry } from '../utils/retry';
import { demoStore } from './demo-store';
import { supabase } from '../lib/supabase';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRY_ATTEMPTS = 2;

// Base URL para las Supabase Functions
const getBaseUrl = (): string => {
  if (!supabaseFunctionEndpoint) {
    console.warn('Supabase function endpoint is not configured. Please set VITE_SUPABASE_URL (or VITE_SUPABASE_FUNCTIONS_URL / VITE_SUPABASE_FUNCTION_ENDPOINT) in your .env file.');
    return '';
  }
  return supabaseFunctionEndpoint;
};

// Headers comunes para todas las peticiones (JWT-only, sin shared secrets)
const getHeaders = async (): Promise<HeadersInit> => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || supabaseAnonKey;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
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
  if (IS_DEMO) return { success: true, data: await demoStore.getPedidos() };
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos`, {
      method: 'GET',
      headers: await getHeaders(),
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
  if (IS_DEMO) { const d = await demoStore.getPedido(id); return d ? { success: true, data: d } : { success: false, error: 'Pedido no encontrado' }; }
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos/${id}`, {
      method: 'GET',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.createPedido(pedido) };
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos`, {
      method: 'POST',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.updatePedido(id, pedido) };
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
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
  if (IS_DEMO) { await demoStore.deletePedido(id); return { success: true }; }
  try {
    const response = await apiFetch(`${getBaseUrl()}/pedidos/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.getCamareros() };
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros`, {
      method: 'GET',
      headers: await getHeaders(),
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
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.createCamarero(camarero) };
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros`, {
      method: 'POST',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.updateCamarero(id, camarero) };
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
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
  if (IS_DEMO) { await demoStore.deleteCamarero(id); return { success: true }; }
  try {
    const response = await apiFetch(`${getBaseUrl()}/camareros/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.getCoordinadores() };
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores`, {
      method: 'GET',
      headers: await getHeaders(),
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
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.createCoordinador(coordinador) };
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores`, {
      method: 'POST',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.updateCoordinador(id, coordinador) };
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
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
  if (IS_DEMO) { await demoStore.deleteCoordinador(id); return { success: true }; }
  try {
    const response = await apiFetch(`${getBaseUrl()}/coordinadores/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.getClientes() };
  try {
    const response = await apiFetch(`${getBaseUrl()}/clientes`, {
      method: 'GET',
      headers: await getHeaders(),
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
  if (IS_DEMO) return { success: true, data: await demoStore.createCliente(cliente) };
  try {
    const response = await apiFetch(`${getBaseUrl()}/clientes`, {
      method: 'POST',
      headers: await getHeaders(),
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
      headers: await getHeaders(),
    });
    return handleResponse<WhatsAppConfig>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al verificar configuración WhatsApp',
    };
  }
}

export async function enviarWhatsApp(telefono: string, mensaje: string): Promise<ApiResponse<any>> {
  if (IS_DEMO) { console.log(`[DEMO] WhatsApp → ${telefono}:`, mensaje); return { success: true, data: { messageId: `demo-${Date.now()}` } }; }
  try {
    const response = await apiFetch(`${getBaseUrl()}/enviar-whatsapp`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ telefono, mensaje }),
    });
    return handleResponse<any>(response);
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
      headers: await getHeaders(),
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
}): Promise<ApiResponse<any>> {
  try {
    const response = await apiFetch(`${getBaseUrl()}/enviar-email-parte`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<any>(response);
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
  return { endpoint: supabaseFunctionEndpoint };
}

/**
 * Validar si la configuración está completa
 */
export function isConfigValid(): boolean {
  return Boolean(supabaseFunctionEndpoint && supabaseAnonKey);
}
