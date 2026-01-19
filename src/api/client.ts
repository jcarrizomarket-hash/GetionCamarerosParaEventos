import type { Pedido, Camarero, Coordinador, Cliente } from '../types';

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const PUBLIC_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!PROJECT_ID || !PUBLIC_ANON_KEY) {
  console.warn('VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_ANON_KEY not set');
}

const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-25b11ac0`;

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PUBLIC_ANON_KEY}`,
    ...((options.headers || {}) as Record<string, string>)
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  const body = await res.json().catch(() => null);
  if (body && body?.success === false) throw new Error(body.error || 'Unknown API error');
  return (body && body.data) ? body.data : body;
}

export const api = {
  // Pedidos
  getPedidos: async (): Promise<Pedido[]> => request<Pedido[]>('/pedidos'),
  createPedido: async (p: Pedido): Promise<Pedido> => request<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(p) }),
  updatePedido: async (id: string, p: Partial<Pedido>): Promise<Pedido> => request<Pedido>(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deletePedido: async (id: string): Promise<void> => request(`/pedidos/${id}`, { method: 'DELETE' }),

  // Camareros
  getCamareros: async (): Promise<Camarero[]> => request<Camarero[]>('/camareros'),
  createCamarero: async (c: Camarero) => request<Camarero>('/camareros', { method: 'POST', body: JSON.stringify(c) }),
  updateCamarero: async (id: string, c: Partial<Camarero>) => request<Camarero>(`/camareros/${id}`, { method: 'PUT', body: JSON.stringify(c) }),
  deleteCamarero: async (id: string) => request(`/camareros/${id}`, { method: 'DELETE' }),

  // Coordinadores y clientes
  getCoordinadores: async (): Promise<Coordinador[]> => request<Coordinador[]>('/coordinadores'),
  createCoordinador: async (c: Coordinador) => request<Coordinador>('/coordinadores', { method: 'POST', body: JSON.stringify(c) }),
  getClientes: async (): Promise<Cliente[]> => request<Cliente[]>('/clientes'),
};