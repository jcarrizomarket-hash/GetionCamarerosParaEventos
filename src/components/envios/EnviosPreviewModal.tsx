import { Send, Users, X } from 'lucide-react';

interface EnviosPreviewModalProps {
  selectedEvento: any;
  camareros: any[];
  mensajeTipo: 'catering' | 'restauracion';
  setShowVistaPreviaServicio: (v: boolean) => void;
  enviarConfirmacion: () => void;
}

export function EnviosPreviewModal({
  selectedEvento,
  camareros,
  mensajeTipo,
  setShowVistaPreviaServicio,
  enviarConfirmacion,
}: EnviosPreviewModalProps) {
  return (
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
  );
}
