import { exportToCSV } from '../utils/file-export';
import { logger } from '../utils/logger';

interface AdminProps {
  coordinadores: Record<string, unknown>[];
  camareros: Record<string, unknown>[];
  pedidos: Record<string, unknown>[];
  setCoordinadores?: (coordinadores: Record<string, unknown>[]) => void;
  baseUrl?: string;
  publicAnonKey?: string;
  cargarDatos?: () => void;
}

export function Admin({ coordinadores, camareros, pedidos }: AdminProps) {
  const handleExportCamareros = () => {
    try {
      exportToCSV(camareros, 'camareros.csv');
    } catch (error) {
      logger.error('Error al exportar camareros:', error);
    }
  };

  const handleExportPedidos = () => {
    try {
      exportToCSV(pedidos, 'pedidos.csv');
    } catch (error) {
      logger.error('Error al exportar pedidos:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600">Coordinadores</p>
          <p className="text-3xl font-bold">{coordinadores.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600">Camareros</p>
          <p className="text-3xl font-bold">{camareros.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600">Pedidos</p>
          <p className="text-3xl font-bold">{pedidos.length}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleExportCamareros}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exportar Camareros CSV
        </button>
        <button
          onClick={handleExportPedidos}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Exportar Pedidos CSV
        </button>
      </div>
    </div>
  );
}

export default Admin;
