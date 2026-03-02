import { Send, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { EnviosConfirmModal } from './EnviosConfirmModal';
import { EnviosPreviewModal } from './EnviosPreviewModal';

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
        <EnviosConfirmModal
          selectedEvento={selectedEvento}
          setSelectedEvento={setSelectedEvento}
          camareros={camareros}
          mensajeTipo={mensajeTipo}
          setMensajeTipo={setMensajeTipo}
          setShowVistaPreviaServicio={setShowVistaPreviaServicio}
          enviarConfirmacion={enviarConfirmacion}
        />
      )}

      {/* Modal de Vista Previa del Mensaje de Servicio */}
      {showVistaPreviaServicio && selectedEvento && (
        <EnviosPreviewModal
          selectedEvento={selectedEvento}
          camareros={camareros}
          mensajeTipo={mensajeTipo}
          setShowVistaPreviaServicio={setShowVistaPreviaServicio}
          enviarConfirmacion={enviarConfirmacion}
        />
      )}
    </>
  );
}
