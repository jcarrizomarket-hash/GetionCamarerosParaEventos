import { Users, UserCheck, UserX, Star, Download, Upload } from 'lucide-react';
import { Metricas } from './types';

interface CamareroStatsProps {
  metricas: Metricas;
  exportarAExcel: () => void;
  importarDesdeExcel: (event: any) => void;
}

export function CamareroStats({ metricas, exportarAExcel, importarDesdeExcel }: CamareroStatsProps) {
  return (
    <>
      {/* Botones de Exportación e Importación */}
      <div className="flex justify-end gap-3">
        <button
          onClick={exportarAExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar a Excel
        </button>
        <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-sm transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Importar desde Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={importarDesdeExcel}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Activos</p>
            <p className="text-2xl font-bold text-gray-800">{metricas.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">En Reserva (Hoy)</p>
            <p className="text-2xl font-bold text-gray-800">{metricas.reserva}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">No Disponibles (Hoy)</p>
            <p className="text-2xl font-bold text-gray-800">{metricas.noDisponibles}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Valoración Equipo</p>
            <p className="text-2xl font-bold text-gray-800">{metricas.valoracion}/5</p>
          </div>
        </div>
      </div>
    </>
  );
}
