import { useState } from 'react';
import { Shield, Users, ClipboardList, Download } from 'lucide-react';
import { exportToCSV } from '../utils/file-export';

interface Camarero {
  id?: string;
  nombre?: string;
  apellido?: string;
  [key: string]: unknown;
}

interface Pedido {
  id?: string;
  numero?: string;
  cliente?: string;
  [key: string]: unknown;
}

interface Coordinador {
  id?: string;
  nombre?: string;
  [key: string]: unknown;
}

interface AdminProps {
  coordinadores: Coordinador[];
  setCoordinadores: (coordinadores: Coordinador[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: Camarero[];
  pedidos: Pedido[];
}

export function Admin({ coordinadores, camareros, pedidos }: AdminProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const handleExportCamareros = () => {
    exportToCSV(camareros, 'camareros.csv');
  };

  const handleExportPedidos = () => {
    exportToCSV(pedidos, 'pedidos.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Camareros</p>
            <p className="text-2xl font-bold">{camareros.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Pedidos</p>
            <p className="text-2xl font-bold">{pedidos.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Coordinadores</p>
            <p className="text-2xl font-bold">{coordinadores.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-4 py-2 rounded ${activeSection === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveSection('exports')}
            className={`px-4 py-2 rounded ${activeSection === 'exports' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Exportar
          </button>
        </div>

        {activeSection === 'overview' && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Resumen del Sistema</h3>
            <p className="text-sm text-gray-500">
              Panel de administración con acceso a estadísticas y exportación de datos.
            </p>
          </div>
        )}

        {activeSection === 'exports' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-2">Exportar Datos</h3>
            <button
              onClick={handleExportCamareros}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              Exportar Camareros (CSV)
            </button>
            <button
              onClick={handleExportPedidos}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Download className="w-4 h-4" />
              Exportar Pedidos (CSV)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}