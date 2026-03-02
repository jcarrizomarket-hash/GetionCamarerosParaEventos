import { exportToCSV } from '../utils/file-export';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: any[];
  pedidos: any[];
}

export function Admin({ coordinadores, camareros, pedidos }: AdminProps) {
  const handleExport = () => {
    const data = camareros.map(c => ({
      nombre: c.nombre,
      apellido: c.apellido,
      email: c.email || '',
      telefono: c.telefono || '',
      estado: c.estado || 'activo',
    }));
    exportToCSV(data, 'admin-export.csv');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Panel de Administración</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-500">Personal</p>
          <p className="text-2xl font-bold">{camareros.length}</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-500">Coordinadores</p>
          <p className="text-2xl font-bold">{coordinadores.length}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <p className="text-sm text-gray-500">Pedidos</p>
          <p className="text-2xl font-bold">{pedidos.length}</p>
        </div>
      </div>
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Exportar Personal (CSV)
      </button>
    </div>
  );
}
