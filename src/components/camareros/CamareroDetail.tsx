import { XCircle, CalendarRange, Clock, Calendar } from 'lucide-react';

interface CamareroDetailProps {
  camarero: any;
  modoDisponibilidad: string;
  setModoDisponibilidad: (modo: string) => void;
  fechaInicio: string;
  setFechaInicio: (fecha: string) => void;
  fechaFin: string;
  setFechaFin: (fecha: string) => void;
  horaInicio: string;
  setHoraInicio: (hora: string) => void;
  horaFin: string;
  setHoraFin: (hora: string) => void;
  diasSeleccionados: number[];
  toggleDiaSemana: (diaIndex: number) => void;
  tipoDisponibilidad: string;
  setTipoDisponibilidad: (tipo: string) => void;
  agregarDisponibilidad: () => void;
  eliminarDisponibilidad: (fecha: string) => void;
}

export function CamareroDetail({
  camarero,
  modoDisponibilidad,
  setModoDisponibilidad,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  horaInicio,
  setHoraInicio,
  horaFin,
  setHoraFin,
  diasSeleccionados,
  toggleDiaSemana,
  tipoDisponibilidad,
  setTipoDisponibilidad,
  agregarDisponibilidad,
  eliminarDisponibilidad,
}: CamareroDetailProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in bg-white rounded-lg">
      <div className="flex flex-col xl:flex-row gap-6">

        {/* PANEL IZQUIERDO: FORMULARIO */}
        <div className="flex-1 bg-blue-50 p-5 rounded-lg border border-blue-100">
          <h5 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <CalendarRange className="w-5 h-5" />
            Gestionar Disponibilidad
          </h5>

          {/* Selector de Modo */}
          <div className="flex bg-white rounded-lg p-1 mb-4 shadow-sm">
            <button onClick={() => setModoDisponibilidad('unica')} className={`flex-1 py-1.5 text-xs font-medium rounded ${modoDisponibilidad === 'unica' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Única</button>
            <button onClick={() => setModoDisponibilidad('rango')} className={`flex-1 py-1.5 text-xs font-medium rounded ${modoDisponibilidad === 'rango' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Rango</button>
            <button onClick={() => setModoDisponibilidad('semanal')} className={`flex-1 py-1.5 text-xs font-medium rounded ${modoDisponibilidad === 'semanal' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Semanal</button>
          </div>

          <div className="space-y-3">
            {/* Fechas */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">{modoDisponibilidad === 'unica' ? 'Fecha' : 'Desde'}</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
              {modoDisponibilidad !== 'unica' && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Hasta</label>
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                </div>
              )}
            </div>

            {/* Días Semanales */}
            {modoDisponibilidad === 'semanal' && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Repetir los días</label>
                <div className="flex justify-between gap-1">
                  {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDiaSemana(i)}
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${diasSeleccionados.includes(i) ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-500'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Horario */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Hora Inicio</label>
                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Hora Fin</label>
                <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Estado</label>
              <select value={tipoDisponibilidad} onChange={(e) => setTipoDisponibilidad(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                <option key="disp-disponible" value="disponible">Disponible</option>
                <option key="disp-no-disponible" value="no-disponible">No Disponible</option>
              </select>
            </div>

            <button onClick={agregarDisponibilidad} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm mt-2">
              Guardar Disponibilidad
            </button>
          </div>
        </div>

        {/* PANEL DERECHO: LISTA */}
        <div className="flex-[2]">
          <h5 className="font-bold text-gray-800 mb-3 text-sm flex items-center justify-between">
            <span>Calendario Registrado</span>
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Ordenado por fecha</span>
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {camarero.disponibilidad && camarero.disponibilidad.length > 0 ? (
              camarero.disponibilidad
                .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                .map((disp: any, idx: number) => (
                  <div
                    key={`${disp.fecha}-${idx}`}
                    className={`flex flex-col p-2 rounded border relative group ${
                      disp.tipo === 'disponible'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold ${disp.tipo === 'disponible' ? 'text-green-800' : 'text-red-800'}`}>
                        {new Date(disp.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <button
                        onClick={() => eliminarDisponibilidad(disp.fecha)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      {disp.horario ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{disp.horario}</span>
                        </>
                      ) : (
                        <span className="italic opacity-50">Todo el día</span>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay disponibilidad registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
