export const IDIOMAS = ['Castellano', 'Portugués', 'Catalán', 'Inglés', 'Francés', 'Alemán', 'Italiano'];
export const CERTIFICACIONES = ['PRL', 'Manipulación de alimentos', 'Primeros auxilios', 'APPCC', 'RCP'];
export const ESPECIALIDADES = ['Coctelería', 'Banquetes', 'Restaurant', 'Buffet', 'VIP'];

/** Shape returned by the Supabase `idiomas` table */
export interface Idioma {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

/** Shape returned by the Supabase `roles` table */
export interface Role {
  id: number;
  name: string;
  display_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

/** Offline / demo fallback – mirrors the seeded rows in the DB migration */
export const TIPOS_PERFIL: { codigo: string; label: string }[] = [
  { codigo: 'CAM', label: 'Camarero' },
  { codigo: 'COC', label: 'Cocina' },
  { codigo: 'PIC', label: 'Pica' },
  { codigo: 'AZA', label: 'Azafata' },
];

export interface CamarerosProps {
  camareros: any[];
  setCamareros: (camareros: any[]) => void;
  pedidos?: any[];
  coordinadores?: any[];
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
}

export interface Metricas {
  total: number;
  apercibidos: number;
  reserva: number;
  noDisponibles: number;
  valoracion: string;
}

export interface FormData {
  codigo: string;
  tipoPerfil: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  especialidades: string[];
  experiencia: string;
  coordinadorId: string;
  comentarios: string;
  idiomas: string[];
  otrosIdiomas: string;
  certificaciones: string[];
  otrasCertificaciones: string;
  disponibilidad: any[];
  estado: string;
}
