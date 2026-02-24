import { useState } from 'react';
import { MessageSquare, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface WhatsAppChatbotConfigProps {
  baseUrl: string;
  publicAnonKey: string;
}

export function WhatsAppChatbotConfig({ baseUrl, publicAnonKey }: WhatsAppChatbotConfigProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const webhookUrl = `${baseUrl}/whatsapp-webhook`;
  const verifyToken = 'TU_TOKEN_DE_VERIFICACION'; // El usuario debe configurar esto

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🤖 Chatbot de WhatsApp
            </h3>
            <p className="text-gray-600">
              Sistema de conversación automática para recibir pedidos directamente desde WhatsApp.
              Los clientes pueden iniciar una conversación y completar un formulario guiado paso a paso.
            </p>
          </div>
        </div>
      </div>

      {/* Características del Chatbot */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">✨ Características del Chatbot</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Menú interactivo</p>
              <p className="text-sm text-gray-600">4 opciones principales al iniciar la conversación</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Formulario completo</p>
              <p className="text-sm text-gray-600">Recopila todos los datos del evento paso a paso</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Validaciones automáticas</p>
              <p className="text-sm text-gray-600">Verifica fechas, horarios, emails y teléfonos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Integración con Google Maps</p>
              <p className="text-sm text-gray-600">Búsqueda automática de ubicaciones</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Creación automática de pedidos</p>
              <p className="text-sm text-gray-600">Los pedidos se crean directamente en el sistema</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Gestión de estado</p>
              <p className="text-sm text-gray-600">Recuerda el progreso de cada conversación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flujo del Chatbot */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">🔄 Flujo de Conversación</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="font-bold text-blue-600">1.</span>
            <div>
              <p className="font-medium text-gray-900">Saludo y Menú Principal</p>
              <p className="text-sm text-gray-600">
                📝 Quiero hacer un pedido<br />
                👤 Quiero enviar un mensaje al coordinador<br />
                🏢 Quiero comunicarme con Administración<br />
                📅 Es sobre algún evento
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <span className="font-bold text-green-600">2.</span>
            <div>
              <p className="font-medium text-gray-900">Formulario de Pedido (si seleccionan "Hacer un pedido")</p>
              <p className="text-sm text-gray-600">
                • Nombre del cliente<br />
                • Lugar del evento<br />
                • Fecha del evento<br />
                • Hora del evento<br />
                • Ubicación de Google Maps<br />
                • Cantidad de camareros<br />
                • Color de camisa<br />
                • Email de contacto<br />
                • Teléfono de contacto
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <span className="font-bold text-purple-600">3.</span>
            <div>
              <p className="font-medium text-gray-900">Confirmación y Creación</p>
              <p className="text-sm text-gray-600">
                El sistema muestra un resumen y pide confirmación final antes de crear el pedido automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración del Webhook */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">⚙️ Configuración del Webhook</h4>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 mb-2">Paso 1: Configurar WHATSAPP_VERIFY_TOKEN</p>
                <p className="text-sm text-blue-800 mb-3">
                  Este token se usa para verificar que Meta/Facebook puede comunicarse con tu servidor.
                  Debes crear un token seguro (puede ser cualquier cadena aleatoria).
                </p>
                <div className="bg-white p-3 rounded border border-blue-300">
                  <p className="text-xs text-gray-500 mb-1">Ejemplo de token:</p>
                  <code className="text-sm text-gray-800">mi_token_secreto_12345</code>
                </div>
                <p className="text-sm text-blue-800 mt-2">
                  ⚠️ Debes configurar este token en las variables de entorno de Supabase con el nombre:
                  <code className="mx-1 px-2 py-0.5 bg-blue-100 rounded">WHATSAPP_VERIFY_TOKEN</code>
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Webhook
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copied === 'webhook' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Esta es la URL que debes configurar en la Meta App de WhatsApp Business
            </p>
          </div>
        </div>
      </div>

      {/* Instrucciones de Configuración en Meta */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">📱 Configurar en Meta for Developers</h4>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Acceder a Meta for Developers</p>
              <p className="text-sm text-gray-600 mb-2">
                Ve a <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  developers.facebook.com <ExternalLink className="w-3 h-3" />
                </a> e inicia sesión
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Seleccionar tu App</p>
              <p className="text-sm text-gray-600">
                Selecciona tu aplicación de WhatsApp Business o crea una nueva si no tienes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Ir a WhatsApp → Configuration</p>
              <p className="text-sm text-gray-600 mb-2">
                En el menú lateral, busca "WhatsApp" y haz clic en "Configuration"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">Configurar Webhook</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Haz clic en "Edit" en la sección de Webhooks</p>
                <p>• Pega la URL del webhook (copiada arriba)</p>
                <p>• Ingresa tu <code className="px-1 bg-gray-200 rounded">WHATSAPP_VERIFY_TOKEN</code></p>
                <p>• Haz clic en "Verify and Save"</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              5
            </span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">Suscribirse a Eventos</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Después de verificar el webhook, suscríbete a estos campos:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">messages</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">message_status</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comandos del Chatbot */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">💬 Comandos Disponibles</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
            <code className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">menu</code>
            <p className="text-sm text-gray-600">Vuelve al menú principal en cualquier momento</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
            <code className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">inicio</code>
            <p className="text-sm text-gray-600">Reinicia la conversación desde el principio</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
            <code className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">1, 2, 3...</code>
            <p className="text-sm text-gray-600">Selecciona opciones del menú usando números</p>
          </div>
        </div>
      </div>

      {/* Nota importante */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 mb-1">⚠️ Importante</p>
            <p className="text-sm text-amber-800">
              Para que el chatbot funcione correctamente, asegúrate de que las credenciales de WhatsApp
              (<code className="mx-1 px-1 bg-amber-100 rounded">WHATSAPP_PHONE_ID</code> y <code className="px-1 bg-amber-100 rounded">WHATSAPP_API_KEY</code>)
              estén configuradas en la sección de WhatsApp de esta página.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
