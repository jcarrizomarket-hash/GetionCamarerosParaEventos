import { Calendar, Users, UserCheck, Clock, Check, AlertCircle, Download } from 'lucide-react';

interface PedidoFiltersProps {
  periodoFiltro: string;
  setPeriodoFiltro: (p: string) => void;
  exportarDatos: (tipo: string) => void;
  totalEventos: number;
  totalCamarerosNecesarios: number;
  totalEnviados: number;
  totalConfirmados: number;
  totalFaltantes: number;
  totalDisponibles: number;
}

export function PedidoFilters({
  periodoFiltro,
  setPeriodoFiltro,
  exportarDatos,
  totalEventos,
  totalCamarerosNecesarios,
  totalEnviados,
  totalConfirmados,
  totalFaltantes,
  totalDisponibles,
}: PedidoFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Periodo:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['diario', 'semanal', 'mensual'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodoFiltro(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                periodoFiltro === p ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Botón Exportar */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-xs font-medium border border-green-200 transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 hidden group-hover:block z-50">
          <div className="p-1">
            <button key="export-dia" onClick={() => exportarDatos('dia')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Por Día (Hoy)</button>
            <button key="export-semana" onClick={() => exportarDatos('semana')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Por Semana (Actual)</button>
            <button key="export-cliente" onClick={() => exportarDatos('cliente')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Por Cliente</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div key="metric-eventos" className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase">Eventos</p>
            <p className="text-lg font-bold text-blue-800">{totalEventos}</p>
          </div>
        </div>

        <div key="metric-necesarios" className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
          <div className="p-2 bg-purple-100 rounded-full text-purple-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-purple-600 font-medium uppercase">Necesarios</p>
            <p className="text-lg font-bold text-purple-800">{totalCamarerosNecesarios}</p>
          </div>
        </div>

        <div key="metric-disponibles" className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="p-2 bg-gray-100 rounded-full text-gray-600">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium uppercase">Disp. Plantilla</p>
            <p className="text-lg font-bold text-gray-800">{totalDisponibles}</p>
          </div>
        </div>

        <div key="metric-enviados" className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-medium uppercase">Enviados</p>
            <p className="text-lg font-bold text-amber-800">{totalEnviados}</p>
          </div>
        </div>

        <div key="metric-confirmados" className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-lg border border-green-100">
          <div className="p-2 bg-green-100 rounded-full text-green-600">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-green-600 font-medium uppercase">Confirmados</p>
            <p className="text-lg font-bold text-green-800">{totalConfirmados}</p>
          </div>
        </div>

        <div key="metric-faltantes" className="flex items-center gap-3 px-4 py-2 bg-red-50 rounded-lg border border-red-100">
          <div className="p-2 bg-red-100 rounded-full text-red-600">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-red-600 font-medium uppercase">Faltantes</p>
            <p className="text-lg font-bold text-red-800">{totalFaltantes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
