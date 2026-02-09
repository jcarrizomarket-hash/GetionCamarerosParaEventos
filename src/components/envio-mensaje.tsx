import { useState, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { WhatsAppConfigStatus } from './whatsapp-config-status';

export function EnvioMensaje({ pedidos, camareros, coordinadores, baseUrl, publicAnonKey, setPedidos, cargarDatos }) {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');
  const [camareroSeleccionado, setCamareroSeleccionado] = useState('');
  const [coordinadorSeleccionado, setCoordinadorSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enlaceConfirmar, setEnlaceConfirmar] = useState('');
  const [enlaceNoConfirmar, setEnlaceNoConfirmar] = useState('');
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);

  // Deduplicar datos
  const uniquePedidos = Array.from(new Map(pedidos.map(p => [p.id, p])).values());
  const uniqueCamareros = Array.from(new Map(camareros.map(c => [c.id, c])).values());
  const uniqueCoordinadores = Array.from(new Map(coordinadores.map(c => [c.id, c])).values());

  // Verificar configuración de WhatsApp al cargar
  useEffect(() => {
    const verificarConfiguracion = async () => {
      try {
        const response = await fetch(`${baseUrl}/verificar-whatsapp-config`, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        });
        const result = await response.json();
        setWhatsappConfigured(result.configured);
      } catch (error) {
        console.log('Error al verificar configuración WhatsApp:', error);
        setWhatsappConfigured(false);
      } finally {
        setCheckingConfig(false);
      }
    };
    
    verificarConfiguracion();
  }, [baseUrl, publicAnonKey]);

  const generarToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  const generarMensaje = async () => {
    if (!pedidoSeleccionado || !camareroSeleccionado || !coordinadorSeleccionado) return '';
    
    const pedido = uniquePedidos.find(p => p.id === pedidoSeleccionado);
    const camarero = uniqueCamareros.find(c => c.id === camareroSeleccionado);
    
    if (!pedido || !camarero) return '';
    
    // Generar token único para confirmación
    const token = generarToken();
    
    // Guardar token en el servidor usando kv.set directamente
    try {
      const response = await fetch(`${baseUrl}/guardar-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          token: token,
          pedidoId: pedido.id,
          camareroId: camarero.id,
          coordinadorId: coordinadorSeleccionado
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        console.log('Error al guardar token:', result.error);
      }
    } catch (error) {
      console.log('Error al guardar token:', error);
    }
    
    // Enlaces de confirmación
    const baseUrlConfirmacion = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;
    const confirmarUrl = `${baseUrlConfirmacion}/confirmar/${token}`;
    const noConfirmarUrl = `${baseUrlConfirmacion}/no-confirmar/${token}`;
    
    setEnlaceConfirmar(confirmarUrl);
    setEnlaceNoConfirmar(noConfirmarUrl);
    
    // Formato del mensaje según especificaciones
    let texto = '';
    
    // Encabezado con puntos (1.4 ; 1.1 ; 1.2 ; 1.5)
    texto += `${new Date(pedido.diaEvento).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n`;
    texto += `${pedido.cliente}\n`;
    texto += `${pedido.lugar}\n`;
    texto += `Hora de inicio: ${pedido.horaEntrada}\n\n`;
    
    // Link de ubicación
    if (pedido.ubicacion) {
      texto += `${pedido.ubicacion}\n\n`;
    }
    
    // Si hay catering, agregar información de encuentro
    if (pedido.catering === 'si' && pedido.tiempoViaje) {
      const tiempoViaje = parseInt(pedido.tiempoViaje) || 0;
      const minutosAntes = tiempoViaje + 10; // tiempo de viaje + 10 minutos
      
      // Calcular hora de encuentro
      const [horas, minutos] = pedido.horaEntrada.split(':').map(Number);
      const totalMinutos = horas * 60 + minutos - minutosAntes;
      const horaEncuentro = Math.floor(totalMinutos / 60);
      const minutosEncuentro = totalMinutos % 60;
      const horaEncuentroStr = `${String(horaEncuentro).padStart(2, '0')}:${String(minutosEncuentro).padStart(2, '0')}`;
      
      texto += `Hora de encuentro: ${horaEncuentroStr}\n`;
      texto += `Punto de encuentro detrás de la estación de autobus del Fabra i Puig.\n`;
      texto += `https://maps.app.goo.gl/1VswxFT1AdT3J3d78\n\n`;
    }
    
    // Uniforme
    texto += `Uniforme:\n`;
    texto += `ZAPATOS, PANTAÓN Y DELANTAL. DE COLOR NEGRO\n\n`;
    
    // Camisa
    texto += `CAMISA ${pedido.camisa.toUpperCase()}\n\n`;
    
    texto += `UNIFORME IMPOLUTO\n\n`;
    
    texto += `Estar con 15 minutos antes de anticipación\n\n`;
    
    // Agregar botones de confirmación al mensaje
    texto += `Por favor, confirma tu asistencia:\n\n`;
    texto += `✅ CONFIRMO: ${confirmarUrl}\n\n`;
    texto += `❌ NO CONFIRMO: ${noConfirmarUrl}\n\n`;
    
    texto += `Gracias`;
    
    return texto;
  };

  const handleGenerarMensaje = async () => {
    const mensajeGenerado = await generarMensaje();
    setMensaje(mensajeGenerado);
  };

  const enviarMensajeAutomatico = async () => {
    if (!coordinadorSeleccionado || !camareroSeleccionado || !mensaje) {
      alert('Por favor genera el mensaje primero');
      return;
    }
    
    const coordinador = uniqueCoordinadores.find(c => c.id === coordinadorSeleccionado);
    if (!coordinador || !coordinador.telefono) {
      alert('El coordinador seleccionado no tiene teléfono configurado');
      return;
    }
    
    const camarero = uniqueCamareros.find(c => c.id === camareroSeleccionado);
    if (!camarero || !camarero.telefono) {
      alert('El camarero seleccionado no tiene teléfono configurado');
      return;
    }
    
    // Actualizar estado del camarero a "enviado" antes de enviar el mensaje
    const pedido = uniquePedidos.find(p => p.id === pedidoSeleccionado);
    if (pedido) {
      const asignaciones = pedido.asignaciones.map(a => 
        a.camareroId === camareroSeleccionado ? { ...a, estado: 'enviado' } : a
      );
      
      const updatedPedido = {
        ...pedido,
        asignaciones
      };
      
      try {
        const response = await fetch(`${baseUrl}/pedidos/${pedido.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(updatedPedido)
        });
        
        const result = await response.json();
        if (result.success) {
          // Enviar mensaje automáticamente vía servidor
          const envioResponse = await fetch(`${baseUrl}/enviar-whatsapp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              telefono: camarero.telefono,
              mensaje: mensaje
            })
          });
          
          const envioResult = await envioResponse.json();
          
          if (envioResult.success) {
            alert('✅ Mensaje enviado exitosamente por WhatsApp');
            await cargarDatos();
            // Limpiar formulario
            setPedidoSeleccionado('');
            setCamareroSeleccionado('');
            setMensaje('');
          } else {
            console.error('Error al enviar WhatsApp:', envioResult);
            
            // Mostrar error específico según el tipo
            if (envioResult.needsConfiguration) {
              let mensajeError = `⚠️ ERROR DE CONFIGURACIÓN DE WHATSAPP:\n\n${envioResult.error}\n\n`;
              
              // Agregar información de debug si existe
              if (envioResult.debugInfo) {
                mensajeError += `📊 INFORMACIÓN DE DEBUG:\n`;
                mensajeError += `- Fuente de configuración: ${envioResult.debugInfo.configSource}\n`;
                mensajeError += `- Longitud del token: ${envioResult.debugInfo.tokenLength} caracteres\n`;
                if (envioResult.debugInfo.tokenPrefix) {
                  mensajeError += `- Inicio del token: ${envioResult.debugInfo.tokenPrefix}\n`;
                }
                if (envioResult.debugInfo.phoneId) {
                  mensajeError += `- Phone ID: ${envioResult.debugInfo.phoneId}\n`;
                }
                mensajeError += `\n`;
              }
              
              mensajeError += `🔧 SOLUCIÓN:\n`;
              mensajeError += `1. Ve a la pestaña "Configuración WhatsApp" en el menú principal\n`;
              mensajeError += `2. Haz clic en "¿Cómo obtener el token?" para ver instrucciones\n`;
              mensajeError += `3. Ve a: https://business.facebook.com/wa/manage/home/\n`;
              mensajeError += `4. Genera un Token de Acceso PERMANENTE (debe tener 200+ caracteres)\n`;
              mensajeError += `5. Copia COMPLETAMENTE el token (sin espacios al inicio o final)\n`;
              mensajeError += `6. Obtén también tu Phone Number ID\n`;
              mensajeError += `7. Pégalos en "Configuración WhatsApp" y guarda\n\n`;
              mensajeError += `Por ahora, se abrirá WhatsApp Web para enviar manualmente.`;
              
              alert(mensajeError);
            } else {
              alert(`⚠️ No se pudo enviar automáticamente: ${envioResult.error}\n\nSe abrirá WhatsApp Web para enviar manualmente.`);
            }
            
            enviarPorWhatsApp();
          }
        } else {
          console.error('Error al actualizar pedido:', result);
          alert('Error al actualizar el estado del pedido. Intenta nuevamente.');
        }
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        alert('Error de conexión al enviar el mensaje. Verifica tu conexión e intenta nuevamente.');
      }
    }
  };

  const enviarPorWhatsApp = async () => {
    if (!coordinadorSeleccionado) {
      alert('Por favor selecciona un coordinador con teléfono configurado');
      return;
    }
    
    const coordinador = uniqueCoordinadores.find(c => c.id === coordinadorSeleccionado);
    if (!coordinador || !coordinador.telefono) {
      alert('El coordinador seleccionado no tiene teléfono configurado');
      return;
    }
    
    const camarero = uniqueCamareros.find(c => c.id === camareroSeleccionado);
    if (!camarero || !camarero.telefono) {
      alert('El camarero seleccionado no tiene teléfono configurado');
      return;
    }
    
    // Actualizar estado del camarero a "enviado" antes de enviar el mensaje
    const pedido = uniquePedidos.find(p => p.id === pedidoSeleccionado);
    if (pedido) {
      const asignaciones = pedido.asignaciones.map(a => 
        a.camareroId === camareroSeleccionado ? { ...a, estado: 'enviado' } : a
      );
      
      const updatedPedido = {
        ...pedido,
        asignaciones
      };
      
      try {
        const response = await fetch(`${baseUrl}/pedidos/${pedido.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(updatedPedido)
        });
        
        const result = await response.json();
        if (result.success) {
          await cargarDatos();
        }
      } catch (error) {
        console.log('Error al actualizar estado a enviado:', error);
      }
    }
    
    // Limpiar número de teléfono del camarero (eliminar espacios, guiones, etc)
    let numeroLimpio = camarero.telefono.replace(/\D/g, '');
    
    // Si el número no tiene código de país, agregar 34 (España)
    if (numeroLimpio.length === 9) {
      numeroLimpio = '34' + numeroLimpio;
    }
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Crear enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
    
    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, '_blank');
  };

  const pedidoActual = uniquePedidos.find(p => p.id === pedidoSeleccionado);
  const camarerosAsignados = pedidoActual?.asignaciones || [];
  
  // Filtrar coordinadores que tienen teléfono
  const coordinadoresConTelefono = uniqueCoordinadores.filter(c => c.telefono);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Envío de Mensaje a Camareros por WhatsApp</h2>
        
        {/* Estado de configuración de WhatsApp */}
        <WhatsAppConfigStatus baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
        
        <div className="space-y-4">
          {/* Seleccionar coordinador */}
          <div>
            <label className="block text-gray-700 mb-2">Seleccionar Coordinador (quien envía el mensaje)</label>
            <select
              value={coordinadorSeleccionado}
              onChange={(e) => setCoordinadorSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="empty-coordinador" value="">Seleccionar coordinador</option>
              {coordinadoresConTelefono.map((coordinador) => (
                <option key={coordinador.id} value={coordinador.id}>
                  {coordinador.nombre} - {coordinador.telefono}
                </option>
              ))}
            </select>
            {uniqueCoordinadores.length > 0 && coordinadoresConTelefono.length === 0 && (
              <p className="text-orange-600 text-sm mt-2">
                ⚠️ No hay coordinadores con teléfono configurado. Agrega el teléfono en la sección de Coordinadores.
              </p>
            )}
          </div>

          {/* Seleccionar pedido */}
          <div>
            <label className="block text-gray-700 mb-2">Seleccionar Evento</label>
            <select
              value={pedidoSeleccionado}
              onChange={(e) => {
                setPedidoSeleccionado(e.target.value);
                setCamareroSeleccionado('');
                setMensaje('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="empty-pedido" value="">Seleccionar evento</option>
              {uniquePedidos
                .sort((a, b) => new Date(a.diaEvento) - new Date(b.diaEvento))
                .map((pedido) => (
                  <option key={pedido.id} value={pedido.id}>
                    {new Date(pedido.diaEvento).toLocaleDateString('es-ES')} - {pedido.cliente} - {pedido.lugar}
                  </option>
                ))}
            </select>
          </div>

          {/* Seleccionar camarero */}
          {pedidoSeleccionado && camarerosAsignados.length > 0 && (
            <div>
              <label className="block text-gray-700 mb-2">Seleccionar Camarero Asignado</label>
              <select
                value={camareroSeleccionado}
                onChange={(e) => {
                  setCamareroSeleccionado(e.target.value);
                  setMensaje('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option key="empty-camarero" value="">Seleccionar camarero</option>
                {camarerosAsignados.map((asignacion) => {
                  const cam = uniqueCamareros.find(c => c.id === asignacion.camareroId);
                  return (
                    <option key={asignacion.camareroId} value={asignacion.camareroId}>
                      #{asignacion.camareroNumero} - {asignacion.camareroNombre} ({asignacion.estado})
                      {cam && !cam.telefono ? ' ⚠️ Sin teléfono' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {pedidoSeleccionado && camarerosAsignados.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Este evento no tiene camareros asignados. Por favor, asigna camareros desde la sección de Gestión de Pedidos.
              </p>
            </div>
          )}

          {/* Botón para generar mensaje */}
          {pedidoSeleccionado && camareroSeleccionado && (
            <button
              onClick={handleGenerarMensaje}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Generar Mensaje
            </button>
          )}

          {/* Mensaje generado */}
          {mensaje && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Mensaje para enviar</label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[400px]"
                />
              </div>

              {/* Botones de confirmación para incluir en el mensaje */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 mb-3">Botones de confirmación (se enviarán al camarero):</p>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={enlaceConfirmar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
                  >
                    ✅ CONFIRMO
                  </a>
                  <a
                    href={enlaceNoConfirmar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center"
                  >
                    ❌ NO CONFIRMO
                  </a>
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  Estos botones son solo para previsualizar. Los enlaces reales se enviarán en el mensaje de WhatsApp.
                </p>
              </div>

              {/* Botones de envío - Adaptativos según configuración */}
              <div className="space-y-3">
                {whatsappConfigured ? (
                  // Si está configurada la API, priorizar envío automático
                  <div key="whatsapp-configured" className="space-y-3">
                    <button
                      onClick={enviarMensajeAutomatico}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                    >
                      <MessageCircle className="w-5 h-5" />
                      🚀 Enviar Automáticamente (Recomendado)
                    </button>
                    
                    <button
                      onClick={enviarPorWhatsApp}
                      className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      O enviar por WhatsApp Web
                    </button>
                  </div>
                ) : (
                  // Si NO está configurada, solo WhatsApp Web
                  <div key="whatsapp-not-configured" className="space-y-3">
                    <button
                      onClick={enviarPorWhatsApp}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Enviar por WhatsApp Web
                    </button>
                    
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 text-xs">
                        💡 <strong>Configura WhatsApp Business API</strong> para envío automático sin abrir el navegador. 
                        <a href="#" className="underline ml-1">Ver guía</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm mb-2">
                  <strong>Cómo funciona:</strong>
                </p>
                <ol className="text-blue-800 text-sm space-y-1 list-decimal ml-4">
                  <li>Al hacer clic en "Enviar por WhatsApp", se abrirá WhatsApp Web con el mensaje listo</li>
                  <li>El camarero recibirá el mensaje con su información del evento</li>
                  <li>Al final del mensaje habrá dos enlaces de botón para confirmar o no confirmar</li>
                  <li>Cuando el camarero haga clic en "✅ CONFIRMO", su estado se actualizará automáticamente a confirmado (verde)</li>
                  <li>Si hace clic en "❌ NO CONFIRMO", será removido automáticamente de la asignación</li>
                  <li>Los cambios se reflejarán instantáneamente en la aplicación</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>💡 Tip:</strong> Los enlaces de confirmación son únicos y solo funcionan una vez. No los reutilices para otros eventos.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}