export interface Asignacion {
  id?: string;
  camareroId: string;
  estado?: 'enviado' | 'confirmado' | 'rechazado' | '';
  fechaAsignacion?: string;
}

export interface Pedido {
  id?: string;
  numero?: string;
  cliente: string;
  lugar: string;
  ubicacion?: string;
  diaEvento: string; // 'YYYY-MM-DD'
  cantidadCamareros?: number;
  horaEntrada?: string; // 'HH:mm'
  horaSalida?: string;  // 'HH:mm'
  totalHoras?: string;
  cantidadCamareros2?: number;
  horaEntrada2?: string;
  horaSalida2?: string;
  totalHoras2?: string;
  catering?: 'si' | 'no';
  camisa?: string;
  notas?: string;
  asignaciones?: Asignacion[];
  created_at?: string;
}

export interface Camarero {
  id?: string;
  codigo?: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  especialidades?: string[];
  experiencia?: number | string;
  coordinadorId?: string;
  comentarios?: string;
  idiomas?: string[];
  certificaciones?: string[];
  disponibilidad?: { fecha: string; tipo: 'disponible' | 'no-disponible'; horario?: string }[];
  estado?: 'activo' | 'apercibido' | 'reserva';
  created_at?: string;
}

export interface Coordinador {
  id?: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  created_at?: string;
}

export interface Cliente {
  id?: string;
  nombre: string;
  telefono?: string;
  email?: string;
  created_at?: string;
}