import { logger } from '../utils/logger';
import { useState } from 'react';
import { Shield, Users, UserCheck, Download } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState<'resumen' | 'camareros' | 'pedidos'>('resumen');

  const exportarCSV = (datos: any[], nombreArchivo: string) => {
    if (!datos.length) return;
    const headers = Object.keys(datos[0]);
    const filas = datos.map(fila =>
      headers.map(h => JSON.stringify(fila[h] ?? '')).join(',')
    );
    const csvContent = [headers.join(','), ...filas].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logger.info(`Exportado: ${nombreArchivo}`);
  };

  const handleExportCamareros = () => {
    exportarCSV(camareros, 'camareros.csv');
  };

  const handleExportPedidos = () => {
    exportarCSV(pedidos, 'pedidos.csv');
  };

  const secciones = [
    { id: 'resumen' as const, label: 'Resumen', icon: Shield },
    { id: 'camareros' as const, label: 'Camareros', icon: Users },
    { id: 'pedidos' as const, label: 'Pedidos', icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {secciones.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSection === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Camareros</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{camareros.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Pedidos</h3>
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pedidos.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Coordinadores</h3>
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{coordinadores.length}</p>
          </div>
        </div>
      )}

      {activeSection === 'camareros' && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Lista de Camareros</h3>
            <button
              onClick={handleExportCamareros}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Código</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Teléfono</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {camareros.map((c: any, i: number) => (
                  <tr key={c.id ?? i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{c.codigo}</td>
                    <td className="px-4 py-2">{c.nombre} {c.apellido}</td>
                    <td className="px-4 py-2">{c.telefono}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
                {camareros.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No hay camareros registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'pedidos' && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Lista de Pedidos</h3>
            <button
              onClick={handleExportPedidos}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">ID</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p: any, i: number) => (
                  <tr key={p.id ?? i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-2">{p.fecha}</td>
                    <td className="px-4 py-2">{p.cliente}</td>
                    <td className="px-4 py-2">{p.estado}</td>
                  </tr>
                ))}
                {pedidos.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No hay pedidos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
