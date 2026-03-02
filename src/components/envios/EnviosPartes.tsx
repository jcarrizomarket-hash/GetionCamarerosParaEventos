import { Send, Calendar, Clock, MapPin, Users, FileCheck, X } from 'lucide-react';

interface EnviosPartesProps {
  eventosOrdenados: any[];
  camareros: any[];
  coordinadores: any[];
  clientes: any[];
  selectedEvento: any;
  setSelectedEvento: (e: any) => void;
  estadosPartes: { [key: string]: 'pendiente' | 'enviado' };
  enviarParteServicio: (e: any) => void;
}

export function EnviosPartes({
  eventosOrdenados,
  camareros,
  coordinadores,
  clientes,
  selectedEvento,
  setSelectedEvento,
  estadosPartes,
  enviarParteServicio,
}: EnviosPartesProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Partes de Servicios</h3>
          <span className="text-sm text-gray-500">{eventosOrdenados.length} eventos</span>
        </div>

        <div className="space-y-3">
          {eventosOrdenados.map(evento => {
            const asignados = evento.asignaciones || [];
            const estado = estadosPartes[evento.id] || 'pendiente';

            return (
              <div key={evento.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-blue-600">{evento.numero}</span>
                      <span className="font-semibold text-gray-900">{evento.cliente}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        estado === 'enviado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {estado === 'enviado' ? '✓ Enviado' : '⏳ Pendiente'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(evento.diaEvento).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {evento.horaEntrada} - {evento.horaSalida}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {evento.lugar}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {asignados.length} personal
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedEvento(evento);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 ml-4"
                  >
                    <FileCheck className="w-4 h-4" />
                    Ver Parte
                  </button>
                </div>
              </div>
            );
          })}

          {eventosOrdenados.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay eventos registrados
            </div>
          )}
        </div>
      </div>

      {/* Modal para Parte de Servicio */}
      {selectedEvento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                Parte de Servicio - {selectedEvento.numero}
              </h3>
              <button
                onClick={() => setSelectedEvento(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Vista Previa del Parte en formato PDF */}
              <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                {/* Encabezado del Parte */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <h1 className="text-2xl font-bold mb-1">PARTE DE SERVICIO</h1>
                  <p className="text-lg font-mono">{selectedEvento.numero}</p>
                </div>

                {/* Datos del Cliente y Evento */}
                <div className="p-6 bg-gray-50 border-b-2 border-gray-300">
                  <div className="space-y-4">
                    {/* Datos del Cliente */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Datos del Cliente</h3>
                      <div className="bg-white p-4 rounded border border-gray-200 space-y-1 text-sm">
                        <div className="flex">
                          <span className="font-semibold w-24">Cliente:</span>
                          <span>{selectedEvento.cliente}</span>
                        </div>
                        {clientes.find(c => c.nombre === selectedEvento.cliente)?.contacto && (
                          <div className="flex">
                            <span className="font-semibold w-24">Contacto:</span>
                            <span>{clientes.find(c => c.nombre === selectedEvento.cliente)?.contacto}</span>
                          </div>
                        )}
                        {clientes.find(c => c.nombre === selectedEvento.cliente)?.telefono && (
                          <div className="flex">
                            <span className="font-semibold w-24">Teléfono:</span>
                            <span>{clientes.find(c => c.nombre === selectedEvento.cliente)?.telefono}</span>
                          </div>
                        )}
                        {clientes.find(c => c.nombre === selectedEvento.cliente)?.email && (
                          <div className="flex">
                            <span className="font-semibold w-24">Email:</span>
                            <span>{clientes.find(c => c.nombre === selectedEvento.cliente)?.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Datos del Evento */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Datos del Evento</h3>
                      <div className="bg-white p-4 rounded border border-gray-200 space-y-1 text-sm">
                        <div className="flex">
                          <span className="font-semibold w-24">Fecha:</span>
                          <span>{new Date(selectedEvento.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold w-24">Horario:</span>
                          <span>{selectedEvento.horaEntrada} - {selectedEvento.horaSalida}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold w-24">Lugar:</span>
                          <span>{selectedEvento.lugar}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold w-24">Servicio:</span>
                          <span>{selectedEvento.catering === 'si' ? 'Catering' : 'Restauración'}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold w-24">Dress Code:</span>
                          <span>Camisa {selectedEvento.camisa}</span>
                        </div>
                        {selectedEvento.notas && (
                          <div className="flex">
                            <span className="font-semibold w-24">Notas:</span>
                            <span>{selectedEvento.notas}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de Personal */}
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Personal Asignado</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-gray-400">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold text-sm w-16">Nº</th>
                          <th className="border-2 border-gray-400 px-4 py-2 text-left font-bold text-sm">Nombre y Apellidos</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold text-sm w-28">Hora Entrada</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold text-sm w-28">Hora Salida</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold text-sm w-28">Total Horas</th>
                          <th className="border-2 border-gray-400 px-4 py-2 text-left font-bold text-sm">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedEvento.asignaciones || []).map((asignacion, idx) => {
                          const camarero = camareros.find(c => c.id === asignacion.camareroId);
                          return (
                            <tr key={asignacion.camareroId || asignacion.id || `asig-${idx}`} className="hover:bg-gray-50">
                              <td className="border-2 border-gray-400 px-3 py-3 text-center font-semibold">{idx + 1}</td>
                              <td className="border-2 border-gray-400 px-4 py-3">
                                {camarero?.nombre || asignacion.camareroNombre}
                              </td>
                              <td className="border-2 border-gray-400 px-3 py-3 text-center bg-white">
                                {/* En blanco para rellenar manualmente */}
                              </td>
                              <td className="border-2 border-gray-400 px-3 py-3 text-center bg-white">
                                {/* En blanco para rellenar manualmente */}
                              </td>
                              <td className="border-2 border-gray-400 px-3 py-3 text-center bg-white">
                                {/* En blanco para rellenar manualmente */}
                              </td>
                              <td className="border-2 border-gray-400 px-4 py-3 bg-white">
                                {/* En blanco para rellenar manualmente */}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Filas vacías adicionales para rellenar */}
                        {Array.from({ length: Math.max(0, 5 - (selectedEvento.asignaciones || []).length) }).map((_, idx) => (
                          <tr key={`empty-${idx}`}>
                            <td className="border-2 border-gray-400 px-3 py-3 text-center text-gray-400">
                              {(selectedEvento.asignaciones || []).length + idx + 1}
                            </td>
                            <td className="border-2 border-gray-400 px-4 py-3 bg-white"></td>
                            <td className="border-2 border-gray-400 px-3 py-3 bg-white"></td>
                            <td className="border-2 border-gray-400 px-3 py-3 bg-white"></td>
                            <td className="border-2 border-gray-400 px-3 py-3 bg-white"></td>
                            <td className="border-2 border-gray-400 px-4 py-3 bg-white"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Información adicional */}
                  <div className="mt-6 text-xs text-gray-600 space-y-1">
                    <p><strong>Coordinador:</strong> {coordinadores.find(c => c.id === selectedEvento.coordinadorId)?.nombre || 'Sin asignar'}</p>
                    {coordinadores.find(c => c.id === selectedEvento.coordinadorId)?.telefono && (
                      <p><strong>Tel. Coordinador:</strong> {coordinadores.find(c => c.id === selectedEvento.coordinadorId)?.telefono}</p>
                    )}
                    <p className="mt-3 text-gray-500">Fecha de generación: {new Date().toLocaleString('es-ES')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Aquí implementaremos la descarga del PDF
                    alert('Funcionalidad de descarga PDF en desarrollo. Por ahora puedes imprimir usando Ctrl+P o Cmd+P');
                    window.print();
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-5 h-5" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => enviarParteServicio(selectedEvento)}
                  disabled={estadosPartes[selectedEvento.id] === 'enviado'}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {estadosPartes[selectedEvento.id] === 'enviado' ? 'Parte Enviado' : 'Enviar Parte'}
                </button>
                <button
                  onClick={() => setSelectedEvento(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
