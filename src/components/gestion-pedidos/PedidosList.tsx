import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface PedidosListProps {
  currentDate: Date;
  changeMonth: (offset: number) => void;
  monthData: { days: number; firstDay: number };
  pedidosMes: any[];
  pedidosOrdenados: any[];
  filasTabla: any[];
  setSelectedPedido: (p: any) => void;
  isPedidoCompleto: (p: any) => boolean;
  getHoraSalidaIndividual: (pedidoId: any, camareroId: any) => string;
  actualizarHoraSalidaIndividual: (pedidoId: any, camareroId: any, hora: string) => void;
  calcularHoras: (entrada: string, salida: string) => string;
}

export function PedidosList({
  currentDate,
  changeMonth,
  monthData,
  pedidosMes,
  pedidosOrdenados,
  filasTabla,
  setSelectedPedido,
  isPedidoCompleto,
  getHoraSalidaIndividual,
  actualizarHoraSalidaIndividual,
  calcularHoras,
}: PedidosListProps) {
  return (
    <>
      {/* --- CALENDARIO --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Seleccionar Evento
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg border px-2 py-1">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-sm w-32 text-center">
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                {day}
              </div>
            ))}

            {/* Días vacíos */}
            {Array.from({ length: monthData.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[100px]"></div>
            ))}

            {/* Días del mes */}
            {Array.from({ length: monthData.days }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const pedidosDia = pedidosMes.filter(p => p.diaEvento === dateStr);

              return (
                <div key={day} className="bg-white p-2 min-h-[100px] hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-400 mb-1 text-sm">{day}</div>
                  <div className="space-y-1">
                    {pedidosDia.map((pedido, idx) => {
                      const completo = isPedidoCompleto(pedido);
                      return (
                        <div
                          key={pedido.id || idx}
                          className={`text-xs p-1.5 rounded border truncate cursor-pointer transition-all hover:scale-105 shadow-sm ${
                            completo
                              ? 'bg-green-100 border-green-200 text-green-800'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                          onClick={() => setSelectedPedido(pedido)}
                          title="Click para gestionar este evento"
                        >
                          <div className="font-bold">{pedido.numero}</div>
                          <div className="truncate opacity-90">{pedido.cliente}</div>
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

      {/* --- LISTA DE EVENTOS PRÓXIMOS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Próximos Eventos</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {pedidosOrdenados.filter(p => new Date(p.diaEvento) >= new Date().setHours(0,0,0,0)).slice(0, 5).map(pedido => {
            const totalReq = (parseInt(pedido.cantidadCamareros || 0)) + (parseInt(pedido.cantidadCamareros2 || 0));
            const asigs = pedido.asignaciones || [];
            const enviados = asigs.filter(a => a.estado === 'enviado').length;
            const confirmados = asigs.filter(a => a.estado === 'confirmado').length;
            const asignadosTotal = asigs.length;
            const faltantes = Math.max(0, totalReq - asignadosTotal);

            return (
              <div
                key={pedido.id}
                className="p-4 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => setSelectedPedido(pedido)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{pedido.cliente}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{pedido.numero}</span>
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap items-center gap-4 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(pedido.diaEvento).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {pedido.horaEntrada}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span key="pedida" className="text-gray-500" title="Total Pedida">
                      Pedida: {totalReq}
                    </span>
                    <span key="sep1" className="text-gray-300">|</span>
                    <span key="enviados" className="text-amber-700" title="Enviados">
                      Enviados: {enviados}
                    </span>
                    <span key="sep2" className="text-gray-300">|</span>
                    <span key="confirmados" className="text-green-700" title="Confirmados">
                      Confirmados: {confirmados}
                    </span>
                    <span key="sep3" className="text-gray-300">|</span>
                    <span key="faltantes" className="text-red-600" title="Faltantes por asignar">
                      Faltantes: {faltantes}
                    </span>
                  </div>
                </div>
                <div className="text-blue-600 pl-4">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- TABLA GLOBAL DE ASIGNACIONES --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Estado Global de Asignaciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Día</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lugar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora Entrada</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora Salida</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Horas</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Camarero</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Situación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filasTabla.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No hay eventos o camareros asignados en el periodo seleccionado.
                  </td>
                </tr>
              ) : (
                filasTabla.map((item) => {
                  let situationClass = 'bg-gray-100 text-gray-800';
                  let situationLabel = 'Pendiente';
                  let camareroLabel: React.ReactNode = '-';

                  if (item.type === 'asignado') {
                    camareroLabel = item.data.camareroNombre;
                    if (item.data.estado === 'enviado') {
                      situationClass = 'bg-amber-100 text-amber-800';
                      situationLabel = 'Mensaje Enviado';
                    } else if (item.data.estado === 'confirmado') {
                      situationClass = 'bg-green-100 text-green-800';
                      situationLabel = 'Confirmado';
                    } else if (item.data.estado === 'rechazado') {
                      situationClass = 'bg-red-100 text-red-800 font-bold';
                      situationLabel = 'Rechazado';
                    } else {
                      situationLabel = 'Mensaje sin enviar';
                    }
                  } else {
                    situationClass = 'bg-red-50 text-red-600 border border-red-100';
                    situationLabel = 'Sin Asignar';
                    camareroLabel = <span className="text-red-400 italic font-normal">-- Vacante --</span>;
                  }

                  return (
                    <tr key={item.uniqueId} className={`${item.bgClase} hover:opacity-90 transition-opacity`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {new Date(item.pedido.diaEvento).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.pedido.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.pedido.lugar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.hora || (item.type === 'asignado' ? item.data.horaEntrada : '-')}
                        {item.turno === 2 && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">2º Turno</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.type === 'asignado' ? (
                          <input
                            type="time"
                            value={getHoraSalidaIndividual(item.pedido.id, item.data.camareroId)}
                            onChange={(e) => actualizarHoraSalidaIndividual(item.pedido.id, item.data.camareroId, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        ) : (
                          <span className="text-gray-400 italic text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.type === 'asignado' && item.data.horaEntrada ? (() => {
                          const horaSalida = getHoraSalidaIndividual(item.pedido.id, item.data.camareroId);
                          return horaSalida ? (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono text-sm font-semibold">
                              {calcularHoras(item.data.horaEntrada, horaSalida)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          );
                        })() : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {camareroLabel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${situationClass}`}>
                          {situationLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
