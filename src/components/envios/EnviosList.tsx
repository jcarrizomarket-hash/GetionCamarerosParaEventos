import { Send, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { EnviosConfirmModal } from './EnviosConfirmModal';
import { EnviosPreviewModal } from './EnviosPreviewModal';

interface EnviosListProps {
  eventosOrdenados: any[];
  camareros: any[];
  selectedEvento: any;
  setSelectedEvento: (e: any) => void;
  showVistaPreviaServicio: boolean;
  setShowVistaPreviaServicio: (v: boolean) => void;
  enviarConfirmacion: () => void;
  onEstadoActualizado: (pedidoActualizado: any) => void;
}

export function EnviosList({
  eventosOrdenados,
  camareros,
  selectedEvento,
  setSelectedEvento,
  showVistaPreviaServicio,
  setShowVistaPreviaServicio,
  enviarConfirmacion,
  onEstadoActualizado,
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
            const confirmados = asignados.filter((a: any) => a.estado === 'confirmado').length;
            const modalidad = evento.catering === 'si' ? '🍽️ Catering' : '🍴 Restauración';

            return (
              <div key={evento.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono font-bold text-blue-600">{evento.numero}</span>
                      <span className="font-semibold text-gray-900">{evento.cliente}</span>
                      <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-0.5">{modalidad}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(evento.diaEvento).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {evento.horaEntrada}
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{evento.lugar}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {confirmados}/{asignados.length} confirmados
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvento(evento)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 ml-4 flex-shrink-0"
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

      {/* Modal confirmación */}
      {selectedEvento && !showVistaPreviaServicio && (
        <EnviosConfirmModal
          selectedEvento={selectedEvento}
          setSelectedEvento={setSelectedEvento}
          camareros={camareros}
          setShowVistaPreviaServicio={setShowVistaPreviaServicio}
          enviarConfirmacion={enviarConfirmacion}
        />
      )}

      {/* Modal vista previa con mensajes por perfil */}
      {showVistaPreviaServicio && selectedEvento && (
        <EnviosPreviewModal
          selectedEvento={selectedEvento}
          camareros={camareros}
          setShowVistaPreviaServicio={setShowVistaPreviaServicio}
          onEstadoActualizado={onEstadoActualizado}
        />
      )}
    </>
  );
}
