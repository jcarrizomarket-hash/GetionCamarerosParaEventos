import { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Users, ChevronDown, MessageCircle, Check, CheckCheck } from 'lucide-react';

interface ChatGrupalProps {
  pedidos: any[];
  camareros: any[];
  coordinadores: any[];
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => Promise<void>;
}

interface Mensaje {
  id: string;
  chatId: string;
  remitenteId: string;
  remitenteNombre: string;
  remitenteTipo: 'coordinador' | 'camarero';
  texto: string;
  timestamp: string;
}

export function ChatGrupal({ pedidos, camareros, coordinadores, baseUrl, publicAnonKey, cargarDatos }: ChatGrupalProps) {
  const [chatsDisponibles, setChatsDisponibles] = useState<any[]>([]);
  const [chatSeleccionado, setChatSeleccionado] = useState<any>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mostrarParticipantes, setMostrarParticipantes] = useState(false);
  const [coordinadorActual, setCoordinadorActual] = useState<any>(null);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // Deduplicar datos con useMemo para evitar recrear arrays en cada render
  const uniquePedidos = useMemo(() => 
    Array.from(new Map(pedidos.map(p => [p.id, p])).values()),
    [pedidos]
  );
  
  const uniqueCamareros = useMemo(() => 
    Array.from(new Map(camareros.map(c => [c.id, c])).values()),
    [camareros]
  );
  
  const uniqueCoordinadores = useMemo(() => 
    Array.from(new Map(coordinadores.map(c => [c.id, c])).values()),
    [coordinadores]
  );

  // Inicializar coordinador actual
  useEffect(() => {
    if (uniqueCoordinadores.length > 0 && !coordinadorActual) {
      setCoordinadorActual(uniqueCoordinadores[0]);
    }
  }, [uniqueCoordinadores, coordinadorActual]);

  // Filtrar eventos donde todos los camareros están confirmados
  useEffect(() => {
    const chatsCreados = uniquePedidos.filter(pedido => {
      const asignaciones = pedido.asignaciones || [];
      if (asignaciones.length === 0) return false;
      const todosConfirmados = asignaciones.every(a => a.estado === 'confirmado');
      return todosConfirmados;
    }).sort((a, b) => new Date(a.diaEvento).getTime() - new Date(b.diaEvento).getTime());

    setChatsDisponibles(chatsCreados);
  }, [uniquePedidos]);

  // Polling para detectar nuevos chats automáticamente (cada 15 segundos)
  useEffect(() => {
    const polling = setInterval(() => {
      cargarDatos();
    }, 15000);
    return () => clearInterval(polling);
  }, [cargarDatos]);

  // Cargar mensajes del chat seleccionado
  useEffect(() => {
    if (!chatSeleccionado) return;

    const cargarMensajes = async () => {
      try {
        // FIX: El servidor crea chats con ID "chat:{pedidoId}", usar ese prefijo
        const chatId = chatSeleccionado.id.startsWith('chat:') 
          ? chatSeleccionado.id 
          : `chat:${chatSeleccionado.id}`;
        const response = await fetch(`${baseUrl}/chat-mensajes/${encodeURIComponent(chatId)}`, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMensajes(data.mensajes || []);
        }
      } catch (error) {
        console.error('Error al cargar mensajes del chat:', error);
      }
    };

    cargarMensajes();
    
    // Polling cada 3 segundos para actualizar mensajes
    const intervalo = setInterval(cargarMensajes, 3000);
    return () => clearInterval(intervalo);
  }, [chatSeleccionado, baseUrl, publicAnonKey]);

  // Scroll automático al final
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatSeleccionado || !coordinadorActual) return;

    // FIX: Usar el chatId correcto con prefijo "chat:"
    const chatId = chatSeleccionado.id.startsWith('chat:') 
      ? chatSeleccionado.id 
      : `chat:${chatSeleccionado.id}`;
    const mensaje: Mensaje = {
      id: `msg-${Date.now()}-${Math.random()}`,
      chatId: chatId,
      remitenteId: coordinadorActual.id,
      remitenteNombre: coordinadorActual.nombre,
      remitenteTipo: 'coordinador',
      texto: nuevoMensaje.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${baseUrl}/chat-mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(mensaje)
      });

      if (response.ok) {
        setMensajes(prev => [...prev, mensaje]);
        setNuevoMensaje('');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  // Obtener participantes del chat
  const obtenerParticipantes = () => {
    if (!chatSeleccionado) return [];

    const asignaciones = chatSeleccionado.asignaciones || [];
    const participantes = asignaciones
      .map((asig, index) => {
        const cam = uniqueCamareros.find(c => c.id === asig.camareroId);
        return cam ? {
          id: cam.id,
          nombre: `${cam.nombre} ${cam.apellido}`,
          numero: cam.numero,
          tipo: 'camarero'
        } : null;
      })
      .filter((p): p is { id: string; nombre: string; numero: string; tipo: string } => p !== null);

    return participantes;
  };

  const participantes = obtenerParticipantes();

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* COLUMNA IZQUIERDA - LISTA DE CHATS */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Chats Grupales
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            {chatsDisponibles.length} {chatsDisponibles.length === 1 ? 'chat activo' : 'chats activos'}
          </p>
        </div>

        {/* Lista de chats */}
        <div className="flex-1 overflow-y-auto">
          {chatsDisponibles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-semibold text-gray-700 mb-2">No hay chats disponibles</h3>
              <p className="text-sm">
                Los chats se crean automáticamente cuando todos los camareros de un evento confirman su asistencia.
              </p>
            </div>
          ) : (
            chatsDisponibles.map((chat) => {
              const esSeleccionado = chatSeleccionado?.id === chat.id;
              const cantidadParticipantes = chat.asignaciones?.length || 0;
              
              return (
                <button
                  key={chat.id}
                  onClick={() => setChatSeleccionado(chat)}
                  className={`w-full text-left px-6 py-4 border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    esSeleccionado ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div key={`avatar-${chat.id}`} className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                      {chat.cliente.charAt(0).toUpperCase()}
                    </div>
                    <div key={`info-${chat.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 text-base truncate">{chat.cliente}</h3>
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full ml-2">
                          <CheckCheck className="w-3 h-3" />
                          Todos confirmados
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">📍 {chat.lugar}</p>
                      <div className="flex items-center justify-between">
                        <p key={`fecha-${chat.id}`} className="text-xs text-gray-500">
                          📅 {new Date(chat.diaEvento).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })} • 🕐 {chat.horaEntrada}
                        </p>
                        <span key={`participantes-${chat.id}`} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Users className="w-3 h-3" />
                          {cantidadParticipantes}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA - CONVERSACIÓN */}
      {chatSeleccionado ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header del chat */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              {/* Información del evento */}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-gray-900 truncate">{chatSeleccionado.cliente}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <span key="lugar-info" className="flex items-center gap-1">
                    📍 {chatSeleccionado.lugar}
                  </span>
                  <span key="separator-1" className="text-gray-400">•</span>
                  <span key="fecha-info" className="flex items-center gap-1">
                    📅 {new Date(chatSeleccionado.diaEvento).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span key="separator-2" className="text-gray-400">•</span>
                  <span key="hora-info" className="flex items-center gap-1">
                    🕐 {chatSeleccionado.horaEntrada}
                  </span>
                </div>
              </div>

              {/* Botón de participantes */}
              <div className="relative">
                <button
                  onClick={() => setMostrarParticipantes(!mostrarParticipantes)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{participantes.length}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mostrarParticipantes ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown de participantes */}
                {mostrarParticipantes && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Participantes del Evento
                      </h3>
                    </div>
                    <div className="py-2">
                      {/* Coordinadores */}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Coordinadores</p>
                        {uniqueCoordinadores.map(coord => (
                          <div key={coord.id} className="flex items-center gap-3 py-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                              {coord.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{coord.nombre}</p>
                              <p className="text-xs text-gray-500">Coordinador</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Camareros */}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Camareros</p>
                        {participantes.map((participante: any) => (
                          <div key={participante.id} className="flex items-center gap-3 py-2">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                              {participante.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{participante.nombre}</p>
                              <p className="text-xs text-gray-500">#{participante.numero}</p>
                            </div>
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Área de mensajes */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #f9fafb 0px, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)'
            }}
          >
            {mensajes.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">
                    Este es el comienzo de la conversación grupal
                  </p>
                  <p className="text-xs mt-2">
                    Todos los participantes pueden ver y escribir mensajes aquí
                  </p>
                </div>
              </div>
            ) : (
              mensajes.map((msg) => {
                const esCoordinador = msg.remitenteTipo === 'coordinador';
                const esPropio = coordinadorActual && msg.remitenteId === coordinadorActual.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-3 shadow-md ${
                        esPropio
                          ? 'bg-blue-600 text-white'
                          : esCoordinador
                          ? 'bg-white text-gray-900 border border-gray-200'
                          : 'bg-green-100 text-gray-900 border border-green-200'
                      }`}
                    >
                      {/* Nombre del remitente */}
                      {!esPropio && (
                        <p className={`text-xs font-bold mb-1 ${
                          esCoordinador ? 'text-blue-600' : 'text-green-700'
                        }`}>
                          {msg.remitenteNombre}
                        </p>
                      )}
                      
                      {/* Texto del mensaje */}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.texto}</p>
                      
                      {/* Timestamp */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-xs ${esPropio ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {esPropio && (
                          <CheckCheck className="w-3 h-3 text-blue-100" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* Input de mensaje */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                enviarMensaje();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje al grupo..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!nuevoMensaje.trim()}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500 p-8">
            <MessageCircle className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Selecciona un chat grupal
            </h3>
            <p className="text-sm max-w-md">
              Los chats grupales se crean automáticamente cuando todos los camareros de un evento confirman su asistencia.
              Selecciona un chat de la lista para comenzar a conversar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}