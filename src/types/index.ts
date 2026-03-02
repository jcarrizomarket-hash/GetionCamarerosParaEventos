export interface Camarero {
  id: string;
  nombre: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  dni?: string;
  estado: 'disponible' | 'ocupado' | 'no_disponible' | 'baja';
  especialidad?: string;
  experiencia?: string;
  fecha_alta?: string;
  notas?: string;
  valoracion?: number;
  foto?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pedido {
  id: string;
  nombre_evento?: string;
  nombre?: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  ubicacion?: string;
  direccion?: string;
  estado: 'pendiente' | 'confirmado' | 'en_curso' | 'completado' | 'cancelado';
  num_camareros?: number;
  camareros_asignados?: string[];
  cliente_id?: string;
  cliente_nombre?: string;
  coordinador_id?: string;
  tipo_evento?: string;
  notas?: string;
  precio_hora?: number;
  total?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Coordinador {
  id: string;
  nombre: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  rol?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  nif_cif?: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}
