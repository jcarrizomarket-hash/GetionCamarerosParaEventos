export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
}

export interface Coordinador {
  id: string;
  nombre: string;
}

export interface Camarero {
  id: string;
  nombre: string;
  estado?: string;
}

export interface Asignacion {
  id: string;
  estado: string;
}

export interface Pedido {
  id: string;
  numero?: string;
  cliente: string;
  lugar: string;
  ubicacion?: string;
  diaEvento: string;
  cantidadCamareros: number;
  horaEntrada: string;
  horaSalida: string;
  totalHoras: string;
  cantidadCamareros2?: number;
  horaEntrada2?: string;
  horaSalida2?: string;
  totalHoras2?: string;
  catering: string;
  camisa: string;
  notas?: string;
  coordinadorId?: string;
  coordinadorNombre?: string;
  asignaciones?: Asignacion[];
}

export interface FormData {
  numero: string;
  cliente: string;
  lugar: string;
  ubicacion: string;
  diaEvento: string;
  cantidadCamareros: number;
  horaEntrada: string;
  horaSalida: string;
  totalHoras: string;
  cantidadCamareros2: number;
  horaEntrada2: string;
  horaSalida2: string;
  totalHoras2: string;
  catering: string;
  camisa: string;
  notas: string;
  coordinadorId: string;
  coordinadorNombre: string;
}

export interface ReportMetrics {
  cantidadPedidos: number;
  cantidadCamareros: number;
  camarerosDisponibles: number;
  camarerosConfirmados: number;
  camarerosFaltantes: number;
  camarerosApercibidos: number;
}

export interface EntradaPedidosProps {
  clientes: Cliente[];
  setClientes: (clientes: Cliente[]) => void;
  pedidos: Pedido[];
  setPedidos: (pedidos: Pedido[]) => void;
  camareros?: Camarero[];
  coordinadores?: Coordinador[];
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void | Promise<void>;
}
