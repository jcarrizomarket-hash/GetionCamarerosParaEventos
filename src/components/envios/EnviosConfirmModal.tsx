import { Send, Phone, CheckCircle, X } from 'lucide-react';

interface EnviosConfirmModalProps {
  selectedEvento: any;
  setSelectedEvento: (e: any) => void;
  camareros: any[];
  setShowVistaPreviaServicio: (v: boolean) => void;
  enviarConfirmacion: () => void;
}

export function EnviosConfirmModal({
  selectedEvento,
  setSelectedEvento,
  camareros,
  setShowVistaPreviaServicio,
  enviarConfirmacion,
}: EnviosConfirmModalProps) {
  const modalidad = selectedEvento.catering === 'si' ? 'Catering 🍽️' : 'Restauración 🍴';
  const asignaciones = selectedEvento.asignaciones || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Enviar Servicio — {selectedEvento.numero}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Tipo detectado: <strong>{modalidad}</strong></p>
          </div>
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
              <div><span className="text-gray-600">Cliente:</span><span className="ml-2 font-medium">{selectedEvento.cliente}</span></div>
              <div><span className="text-gray-600">Fecha:</span><span className="ml-2 font-medium">{new Date(selectedEvento.diaEvento).toLocaleDateString('es-ES')}</span></div>
              <div><span className="text-gray-600">Hora entrada:</span><span className="ml-2 font-medium">{selectedEvento.horaEntrada}</span></div>
              <div><span className="text-gray-600">Lugar:</span><span className="ml-2 font-medium">{selectedEvento.lugar}</span></div>
              {selectedEvento.camisa && (
                <div><span className="text-gray-600">Camisa:</span><span className="ml-2 font-medium capitalize">{selectedEvento.camisa}</span></div>
              )}
            </div>
          </div>

          {/* Lista de Asignados */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">
              Personal Asignado ({asignaciones.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {asignaciones.map((asignacion) => {
                const camarero = camareros.find(c => c.id === asignacion.camareroId);
                return (
                  <div
                    key={asignacion.camareroId || asignacion.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        asignacion.estado === 'confirmado' ? 'bg-green-500' :
                        asignacion.estado === 'enviado'    ? 'bg-orange-400' :
                        asignacion.estado === 'rechazado'  ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium">{camarero?.nombre || asignacion.camareroNombre}</span>
                      <span className="text-xs text-gray-400 bg-gray-200 rounded px-1.5 py-0.5">
                        {camarero?.tipoPerfil ?? 'CAM'}
                      </span>
                    </div>
                    {camarero?.telefono && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />{camarero.telefono}
                      </span>
                    )}
                  </div>
                );
              })}
              {asignaciones.length === 0 && (
                <p className="text-gray-400 text-sm italic text-center py-4">Sin personal asignado</p>
              )}
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
              Enviar a todos
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
