import { supabaseProjectId, supabaseAnonKey, supabaseFunctionEndpoint } from '../config/env';

const baseUrl = supabaseFunctionEndpoint ||
  (supabaseProjectId
    ? `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-25b11ac0`
    : '');

const authHeader = { Authorization: `Bearer ${supabaseAnonKey}` };

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function fetchResource<T>(path: string): Promise<T[]> {
  const response = await fetch(`${baseUrl}/${path}`, { headers: authHeader });
  if (!response.ok) {
    throw new Error(`Error al cargar ${path}: ${response.status} ${response.statusText}`);
  }
  const json: ApiResponse<T[]> = await response.json();
  if (!json.success) {
    throw new Error(json.error ?? `Error en la respuesta de ${path}`);
  }
  return json.data;
}

export async function loadCamareros(): Promise<any[]> {
  return fetchResource('camareros');
}

export async function loadPedidos(): Promise<any[]> {
  return fetchResource('pedidos');
}

export async function loadCoordinadores(): Promise<any[]> {
  return fetchResource('coordinadores');
}

export async function loadClientes(): Promise<any[]> {
  return fetchResource('clientes');
}

export interface AllData {
  camareros: any[];
  pedidos: any[];
  coordinadores: any[];
  clientes: any[];
}

export async function loadAllData(): Promise<AllData> {
  const [camareros, pedidos, coordinadores, clientes] = await Promise.all([
    loadCamareros(),
    loadPedidos(),
    loadCoordinadores(),
    loadClientes(),
  ]);
  return { camareros, pedidos, coordinadores, clientes };
}
