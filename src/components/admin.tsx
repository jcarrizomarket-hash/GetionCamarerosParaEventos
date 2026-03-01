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

export function Admin({
  coordinadores,
  setCoordinadores,
  baseUrl,
  publicAnonKey,
  cargarDatos,
  camareros,
  pedidos,
}: AdminProps) {
  const handleExportCoordinadores = () => {
    exportToCSV(coordinadores, 'coordinadores.csv');
  };

  const handleExportCamareros = () => {
    exportToCSV(camareros, 'camareros.csv');
  };

  const handleExportPedidos = () => {
    exportToCSV(pedidos, 'pedidos.csv');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-2">Coordinadores</h3>
          <p className="text-3xl font-bold text-blue-600">{coordinadores.length}</p>
          <button
            onClick={handleExportCoordinadores}
            className="mt-3 text-sm text-blue-500 hover:underline"
          >
            Exportar CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-2">Camareros</h3>
          <p className="text-3xl font-bold text-green-600">{camareros.length}</p>
          <button
            onClick={handleExportCamareros}
            className="mt-3 text-sm text-blue-500 hover:underline"
          >
            Exportar CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-2">Pedidos</h3>
          <p className="text-3xl font-bold text-purple-600">{pedidos.length}</p>
          <button
            onClick={handleExportPedidos}
            className="mt-3 text-sm text-blue-500 hover:underline"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Coordinadores registrados</h3>
          <button
            onClick={cargarDatos}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>

        {coordinadores.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay coordinadores registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Nombre</th>
                <th className="text-left py-2 px-3">Email</th>
                <th className="text-left py-2 px-3">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {coordinadores.map((c: any) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{c.nombre ?? '—'}</td>
                  <td className="py-2 px-3">{c.email ?? '—'}</td>
                  <td className="py-2 px-3">{c.telefono ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}