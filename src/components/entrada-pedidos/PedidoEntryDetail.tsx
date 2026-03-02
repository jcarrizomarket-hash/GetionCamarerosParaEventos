import { BarChart3, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { ReportMetrics, Pedido } from './types';

interface MonthData {
  days: number;
  firstDay: number;
}

interface PedidoEntryDetailProps {
  reportPeriod: string;
  setReportPeriod: (period: string) => void;
  reportMetrics: ReportMetrics;
  currentDate: Date;
  changeMonth: (offset: number) => void;
  monthData: MonthData;
  pedidosMes: Pedido[];
  isPedidoCompleto: (pedido: Pedido) => boolean;
  handleEdit: (pedido: Pedido) => void;
}

export function PedidoEntryDetail({
  reportPeriod,
  setReportPeriod,
  reportMetrics,
  currentDate,
  changeMonth,
  monthData,
  pedidosMes,
  isPedidoCompleto,
  handleEdit,
}: PedidoEntryDetailProps) {
  return (
    <>
      {/* --- PANEL DE INFORMES --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Resumen de Actividad
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['diario', 'semanal', 'mensual'].map((p) => (
              <button
                key={p}
                onClick={() => setReportPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                  reportPeriod === p
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Pedidos</p>
            <p className="text-2xl font-bold text-blue-900">{reportMetrics.cantidadPedidos}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Solicitados</p>
            <p className="text-2xl font-bold text-purple-900">{reportMetrics.cantidadCamareros}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Plantilla Disp.</p>
            <p className="text-2xl font-bold text-gray-800">{reportMetrics.camarerosDisponibles}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">Confirmados</p>
            <p className="text-2xl font-bold text-green-800">{reportMetrics.camarerosConfirmados}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-xs font-semibold text-red-600 uppercase mb-1">Faltantes</p>
            <p className="text-2xl font-bold text-red-800">{reportMetrics.camarerosFaltantes}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Apercibidos</p>
            <p className="text-2xl font-bold text-amber-800">{reportMetrics.camarerosApercibidos}</p>
          </div>
        </div>
      </div>

      {/* --- CALENDARIO MENSUAL --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Calendario de Eventos
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-lg w-40 text-center">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 rounded-full">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {Array.from({ length: monthData.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[120px]"></div>
            ))}

            {Array.from({ length: monthData.days }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const pedidosDia = pedidosMes.filter((p) => p.diaEvento === dateStr);

              return (
                <div key={day} className="bg-white p-2 min-h-[120px] hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-400 mb-2">{day}</div>
                  <div className="space-y-1">
                    {pedidosDia.map((pedido, idx) => {
                      const completo = isPedidoCompleto(pedido);
                      return (
                        <div
                          key={pedido.id || idx}
                          className={`text-xs p-1.5 rounded border truncate cursor-pointer transition-all ${
                            completo
                              ? 'bg-green-100 border-green-200 text-green-800'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                          onClick={() => handleEdit(pedido)}
                          title={`${pedido.cliente} - ${pedido.lugar}`}
                        >
                          <div className="font-semibold">{pedido.numero}</div>
                          <div className="truncate">{pedido.cliente}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
