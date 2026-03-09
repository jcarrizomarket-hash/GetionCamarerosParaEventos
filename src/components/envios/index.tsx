import { useState, useMemo } from 'react';
import { supabase } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';
import { Send, MessageSquare, Users, Bot, FileCheck } from 'lucide-react';
import type { EnviosProps } from './types';
import { EnviosList } from './EnviosList';
import { EnviosPartes } from './EnviosPartes';
import { EnviosGrupal } from './EnviosGrupal';
import { EnviosCoordinadores } from './EnviosCoordinadores';
import { EnviosChatbot } from './EnviosChatbot';
import { useToast } from '../../hooks/useToast';

export function Envios({ pedidos, camareros, coordinadores, clientes, baseUrl, publicAnonKey }: EnviosProps) {
  const [activeTab, setActiveTab] = useState<'servicios' | 'grupal' | 'coordinadores' | 'chatbot' | 'partes'>('servicios');
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const [mensajeTipo, setMensajeTipo] = useState<'catering' | 'restauracion'>('restauracion');
  const [showAsistentes, setShowAsistentes] = useState(false);
  const toast = useToast();

  // Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatEvento, setSelectedChatEvento] = useState<any>(null);

  // Chatbot states
  const [chatbotMessages, setChatbotMessages] = useState<any[]>([
    { id: 'initial-1', role: 'assistant', content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Partes de Servicios states
  const [estadosPartes, setEstadosPartes] = useState<{[key: string]: 'pendiente' | 'enviado'}>({});

  // Vista previa de mensaje de servicio
  const [showVistaPreviaServicio, setShowVistaPreviaServicio] = useState(false);

  const tabs = [
    { id: 'servicios' as const, label: 'Envíos Servicios', icon: Send },
    { id: 'partes' as const, label: 'Partes de Servicios', icon: FileCheck },
    { id: 'grupal' as const, label: 'Chat Grupal del Evento', icon: MessageSquare },
    { id: 'coordinadores' as const, label: 'Chat de Coordinadores', icon: Users },
    { id: 'chatbot' as const, label: 'Chat con Cliente (IA)', icon: Bot }
  ];

  // Ordenar eventos por fecha próxima (descendente)
  const eventosOrdenados = useMemo(() => {
    return [...pedidos].sort((a, b) => {
      const fechaA = new Date(a.diaEvento);
      const fechaB = new Date(b.diaEvento);
      return fechaA.getTime() - fechaB.getTime();
    });
  }, [pedidos]);

  // Función para enviar mensaje de confirmación
  const enviarConfirmacion = async () => {
    if (!selectedEvento) return;

    const asignados = selectedEvento.asignaciones || [];
    if (asignados.length === 0) {
      toast.warning('No hay camareros asignados a este evento');
      return;
    }

    const mensajeBase = mensajeTipo === 'catering'
      ? '🍽️ *Confirmación de Servicio - CATERING*'
      : '🍴 *Confirmación de Servicio - RESTAURACIÓN*';

    const mensaje = `${mensajeBase}

📅 *Fecha:* ${new Date(selectedEvento.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 *Horario:* ${selectedEvento.horaEntrada} - ${selectedEvento.horaSalida}
📍 *Lugar:* ${selectedEvento.lugar}
👔 *Dress Code:* Camisa ${selectedEvento.camisa}
${selectedEvento.catering === 'si' ? '✅ Incluye catering' : ''}

${selectedEvento.notas ? `📝 *Notas:* ${selectedEvento.notas}` : ''}

Por favor confirma tu asistencia respondiendo este mensaje.`;

    try {
      const url = `${baseUrl}/enviar-mensaje-grupal`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || publicAnonKey}`
        },
        body: JSON.stringify({
          pedidoId: selectedEvento.id,
          mensaje
        })
      });

      if (!response.ok) {
        logger.error(`Error HTTP ${response.status}`, { url, method: 'POST' });
        toast.error(`Error al enviar: HTTP ${response.status}`);
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast.success(`Mensaje enviado a ${asignados.length} camarero(s)`);
        setSelectedEvento(null);
      } else {
        toast.error(`Error al enviar: ${result.error}`);
      }
    } catch (error) {
      logger.error('Error al enviar:', error);
      toast.error('Error al enviar el mensaje');
    }
  };

  // Función para enviar mensaje al chat grupal del evento
  const enviarMensajeChatEvento = async () => {
    if (!newMessage.trim() || !selectedChatEvento) return;

    const nuevoMensaje = {
      id: Date.now().toString(),
      sender: 'Coordinador',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages([...chatMessages, nuevoMensaje]);
    setNewMessage('');

    // Guardar el mensaje en el servidor
    try {
      await fetch(`${baseUrl}/chat-mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || publicAnonKey}`
        },
        body: JSON.stringify({
          chatId: `chat:${selectedChatEvento.id}`,
          id: nuevoMensaje.id,
          sender: nuevoMensaje.sender,
          content: nuevoMensaje.content,
          timestamp: nuevoMensaje.timestamp
        })
      });
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
    }
  };

  // Función para el chatbot con IA
  const enviarMensajeChatbot = async () => {
    if (!chatbotInput.trim() || isProcessing) return;

    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: chatbotInput };
    setChatbotMessages([...chatbotMessages, userMessage]);
    setChatbotInput('');
    setIsProcessing(true);

    // Respuesta de fallback por ahora (hasta implementar IA real)
    setTimeout(() => {
      const fallbackMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Gracias por tu mensaje. Esta función está en desarrollo. Por favor, contacta directamente con tu coordinador o administración para consultas específicas.'
      };
      setChatbotMessages(prev => [...prev, fallbackMessage]);
      setIsProcessing(false);
    }, 500);

    /* Código para cuando se implemente IA real:
    try {
      const response = await fetch(`${baseUrl}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || publicAnonKey}`
        },
        body: JSON.stringify({
          messages: [...chatbotMessages, userMessage],
          context: {
            pedidos: pedidos.length,
            camareros: camareros.length
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const result = await response.json();

      if (result.success) {
        const assistantMessage = { id: `assistant-${Date.now()}`, role: 'assistant', content: result.message };
        setChatbotMessages(prev => [...prev, assistantMessage]);
      } else {
        const fallbackMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'Lo siento, estoy teniendo problemas para procesar tu solicitud. ¿Puedes intentar reformular tu pregunta?'
        };
        setChatbotMessages(prev => [...prev, fallbackMessage]);
      }
      setIsProcessing(false);
    } catch (error) {
      console.error('Error en chatbot:', error);
      const errorMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Disculpa, hay un problema de conexión. Por favor, intenta de nuevo más tarde.'
      };
      setChatbotMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    }
    */
  };

  // Función para enviar parte de servicio
  const enviarParteServicio = async (evento: any) => {
    const cliente = clientes.find(c => c.nombre === evento.cliente);
    if (!cliente) {
      toast.warning('Cliente no encontrado');
      return;
    }

    const coordinador = coordinadores.find(c => c.id === evento.coordinadorId);
    const asignados = evento.asignaciones || [];

    // Construir el mensaje del parte
    const mensaje = `📋 *PARTE DE SERVICIO - ${evento.numero}*

━━━━━━━━━━━━━━━━━━━━━━━
🏢 *DATOS DEL CLIENTE*
━━━━━━━━━━━━━━━━━━━━━━━
Cliente: ${cliente.nombre}
${cliente.contacto ? `Contacto: ${cliente.contacto}` : ''}
${cliente.telefono ? `Teléfono: ${cliente.telefono}` : ''}
${cliente.email ? `Email: ${cliente.email}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━
📅 *DATOS DEL EVENTO*
━━━━━━━━━━━━━━━━━━━━━━━
Fecha: ${new Date(evento.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Horario: ${evento.horaEntrada} - ${evento.horaSalida}
Lugar: ${evento.lugar}
${evento.ubicacion ? `📍 Ubicación: ${evento.ubicacion}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━
👔 *DETALLES DEL SERVICIO*
━━━━━━━━━━━━━━━━━━━━━━━
Tipo: ${evento.catering === 'si' ? 'Catering' : 'Restauración'}
Dress Code: Camisa ${evento.camisa}
${evento.notas ? `\n📝 Notas: ${evento.notas}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━
👥 *PERSONAL ASIGNADO (${asignados.length})*
━━━━━━━━━━━━━━━━━━━━━━━
${asignados.map((a, idx) => {
  const cam = camareros.find(c => c.id === a.camareroId);
  const estado = a.estado === 'confirmado' ? '✅' : a.estado === 'pendiente' ? '⏳' : '❌';
  return `${idx + 1}. ${cam?.nombre || a.camareroNombre} - Turno ${a.turno} ${estado}`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━
👤 *COORDINADOR*
━━━━━━━━━━━━━━━━━━━━━━━
${coordinador?.nombre || 'Sin asignar'}
${coordinador?.telefono ? `Tel: ${coordinador.telefono}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━
Generado: ${new Date().toLocaleString('es-ES')}`;

    try {
      const url = `${baseUrl}/enviar-parte`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || publicAnonKey}`
        },
        body: JSON.stringify({
          eventoId: evento.id,
          clienteEmail: cliente.email,
          clienteTelefono: cliente.telefono,
          mensaje
        })
      });

      if (!response.ok) {
        logger.error(`Error HTTP ${response.status}`, { url, method: 'POST' });
        toast.error(`Error al enviar: HTTP ${response.status}`);
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Parte de servicio enviado correctamente');
        setEstadosPartes(prev => ({ ...prev, [evento.id]: 'enviado' }));
        setSelectedEvento(null);
      } else {
        toast.error(`Error al enviar: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al enviar parte:', error);
      toast.error('Error al enviar el parte de servicio');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Send className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Envíos y Comunicación</h2>
          <p className="text-gray-600">Gestiona todos los canales de comunicación desde un solo lugar</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'servicios' && (
            <EnviosList
              eventosOrdenados={eventosOrdenados}
              camareros={camareros}
              selectedEvento={selectedEvento}
              setSelectedEvento={setSelectedEvento}
              showVistaPreviaServicio={showVistaPreviaServicio}
              setShowVistaPreviaServicio={setShowVistaPreviaServicio}
              enviarConfirmacion={enviarConfirmacion}
              onEstadoActualizado={(pedidoActualizado) => {
                // Actualiza el evento seleccionado con el nuevo estado
                setSelectedEvento(pedidoActualizado);
              }}
            />
          )}

          {activeTab === 'partes' && (
            <EnviosPartes
              eventosOrdenados={eventosOrdenados}
              camareros={camareros}
              coordinadores={coordinadores}
              clientes={clientes}
              selectedEvento={selectedEvento}
              setSelectedEvento={setSelectedEvento}
              estadosPartes={estadosPartes}
              enviarParteServicio={enviarParteServicio}
            />
          )}

          {activeTab === 'grupal' && (
            <EnviosGrupal
              eventosOrdenados={eventosOrdenados}
              camareros={camareros}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              selectedChatEvento={selectedChatEvento}
              setSelectedChatEvento={setSelectedChatEvento}
              showAsistentes={showAsistentes}
              setShowAsistentes={setShowAsistentes}
              enviarMensajeChatEvento={enviarMensajeChatEvento}
            />
          )}

          {activeTab === 'coordinadores' && (
            <EnviosCoordinadores coordinadores={coordinadores} />
          )}

          {activeTab === 'chatbot' && (
            <EnviosChatbot
              chatbotMessages={chatbotMessages}
              chatbotInput={chatbotInput}
              setChatbotInput={setChatbotInput}
              isProcessing={isProcessing}
              enviarMensajeChatbot={enviarMensajeChatbot}
            />
          )}
        </div>
      </div>
    </div>
  );
}
