import { UserCheck, Users, Search, X, Clock } from 'lucide-react';

interface PedidoAssignmentProps {
  selectedPedido: any;
  camarerosDisponibles: any[];
  filtroCamarero: string;
  setFiltroCamarero: (v: string) => void;
  agregarCamarero: (camarero: any, turno?: number) => void;
  cambiarEstado: (camareroId: any, nuevoEstado: string) => void;
  removerCamarero: (camareroId: any) => void;
  procesando: boolean;
  requeridos: number;
  asignadosCount: number;
}

export function PedidoAssignment({
  selectedPedido,
  camarerosDisponibles,
  filtroCamarero,
  setFiltroCamarero,
  agregarCamarero,
  cambiarEstado,
  removerCamarero,
  procesando,
  requeridos,
  asignadosCount,
}: PedidoAssignmentProps) {
  const tieneDosHorarios = !!(selectedPedido.horaEntrada2 && selectedPedido.cantidadCamareros2);
  const cant1 = parseInt(selectedPedido.cantidadCamareros || 0);
  const cant2 = parseInt(selectedPedido.cantidadCamareros2 || 0);
  const asignaciones = selectedPedido.asignaciones || [];
  const turno1 = asignaciones.filter((a: any) => a.turno === 1 || (!a.turno && a.turno !== 2));
  const turno2 = asignaciones.filter((a: any) => a.turno === 2);

  function AsignadoCard({ asignacion, idxAsig }: { asignacion: any; idxAsig: number }) {
    return (
      <div
        key={`${asignacion.camareroId}-${idxAsig}`}
        className={`p-4 rounded-lg flex items-center justify-between border-l-4 shadow-sm transition-all ${
          asignacion.estado === 'confirmado' ? 'bg-green-50 border-green-500 border-t border-r border-b border-gray-100' :
          asignacion.estado === 'enviado' ? 'bg-orange-50 border-orange-500 border-t border-r border-b border-gray-100' :
          asignacion.estado === 'rechazado' ? 'bg-red-50 border-red-500 border-t border-r border-b border-red-100' :
          'bg-white border-gray-300 border-t border-r border-b border-gray-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{asignacion.camareroNombre}</p>
            <span className="text-xs text-gray-400">#{asignacion.camareroNumero}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Estado: {asignacion.estado ? asignacion.estado.toUpperCase() : 'PENDIENTE'}
            {asignacion.estado === 'rechazado' && asignacion.eliminacionProgramada && (
              <span className="ml-2 text-red-600 font-bold">
                (Se eliminará en {Math.ceil((new Date(asignacion.eliminacionProgramada).getTime() - new Date().getTime()) / (1000 * 60))} min)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={asignacion.estado || ''}
            onChange={(e) => cambiarEstado(asignacion.camareroId, e.target.value)}
            className={`text-xs px-2 py-1.5 rounded border font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
              asignacion.estado === 'confirmado' ? 'text-green-700 border-green-200 bg-white' :
              asignacion.estado === 'enviado' ? 'text-orange-700 border-orange-200 bg-white' :
              asignacion.estado === 'rechazado' ? 'text-red-700 border-red-200 bg-white' :
              'text-gray-700 border-gray-200 bg-gray-50'
            }`}
          >
            <option value="">Pendiente</option>
            <option value="enviado">Enviado</option>
            <option value="confirmado">Confirmado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <button
            onClick={() => removerCamarero(asignacion.camareroId)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remover del evento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">

      {/* COLUMNA 1: DISPONIBLES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Camareros Disponibles
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o número..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={filtroCamarero}
              onChange={(e) => setFiltroCamarero(e.target.value)}
            />
          </div>
          {tieneDosHorarios && (
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                {selectedPedido.horaEntrada}
              </span>
              <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                {selectedPedido.horaEntrada2}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 overflow-y-auto flex-1 bg-gray-50/30">
          {camarerosDisponibles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No se encontraron camareros</p>
              <p className="text-xs text-gray-300">Intenta cambiar la búsqueda o verifica la disponibilidad</p>
            </div>
          ) : (
            <div className="space-y-2">
              {camarerosDisponibles.map((camarero, idx) => (
                <div
                  key={camarero.id || idx}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-1.5 py-0.5 rounded">#{camarero.numero}</span>
                      <p className="font-medium text-gray-900">{camarero.nombre} {camarero.apellido}</p>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{camarero.telefono}</p>
                  </div>
                  {tieneDosHorarios ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => agregarCamarero(camarero, 1)}
                        disabled={procesando}
                        className="px-2.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        title={`Turno 1: ${selectedPedido.horaEntrada}`}
                      >
                        T1
                      </button>
                      <button
                        onClick={() => agregarCamarero(camarero, 2)}
                        disabled={procesando}
                        className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        title={`Turno 2: ${selectedPedido.horaEntrada2}`}
                      >
                        T2
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => agregarCamarero(camarero)}
                      disabled={procesando}
                      className={`px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs font-bold uppercase tracking-wide transition-all transform active:scale-95 ${
                        procesando ? 'opacity-50 cursor-not-allowed' : 'opacity-100 shadow-sm hover:shadow'
                      }`}
                    >
                      {procesando ? '...' : 'Asignar'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA 2: ASIGNADOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-blue-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Equipo Asignado ({asignadosCount}/{requeridos})
          </h2>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {asignaciones.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Users className="w-12 h-12 mb-3 opacity-20" />
              <p>Aún no has asignado camareros</p>
              <p className="text-sm">Selecciona de la lista izquierda</p>
            </div>
          ) : tieneDosHorarios ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-semibold text-blue-700">Turno 1</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />{selectedPedido.horaEntrada} → {selectedPedido.horaSalida}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">{turno1.length}/{cant1}</span>
                </div>
                {turno1.length === 0 ? (
                  <p className="text-xs text-gray-400 italic pl-2">Sin asignados — usá el botón T1</p>
                ) : (
                  <div className="space-y-2">
                    {turno1.map((a: any, i: number) => <AsignadoCard key={`t1-${i}`} asignacion={a} idxAsig={i} />)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-semibold text-indigo-700">Turno 2</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />{selectedPedido.horaEntrada2} → {selectedPedido.horaSalida2}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">{turno2.length}/{cant2}</span>
                </div>
                {turno2.length === 0 ? (
                  <p className="text-xs text-gray-400 italic pl-2">Sin asignados — usá el botón T2</p>
                ) : (
                  <div className="space-y-2">
                    {turno2.map((a: any, i: number) => <AsignadoCard key={`t2-${i}`} asignacion={a} idxAsig={i} />)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {asignaciones.map((asignacion: any, idxAsig: number) => (
                <AsignadoCard key={`${asignacion.camareroId}-${idxAsig}`} asignacion={asignacion} idxAsig={idxAsig} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
