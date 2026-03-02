import { Send, Phone, CheckCircle, X } from 'lucide-react';

interface EnviosConfirmModalProps {
  selectedEvento: any;
  setSelectedEvento: (e: any) => void;
  camareros: any[];
  mensajeTipo: 'catering' | 'restauracion';
  setMensajeTipo: (t: 'catering' | 'restauracion') => void;
  setShowVistaPreviaServicio: (v: boolean) => void;
  enviarConfirmacion: () => void;
}

export function EnviosConfirmModal({
  selectedEvento,
  setSelectedEvento,
  camareros,
  mensajeTipo,
  setMensajeTipo,
  setShowVistaPreviaServicio,
  enviarConfirmacion,
}: EnviosConfirmModalProps) {
  return (
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
                      <span className="text-sm text-gray-500">Turno {asignacion.turno}</span>
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
  );
}
