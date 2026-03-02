import { Send, MessageSquare, Calendar, Clock, MapPin, Users, ChevronDown, ChevronUp, X } from 'lucide-react';

interface EnviosGrupalProps {
  eventosOrdenados: any[];
  camareros: any[];
  chatMessages: any[];
  setChatMessages: (msgs: any[]) => void;
  newMessage: string;
  setNewMessage: (m: string) => void;
  selectedChatEvento: any;
  setSelectedChatEvento: (e: any) => void;
  showAsistentes: boolean;
  setShowAsistentes: (v: boolean) => void;
  enviarMensajeChatEvento: () => void;
}

export function EnviosGrupal({
  eventosOrdenados,
  camareros,
  chatMessages,
  setChatMessages,
  newMessage,
  setNewMessage,
  selectedChatEvento,
  setSelectedChatEvento,
  showAsistentes,
  setShowAsistentes,
  enviarMensajeChatEvento,
}: EnviosGrupalProps) {
  return (
    <div className="space-y-4">
      {!selectedChatEvento ? (
        <>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecciona un Evento</h3>
          <div className="space-y-3">
            {eventosOrdenados.map(evento => {
              const asignados = evento.asignaciones || [];

              return (
                <div
                  key={evento.id}
                  onClick={() => {
                    setSelectedChatEvento(evento);
                    setChatMessages([]); // Aquí cargarías los mensajes del servidor
                  }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                >
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
                          {asignados.length} participantes
                        </div>
                      </div>
                    </div>

                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-[600px]">
          {/* Header del chat */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold">{selectedChatEvento.cliente}</h3>
              <div className="text-sm opacity-90 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date(selectedChatEvento.diaEvento).toLocaleDateString('es-ES')}
                <Clock className="w-3 h-3 ml-2" />
                {selectedChatEvento.horaEntrada} - {selectedChatEvento.horaSalida}
                <MapPin className="w-3 h-3 ml-2" />
                {selectedChatEvento.lugar}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAsistentes(!showAsistentes)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 text-sm"
              >
                <Users className="w-4 h-4" />
                {(selectedChatEvento.asignaciones || []).length}
                {showAsistentes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSelectedChatEvento(null)}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista de asistentes (desplegable) */}
          {showAsistentes && (
            <div className="bg-blue-50 border-b border-blue-200 p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Participantes del Evento:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(selectedChatEvento.asignaciones || []).map((asignacion) => {
                  const camarero = camareros.find(c => c.id === asignacion.camareroId);
                  return (
                    <div key={asignacion.camareroId || asignacion.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-blue-200">
                      <div className={`w-2 h-2 rounded-full ${
                        asignacion.estado === 'confirmado' ? 'bg-green-500' :
                        asignacion.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      {camarero?.nombre || asignacion.camareroNombre}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No hay mensajes todavía. ¡Inicia la conversación!
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                  <div className="font-semibold text-sm text-blue-600">{msg.sender}</div>
                  <div className="text-gray-700">{msg.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('es-ES')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input de mensaje */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensajeChatEvento()}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={enviarMensajeChatEvento}
                disabled={!newMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
