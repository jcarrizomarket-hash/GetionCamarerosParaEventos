/**
 * Cliente API centralizado para las Supabase Functions
 * Unifica todas las llamadas al backend con manejo de errores consistente
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

// Configuración de la API - lee de variables de entorno
const getApiConfig = () => {
  // Intentar obtener de import.meta.env (Vite) o de window global
  const projectId = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PROJECT_ID) ||
    (typeof window !== 'undefined' && (window as any).VITE_SUPABASE_PROJECT_ID);
    
  const publicAnonKey = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof window !== 'undefined' && (window as any).VITE_SUPABASE_ANON_KEY);

  return {
    projectId: projectId || '',
    publicAnonKey: publicAnonKey || '',
  };
};

// Base URL para las Supabase Functions
const getBaseUrl = (): string => {
  const { projectId } = getApiConfig();
  if (!projectId) {
    console.warn('VITE_SUPABASE_PROJECT_ID no está configurado');
    return '';
  }
  return `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;
};

// Headers comunes para todas las peticiones
const getHeaders = (): HeadersInit => {
  const { publicAnonKey } = getApiConfig();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
  };
};

// Proxy URL for mutation operations — keeps SUPABASE_FN_SECRET server-side only
const getProxyUrl = (): string => `${getBaseUrl()}/proxy`;

// Helper for mutation operations (POST/PUT/DELETE) via secure proxy
async function proxyMutate<T>(path: string, method: string, body?: object): Promise<ApiResponse<T>> {
  try {
    const { publicAnonKey } = getApiConfig();
    const response = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'x-proxy-path': path,
        'x-proxy-method': method,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al conectar con el servidor',
    };
  }
}

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

// ==================== PEDIDOS ====================

export async function getPedidos(): Promise<ApiResponse<Pedido[]>> {
  try {
    const response = await fetch(`${getBaseUrl()}/pedidos`, {
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
    const response = await fetch(`${getBaseUrl()}/pedidos/${id}`, {
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
  return proxyMutate<Pedido>('/pedidos', 'POST', pedido);
}

export async function updatePedido(id: string, pedido: Partial<Pedido>): Promise<ApiResponse<Pedido>> {
  return proxyMutate<Pedido>(`/pedidos/${id}`, 'PUT', pedido);
}

export async function deletePedido(id: string): Promise<ApiResponse<void>> {
  return proxyMutate<void>(`/pedidos/${id}`, 'DELETE');
}

// ==================== CAMAREROS ====================

export async function getCamareros(): Promise<ApiResponse<Camarero[]>> {
  try {
    const response = await fetch(`${getBaseUrl()}/camareros`, {
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
    const response = await fetch(`${getBaseUrl()}/camareros/${id}`, {
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
  return proxyMutate<Camarero>('/camareros', 'POST', camarero);
}

export async function updateCamarero(id: string, camarero: Partial<Camarero>): Promise<ApiResponse<Camarero>> {
  return proxyMutate<Camarero>(`/camareros/${id}`, 'PUT', camarero);
}

export async function deleteCamarero(id: string): Promise<ApiResponse<void>> {
  return proxyMutate<void>(`/camareros/${id}`, 'DELETE');
}

// ==================== COORDINADORES ====================

export async function getCoordinadores(): Promise<ApiResponse<Coordinador[]>> {
  try {
    const response = await fetch(`${getBaseUrl()}/coordinadores`, {
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
    const response = await fetch(`${getBaseUrl()}/coordinadores/${id}`, {
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
  return proxyMutate<Coordinador>('/coordinadores', 'POST', coordinador);
}

export async function updateCoordinador(id: string, coordinador: Partial<Coordinador>): Promise<ApiResponse<Coordinador>> {
  return proxyMutate<Coordinador>(`/coordinadores/${id}`, 'PUT', coordinador);
}

export async function deleteCoordinador(id: string): Promise<ApiResponse<void>> {
  return proxyMutate<void>(`/coordinadores/${id}`, 'DELETE');
}

// ==================== CLIENTES ====================

export async function getClientes(): Promise<ApiResponse<Cliente[]>> {
  try {
    const response = await fetch(`${getBaseUrl()}/clientes`, {
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
  return proxyMutate<Cliente>('/clientes', 'POST', cliente);
}

// ==================== WHATSAPP ====================

export async function verificarWhatsAppConfig(): Promise<ApiResponse<WhatsAppConfig>> {
  try {
    const response = await fetch(`${getBaseUrl()}/verificar-whatsapp-config`, {
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

export async function enviarWhatsApp(telefono: string, mensaje: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${getBaseUrl()}/enviar-whatsapp`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${getBaseUrl()}/verificar-email-config`, {
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
}): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${getBaseUrl()}/enviar-email-parte`, {
      method: 'POST',
      headers: getHeaders(),
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
  return getApiConfig();
}

/**
 * Validar si la configuración está completa
 */
export function isConfigValid(): boolean {
  const { projectId, publicAnonKey } = getApiConfig();
  return Boolean(projectId && publicAnonKey);
}
