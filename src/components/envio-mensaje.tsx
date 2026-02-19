import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Search, Phone, MoreVertical, Check, X as XIcon, Clock } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

// v2.0.0 - Interfaz tipo WhatsApp Web completa
interface EnvioMensajeProps {
  pedidos: any[];
  camareros: any[];
  coordinadores: any[];
  baseUrl: string;
  publicAnonKey: string;
  setPedidos: (pedidos: any[]) => void;
  cargarDatos: () => Promise<void>;
}

export function EnvioMensaje({ pedidos, camareros, coordinadores, baseUrl, publicAnonKey, setPedidos, cargarDatos }: EnvioMensajeProps) {
  const [periodoFiltro, setPeriodoFiltro] = useState<'diario' | 'semanal' | 'mensual'>('semanal');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null);
  const [camareroSeleccionado, setCamareroSeleccionado] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [coordinadorActual, setCoordinadorActual] = useState<any>(null);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // Deduplicar datos
  const uniquePedidos = Array.from(new Map(pedidos.map(p => [p.id, p])).values());
  const uniqueCamareros = Array.from(new Map(camareros.map(c => [c.id, c])).values());
  const uniqueCoordinadores = Array.from(new Map(coordinadores.map(c => [c.id, c])).values());

  // Inicializar coordinador
  useEffect(() => {
    if (uniqueCoordinadores.length > 0 && !coordinadorActual) {
      // Priorizar coordinador con teléfono
      const coordConTel = uniqueCoordinadores.find(c => c.telefono);
      setCoordinadorActual(coordConTel || uniqueCoordinadores[0]);
    }
  }, [uniqueCoordinadores]);

  // Filtrar eventos según período
  const eventosFiltrados = uniquePedidos.filter(pedido => {
    const fechaEvento = new Date(pedido.diaEvento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (periodoFiltro === 'diario') {
      return fechaEvento.toDateString() === hoy.toDateString();
    } else if (periodoFiltro === 'semanal') {
      const unaSemana = new Date(hoy);
      unaSemana.setDate(hoy.getDate() + 7);
      return fechaEvento >= hoy && fechaEvento <= unaSemana;
    } else {
      // mensual
      const unMes = new Date(hoy);
      unMes.setMonth(hoy.getMonth() + 1);
      return fechaEvento >= hoy && fechaEvento <= unMes;
    }
  }).sort((a, b) => new Date(a.diaEvento).getTime() - new Date(b.diaEvento).getTime());

  // Camareros del evento seleccionado
  const camarerosEvento = eventoSeleccionado 
    ? eventoSeleccionado.asignaciones?.map(asig => {
        const cam = uniqueCamareros.find(c => c.id === asig.camareroId);
        return cam ? { ...cam, estado: asig.estado } : null;
      }).filter(Boolean) || []
    : [];

  // Scroll automático
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Generar mensaje predefinido
  const generarMensaje = async (pedido: any, camarero: any) => {
    if (!pedido || !camarero || !coordinadorActual) return '';
    
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Guardar token en el servidor
    try {
      await fetch(`${baseUrl}/guardar-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          token: token,
          pedidoId: pedido.id,
          camareroId: camarero.id,
          coordinadorId: coordinadorActual.id
        })
      });
    } catch (error) {
      console.log('Error al guardar token:', error);
    }
    
    const baseUrlConfirmacion = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;
    const confirmarUrl = `${baseUrlConfirmacion}/confirmar/${token}`;
    const noConfirmarUrl = `${baseUrlConfirmacion}/no-confirmar/${token}`;

    // Formatear fecha con día y fecha completa
    const fechaEvento = new Date(pedido.diaEvento);
    const diaStr = fechaEvento.toLocaleDateString('es-ES', { weekday: 'long' });
    const fechaStr = fechaEvento.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    const esCatering = pedido.catering === 'si';

    // --- CALCULAR HORA DE ENCUENTRO VÍA GOOGLE MAPS (solo catering) ---
    let horaEncuentroStr = '';
    if (esCatering) {
      try {
        const destino = encodeURIComponent(pedido.ubicacion || pedido.lugar);
        const distRes = await fetch(`${baseUrl}/calcular-distancia?destino=${destino}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        });
        const distData = await distRes.json();

        if (distData.success) {
          // Hora de encuentro = hora de entrada - tiempo real Google Maps - 15 min margen
          const minutosAntes = distData.duracionMinutos + 15;
          const [horas, minutos] = pedido.horaEntrada.split(':').map(Number);
          const totalMinutos = horas * 60 + minutos - minutosAntes;
          const hEncuentro = Math.floor(Math.abs(totalMinutos) / 60);
          const mEncuentro = Math.abs(totalMinutos) % 60;
          horaEncuentroStr = `${String(hEncuentro).padStart(2, '0')}:${String(mEncuentro).padStart(2, '0')}`;
          console.log(`✅ Hora de encuentro calculada con Google Maps: ${horaEncuentroStr} (${distData.duracionMinutos}min de viaje)`);
        } else if (pedido.tiempoViaje) {
          // Fallback: usar tiempoViaje del pedido si Google Maps falla
          const minutosAntes = parseInt(pedido.tiempoViaje) + 15;
          const [horas, minutos] = pedido.horaEntrada.split(':').map(Number);
          const totalMinutos = horas * 60 + minutos - minutosAntes;
          const hEncuentro = Math.floor(Math.abs(totalMinutos) / 60);
          const mEncuentro = Math.abs(totalMinutos) % 60;
          horaEncuentroStr = `${String(hEncuentro).padStart(2, '0')}:${String(mEncuentro).padStart(2, '0')}`;
          console.log(`⚠️ Fallback a tiempoViaje manual: ${horaEncuentroStr}`);
        }
      } catch (err) {
        console.log('Error calculando distancia, usando fallback:', err);
        if (pedido.tiempoViaje) {
          const minutosAntes = parseInt(pedido.tiempoViaje) + 15;
          const [horas, minutos] = pedido.horaEntrada.split(':').map(Number);
          const totalMinutos = horas * 60 + minutos - minutosAntes;
          const hEncuentro = Math.floor(Math.abs(totalMinutos) / 60);
          const mEncuentro = Math.abs(totalMinutos) % 60;
          horaEncuentroStr = `${String(hEncuentro).padStart(2, '0')}:${String(mEncuentro).padStart(2, '0')}`;
        }
      }
    }

    let texto = '';

    // --- CABECERA ---
    texto += `📅 ${fechaStr} - ${diaStr.charAt(0).toUpperCase() + diaStr.slice(1)}\n`;
    texto += `👤 Cliente: ${pedido.cliente}\n`;
    texto += `📍 Lugar: ${pedido.lugar}\n`;
    texto += `🕐 Hora entrada: ${pedido.horaEntrada}\n`;

    // --- SECCIÓN CATERING ---
    if (esCatering && horaEncuentroStr) {
      texto += `\n`;
      texto += `🚌 *HORA DE ENCUENTRO: ${horaEncuentroStr}*\n`;
      texto += `📌 *PUNTO DE ENCUENTRO:* https://maps.app.goo.gl/nofiiyVsnx5XLkES8\n`;
    }

    // --- LINK DE UBICACIÓN DEL EVENTO ---
    if (pedido.ubicacion) {
      texto += `\n`;
      texto += `🗺 ${pedido.ubicacion}\n`;
    }

    // --- UNIFORME ---
    texto += `\n`;
    texto += `👔 *Uniforme:*\n`;
    texto += `Zapatos, pantalón, delantal francés largo.\n`;
    texto += `*TODO DE COLOR NEGRO*\n`;
    texto += `\n`;
    texto += `*CAMISA: ${(pedido.camisa || '').toUpperCase()}*\n`;
    texto += `\n`;
    texto += `*⏰ ESTAR 15 MINUTOS ANTES PARA ESTAR A PUNTO EN SERVICIO*\n`;

    // --- CONFIRMACIÓN ---
    texto += `\n`;
    texto += `Por favor confirma tu asistencia:\n`;
    texto += `\n`;
    texto += `✅ *CONFIRMO:* ${confirmarUrl}\n`;
    texto += `\n`;
    texto += `❌ *RECHAZO:* ${noConfirmarUrl}`;
    
    return texto;
  };

  // Enviar mensaje automáticamente al seleccionar camarero
  const enviarMensajeAutomatico = async (camarero: any) => {
    if (!eventoSeleccionado || !coordinadorActual) return;

    const mensajeTexto = await generarMensaje(eventoSeleccionado, camarero);
    
    // Crear mensaje local
    const nuevoMensajeObj = {
      id: `msg-${Date.now()}`,
      texto: mensajeTexto,
      remitente: 'coordinador',
      timestamp: new Date().toISOString(),
      estado: 'enviado'
    };
    
    setMensajes([nuevoMensajeObj]);

    // Actualizar estado a 'enviado'
    const asignaciones = eventoSeleccionado.asignaciones.map(a => 
      a.camareroId === camarero.id ? { ...a, estado: 'enviado' } : a
    );
    
    try {
      await fetch(`${baseUrl}/pedidos/${eventoSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          ...eventoSeleccionado,
          asignaciones
        })
      });
      
      await cargarDatos();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  // Manejar aceptación
  const manejarAceptar = async () => {
    if (!eventoSeleccionado || !camareroSeleccionado || !coordinadorActual) return;

    const asignaciones = eventoSeleccionado.asignaciones.map(a => 
      a.camareroId === camareroSeleccionado.id 
        ? { ...a, estado: 'confirmado', eliminacionProgramada: null } 
        : a
    );
    
    try {
      await fetch(`${baseUrl}/pedidos/${eventoSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ ...eventoSeleccionado, asignaciones })
      });
      
      setMensajes(prev => [...prev, {
        id: `msg-${Date.now()}`,
        texto: '✅ He aceptado el servicio',
        remitente: 'camarero',
        timestamp: new Date().toISOString(),
        estado: 'confirmado'
      }]);

      // Notificar al coordinador por WhatsApp
      if (coordinadorActual.telefono) {
        const fechaEvento = new Date(eventoSeleccionado.diaEvento).toLocaleDateString('es-ES', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
        const nombre = `${camareroSeleccionado.nombre} ${camareroSeleccionado.apellido}`;
        const totalConfirmados = asignaciones.filter(a => a.estado === 'confirmado').length;
        const totalAsignados = asignaciones.length;
        const mensajeCoord = `✅ CONFIRMACIÓN\n\n${nombre} ha confirmado su asistencia.\n\nEvento: ${eventoSeleccionado.cliente}\nFecha: ${fechaEvento}\nLugar: ${eventoSeleccionado.lugar}\n\n👥 Confirmados: ${totalConfirmados}/${totalAsignados}`;
        
        await fetch(`${baseUrl}/enviar-whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ telefono: coordinadorActual.telefono, mensaje: mensajeCoord })
        }).catch(() => {}); // No bloquear si WhatsApp falla
      }
      
      await cargarDatos();
    } catch (error) {
      console.error('Error al aceptar:', error);
    }
  };

  // Manejar rechazo
  const manejarRechazar = async () => {
    if (!eventoSeleccionado || !camareroSeleccionado || !coordinadorActual) return;

    // Eliminar inmediatamente de la lista de asignaciones
    const asignacionesFiltradas = eventoSeleccionado.asignaciones.filter(
      a => a.camareroId !== camareroSeleccionado.id
    );
    
    try {
      await fetch(`${baseUrl}/pedidos/${eventoSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ ...eventoSeleccionado, asignaciones: asignacionesFiltradas })
      });
      
      setMensajes(prev => [...prev, {
        id: `msg-${Date.now()}`,
        texto: '❌ He rechazado el servicio.',
        remitente: 'camarero',
        timestamp: new Date().toISOString(),
        estado: 'rechazado'
      }]);

      // Notificar al coordinador por WhatsApp
      if (coordinadorActual.telefono) {
        const fechaEvento = new Date(eventoSeleccionado.diaEvento).toLocaleDateString('es-ES', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
        const nombre = `${camareroSeleccionado.nombre} ${camareroSeleccionado.apellido}`;
        const mensajeCoord = `❌ RECHAZO DE SERVICIO\n\n${nombre} NO puede asistir.\n\nEvento: ${eventoSeleccionado.cliente}\nFecha: ${fechaEvento}\nLugar: ${eventoSeleccionado.lugar}\n\n⚠️ ACCIÓN REQUERIDA: Asignar un camarero de reemplazo.`;
        
        await fetch(`${baseUrl}/enviar-whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ telefono: coordinadorActual.telefono, mensaje: mensajeCoord })
        }).catch(() => {}); // No bloquear si WhatsApp falla
      }

      // Limpiar selección y recargar
      setCamareroSeleccionado(null);
      setMensajes([]);
      await cargarDatos();
    } catch (error) {
      console.error('Error al rechazar:', error);
    }
  };

  if (!coordinadorActual) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          ⚠️ No hay coordinadores registrados. Registra al menos un coordinador para enviar mensajes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-300">
      {/* COLUMNA 1 - LISTA DE EVENTOS */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        {/* Header con perfil del coordinador */}
        <div className="px-4 py-3 bg-gray-100 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {coordinadorActual.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{coordinadorActual.nombre}</p>
              <p className="text-xs text-gray-600">Coordinador</p>
            </div>
          </div>
          <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>

        {/* Buscador */}
        <div className="px-3 py-2 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filtros de período */}
        <div className="px-3 py-2 bg-white border-b border-gray-200">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['diario', 'semanal', 'mensual'].map((periodo) => (
              <button
                key={periodo}
                onClick={() => setPeriodoFiltro(periodo as any)}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  periodoFiltro === periodo
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="flex-1 overflow-y-auto">
          {eventosFiltrados.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay eventos en este período</p>
            </div>
          ) : (
            eventosFiltrados.map(evento => {
              const totalCamareros = evento.asignaciones?.length || 0;
              const confirmados = evento.asignaciones?.filter(a => a.estado === 'confirmado').length || 0;
              const esSeleccionado = eventoSeleccionado?.id === evento.id;
              
              return (
                <button
                  key={evento.id}
                  onClick={() => {
                    setEventoSeleccionado(evento);
                    setCamareroSeleccionado(null);
                    setMensajes([]);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    esSeleccionado ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {evento.cliente.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{evento.cliente}</h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(evento.diaEvento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-1">{evento.lugar}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{evento.horaEntrada}</span>
                        <span className={`text-xs font-medium ${
                          confirmados === totalCamareros ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {confirmados}/{totalCamareros} ✓
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

      {/* COLUMNA 2 - LISTA DE CAMAREROS DEL EVENTO */}
      {eventoSeleccionado ? (
        <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
          {/* Header del evento */}
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                {eventoSeleccionado.cliente.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 text-sm truncate">{eventoSeleccionado.cliente}</h2>
                <p className="text-xs text-gray-600 truncate">{eventoSeleccionado.lugar}</p>
              </div>
            </div>
          </div>

          {/* Lista de camareros */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {camarerosEvento.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <p>No hay camareros asignados a este evento</p>
              </div>
            ) : (
              camarerosEvento.map((camarero: any) => {
                const esSeleccionado = camareroSeleccionado?.id === camarero.id;
                let bgColor = 'bg-white';
                let borderColor = 'border-gray-200';
                
                if (camarero.estado === 'confirmado') {
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-300';
                } else if (camarero.estado === 'rechazado') {
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-300';
                } else if (camarero.estado === 'enviado') {
                  bgColor = 'bg-blue-50';
                  borderColor = 'border-blue-200';
                }

                return (
                  <button
                    key={`${eventoSeleccionado.id}-${camarero.id}`}
                    onClick={() => {
                      setCamareroSeleccionado(camarero);
                      enviarMensajeAutomatico(camarero);
                    }}
                    className={`w-full text-left px-4 py-3 border-b ${borderColor} ${bgColor} hover:opacity-80 transition-all ${
                      esSeleccionado ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {camarero.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {camarero.nombre} {camarero.apellido}
                          </h3>
                          {camarero.estado === 'confirmado' && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                          {camarero.estado === 'rechazado' && (
                            <XIcon className="w-4 h-4 text-red-600" />
                          )}
                          {camarero.estado === 'enviado' && (
                            <Clock className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">#{camarero.numero}</p>
                        {camarero.telefono && (
                          <p className="text-xs text-gray-500 mt-1">📱 {camarero.telefono}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="w-80 bg-white border-r border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500 p-6">
            <MessageCircle className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Selecciona un evento</p>
          </div>
        </div>
      )}

      {/* COLUMNA 3 - CHAT / CONVERSACIÓN */}
      {camareroSeleccionado ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header del chat */}
          <div className="px-6 py-3 bg-gray-100 border-b border-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                {camareroSeleccionado.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">
                  {camareroSeleccionado.nombre} {camareroSeleccionado.apellido}
                </h2>
                <p className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  camareroSeleccionado.estado === 'confirmado' ? 'bg-green-100 text-green-700' :
                  camareroSeleccionado.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                  camareroSeleccionado.estado === 'enviado' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {camareroSeleccionado.estado === 'confirmado' && '✅ Confirmado'}
                  {camareroSeleccionado.estado === 'rechazado' && '❌ Rechazado'}
                  {camareroSeleccionado.estado === 'enviado' && '📤 Enviado — esperando respuesta'}
                  {!camareroSeleccionado.estado && '⏳ Pendiente'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600" />
              <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
            </div>
          </div>

          {/* Área de mensajes */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-3"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #f9fafb 0px, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)'
            }}
          >
            {mensajes.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.remitente === 'coordinador' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                    msg.remitente === 'coordinador'
                      ? 'bg-green-100 text-gray-900'
                      : msg.estado === 'confirmado'
                      ? 'bg-green-200 text-gray-900 font-semibold'
                      : msg.estado === 'rechazado'
                      ? 'bg-red-200 text-gray-900 font-semibold'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.texto}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-600">
                      {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.remitente === 'coordinador' && (
                      <Check className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={mensajesEndRef} />
          </div>

          {/* Botones interactivos de respuesta rápida */}
          {mensajes.length > 0 && camareroSeleccionado.estado !== 'confirmado' && camareroSeleccionado.estado !== 'rechazado' && (
            <div className="px-6 py-3 bg-white border-t border-gray-300">
              <div className="flex gap-3">
                <button
                  onClick={manejarAceptar}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Check className="w-5 h-5" />
                  ACEPTAR SERVICIO
                </button>
                <button
                  onClick={manejarRechazar}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <XIcon className="w-5 h-5" />
                  RECHAZAR SERVICIO
                </button>
              </div>
            </div>
          )}

          {/* Input de mensaje (opcional para mensajes personalizados) */}
          <div className="px-4 py-3 bg-gray-100 border-t border-gray-300">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={true}
              />
              <button
                disabled={true}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500 p-8">
            <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {eventoSeleccionado ? 'Selecciona un camarero' : 'Bienvenido a Mensajes'}
            </h3>
            <p className="text-sm">
              {eventoSeleccionado 
                ? 'Haz clic en un camarero para enviar el mensaje del servicio'
                : 'Selecciona un evento y luego un camarero para comenzar'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}