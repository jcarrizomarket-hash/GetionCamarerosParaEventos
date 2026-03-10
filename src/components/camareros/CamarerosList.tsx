import { useState } from 'react';
import { Edit2, Calendar, Trash2, Users, QrCode } from 'lucide-react';
import { CamareroDetail } from './CamareroDetail';
import { CamareroQR } from './CamareroQR';

interface CamarerosListProps {
  listaCamareros: any[];
  verApercibidos: boolean;
  selectedCamarero: any;
  setSelectedCamarero: (camarero: any) => void;
  showCalendario: boolean;
  setShowCalendario: (show: boolean) => void;
  coordinadores: any[];
  editarCamarero: (camarero: any) => void;
  eliminarCamarero: (id: any) => void;
  toggleApercibido: (camarero: any) => void;
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

export function CamarerosList({
  listaCamareros,
  verApercibidos,
  selectedCamarero,
  setSelectedCamarero,
  showCalendario,
  setShowCalendario,
  coordinadores,
  editarCamarero,
  eliminarCamarero,
  toggleApercibido,
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
}: CamarerosListProps) {
  const [qrCamarero, setQrCamarero] = useState<any>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-lg">
          {verApercibidos ? 'Ranking de Apercibidos' : 'Personal Activo'}
        </h3>
        <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-500 border border-gray-200">
          {listaCamareros.length} registros
        </span>
      </div>

      {listaCamareros.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No hay camareros en esta lista</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {listaCamareros.map((camarero) => (
            <div key={camarero.id} className={`p-6 hover:bg-gray-50 transition-colors ${verApercibidos ? 'bg-amber-50/30' : ''}`}>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold font-mono ${verApercibidos ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-800'}`}>
                      {camarero.codigo || `#${camarero.numero}`}
                    </span>
                    <h4 className="text-lg font-bold text-gray-900">{camarero.nombre} {camarero.apellido}</h4>
                    {camarero.coordinadorId && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs border border-purple-100">
                        Coord: {coordinadores.find(c => c.id === camarero.coordinadorId)?.nombre || 'Desconocido'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Tel:</span> {camarero.telefono}</p>
                    <p><span className="font-medium">Email:</span> {camarero.email}</p>
                    {verApercibidos && camarero.comentarios && (
                      <div className="col-span-2 bg-white p-2 rounded border border-amber-200 mt-2">
                        <span className="font-bold text-amber-800 text-xs">Nota de Apercibimiento / Comentario:</span>
                        <p className="text-gray-700 italic">{camarero.comentarios}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCamarero(camarero);
                        setShowCalendario(!showCalendario || selectedCamarero?.id !== camarero.id);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver Disponibilidad"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setQrCamarero(camarero)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Generar QR Check-in"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <button onClick={() => editarCamarero(camarero)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => eliminarCamarero(camarero.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleApercibido(camarero)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${camarero.estado === 'apercibido'
                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                  >
                    {camarero.estado === 'apercibido' ? 'Reactivar' : 'Apercibir'}
                  </button>
                </div>
              </div>

              {showCalendario && selectedCamarero?.id === camarero.id && (
                <CamareroDetail
                  camarero={camarero}
                  modoDisponibilidad={modoDisponibilidad}
                  setModoDisponibilidad={setModoDisponibilidad}
                  fechaInicio={fechaInicio}
                  setFechaInicio={setFechaInicio}
                  fechaFin={fechaFin}
                  setFechaFin={setFechaFin}
                  horaInicio={horaInicio}
                  setHoraInicio={setHoraInicio}
                  horaFin={horaFin}
                  setHoraFin={setHoraFin}
                  diasSeleccionados={diasSeleccionados}
                  toggleDiaSemana={toggleDiaSemana}
                  tipoDisponibilidad={tipoDisponibilidad}
                  setTipoDisponibilidad={setTipoDisponibilidad}
                  agregarDisponibilidad={agregarDisponibilidad}
                  eliminarDisponibilidad={eliminarDisponibilidad}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {qrCamarero && (
        <CamareroQR
          camarero={qrCamarero}
          pedidoId="sin-pedido"
          pedidoNumero="Check-in General"
          onClose={() => setQrCamarero(null)}
        />
      )}
    </div>
  );
}
