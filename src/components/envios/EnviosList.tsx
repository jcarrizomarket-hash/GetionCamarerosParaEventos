import { Send, Calendar, Clock, MapPin, Users, CheckCircle, Phone, X } from 'lucide-react';

interface EnviosListProps {
  eventosOrdenados: any[];
  camareros: any[];
  selectedEvento: any;
  setSelectedEvento: (e: any) => void;
  mensajeTipo: 'catering' | 'restauracion';
  setMensajeTipo: (t: 'catering' | 'restauracion') => void;
  showVistaPreviaServicio: boolean;
  setShowVistaPreviaServicio: (v: boolean) => void;
  enviarConfirmacion: () => void;
}

export function EnviosList({
  eventosOrdenados,
  camareros,
  selectedEvento,
  setSelectedEvento,
  mensajeTipo,
  setMensajeTipo,
  showVistaPreviaServicio,
  setShowVistaPreviaServicio,
  enviarConfirmacion,
}: EnviosListProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Eventos Próximos</h3>
          <span className="text-sm text-gray-500">{eventosOrdenados.length} eventos</span>
        </div>

        <div className="space-y-3">
          {eventosOrdenados.map(evento => {
            const asignados = evento.asignaciones || [];
            const confirmados = asignados.filter(a => a.estado === 'confirmado').length;

            return (
              <div key={evento.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-blue-600">{evento.numero}</span>
                      <span className="font-semibold text-gray-900">{evento.cliente}</span>
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
                        {confirmados}/{asignados.length} confirmados
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvento(evento)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 ml-4"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
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

      {/* Modal para Envío de Servicios */}
      {selectedEvento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-800">
                Enviar Confirmación - {selectedEvento.numero}
              </h3>
              <button
                onClick={() => setSelectedEvento(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del Evento */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">Detalles del Evento</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <span className="ml-2 font-medium">{selectedEvento.cliente}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedEvento.diaEvento).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Horario:</span>
                    <span className="ml-2 font-medium">
                      {selectedEvento.horaEntrada} - {selectedEvento.horaSalida}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lugar:</span>
                    <span className="ml-2 font-medium">{selectedEvento.lugar}</span>
                  </div>
                </div>
              </div>

              {/* Lista de Asignados */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Personal Asignado ({(selectedEvento.asignaciones || []).length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedEvento.asignaciones || []).map((asignacion) => {
                    const camarero = camareros.find(c => c.id === asignacion.camareroId);
                    return (
                      <div
                        key={asignacion.camareroId || asignacion.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              asignacion.estado === 'confirmado'
                                ? 'bg-green-500'
                                : asignacion.estado === 'pendiente'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <span className="font-medium">{camarero?.nombre || asignacion.camareroNombre}</span>
                          <span className="text-sm text-gray-500">
                            Turno {asignacion.turno}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {camarero?.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {camarero.telefono}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tipo de Mensaje */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Tipo de Servicio</h4>
                <div className="flex gap-4">
                  <button
                    onClick={() => setMensajeTipo('restauracion')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      mensajeTipo === 'restauracion'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🍴</div>
                    <div className="font-semibold">Restauración</div>
                  </button>
                  <button
                    onClick={() => setMensajeTipo('catering')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      mensajeTipo === 'catering'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🍽️</div>
                    <div className="font-semibold">Catering</div>
                  </button>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowVistaPreviaServicio(true)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Vista Previa
                </button>
                <button
                  onClick={enviarConfirmacion}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Confirmación
                </button>
                <button
                  onClick={() => setSelectedEvento(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa del Mensaje de Servicio */}
      {showVistaPreviaServicio && selectedEvento && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold">Vista Previa del Mensaje</h3>
                <p className="text-sm opacity-90">Revisa el mensaje antes de enviarlo</p>
              </div>
              <button
                onClick={() => setShowVistaPreviaServicio(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Simulación de mensaje de WhatsApp */}
              <div className="bg-[#E5DDD5] rounded-lg p-4">
                <div className="bg-white rounded-lg p-4 shadow-sm max-w-[85%]">
                  <div className="space-y-2 text-gray-800">
                    <div className="font-bold text-lg">
                      {mensajeTipo === 'catering' ? '🍽️ Confirmación de Servicio - CATERING' : '🍴 Confirmación de Servicio - RESTAURACIÓN'}
                    </div>

                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>📅 Fecha:</strong> {new Date(selectedEvento.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p>
                        <strong>🕐 Horario:</strong> {selectedEvento.horaEntrada} - {selectedEvento.horaSalida}
                      </p>
                      <p>
                        <strong>📍 Lugar:</strong> {selectedEvento.lugar}
                      </p>
                      <p>
                        <strong>👔 Dress Code:</strong> Camisa {selectedEvento.camisa}
                      </p>
                      {selectedEvento.catering === 'si' && (
                        <p className="text-green-600">✅ Incluye catering</p>
                      )}
                      {selectedEvento.notas && (
                        <p>
                          <strong>📝 Notas:</strong> {selectedEvento.notas}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-200 mt-3 text-sm italic text-gray-600">
                      Por favor confirma tu asistencia respondiendo este mensaje.
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de destinatarios */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Será enviado a {(selectedEvento.asignaciones || []).length} persona(s)
                </h4>
                <div className="space-y-1 text-sm text-gray-700">
                  {(selectedEvento.asignaciones || []).slice(0, 5).map((asignacion) => {
                    const camarero = camareros.find(c => c.id === asignacion.camareroId);
                    return (
                      <div key={asignacion.camareroId || asignacion.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          asignacion.estado === 'confirmado' ? 'bg-green-500' :
                          asignacion.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {camarero?.nombre || asignacion.camareroNombre}
                        {camarero?.telefono && <span className="text-gray-500 text-xs">({camarero.telefono})</span>}
                      </div>
                    );
                  })}
                  {(selectedEvento.asignaciones || []).length > 5 && (
                    <p className="text-gray-500 italic">
                      ...y {(selectedEvento.asignaciones || []).length - 5} más
                    </p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowVistaPreviaServicio(false);
                    enviarConfirmacion();
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Ahora
                </button>
                <button
                  onClick={() => setShowVistaPreviaServicio(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
