export interface GestionPedidosProps {
  pedidos: any[];
  setPedidos: (pedidos: any[]) => void;
  camareros: any[];
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void | Promise<void>;
}
