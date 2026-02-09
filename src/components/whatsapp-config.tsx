import { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

export function WhatsAppConfig({ baseUrl, publicAnonKey }) {
  const [apiKey, setApiKey] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    verificarConfiguracion();
  }, []);

  const verificarConfiguracion = async () => {
    try {
      const response = await fetch(`${baseUrl}/verificar-whatsapp-config`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      });
      const result = await response.json();
      setIsConfigured(result.configured);
      
      if (result.configured) {
        setMessage('✅ WhatsApp Business API configurada correctamente');
      } else {
        setMessage('⚠️ WhatsApp Business API no configurada');
      }
    } catch (error) {
      console.error('Error al verificar configuración:', error);
      setMessage('❌ Error al verificar configuración');
    }
  };

  const guardarConfiguracion = async () => {
    if (!apiKey || !phoneId) {
      setMessage('❌ Por favor completa ambos campos');
      return;
    }

    if (apiKey.length < 100) {
      setMessage('❌ El token parece inválido (muy corto). Debe ser un token permanente de WhatsApp Business API');
      return;
    }

    // Validar que phoneId no sea un número de teléfono
    if (phoneId.includes('+') || phoneId.includes(' ') || phoneId.includes('-')) {
      setMessage('❌ El Phone Number ID NO debe contener caracteres especiales (+, -, espacios). Solo números. Ejemplo: 123456789012345');
      return;
    }

    if (phoneId.length < 10) {
      setMessage('❌ El Phone Number ID parece muy corto. Debe ser un ID numérico largo (ej: 123456789012345), NO tu número de teléfono.');
      return;
    }

    setIsSaving(true);
    setMessage('Guardando configuración...');

    try {
      const response = await fetch(`${baseUrl}/actualizar-whatsapp-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          apiKey,
          phoneId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('✅ Configuración guardada exitosamente! Los cambios están activos inmediatamente.');
        setApiKey('');
        setPhoneId('');
        
        // Verificar nuevamente después de 500ms
        setTimeout(async () => {
          await verificarConfiguracion();
        }, 500);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage('❌ Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-blue-600" />
          <h2 className="text-gray-900">Configuración de WhatsApp Business API</h2>
        </div>
        <button
          onClick={verificarConfiguracion}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Verificar
        </button>
      </div>

      {/* Estado actual */}
      <div className={`p-4 rounded-lg mb-6 ${isConfigured ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-yellow-600" />
          )}
          <p className={isConfigured ? 'text-green-800' : 'text-yellow-800'}>{message}</p>
        </div>
      </div>

      {/* Botón para mostrar/ocultar instrucciones */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
      >
        {showInstructions ? '📖 Ocultar instrucciones' : '📖 ¿Cómo obtener el token?'}
      </button>

      {/* Instrucciones */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Instrucciones para obtener el Token de WhatsApp Business API</h3>
          
          <ol className="space-y-3 text-blue-800 text-sm list-decimal ml-4">
            <li>
              <strong>Ve a Meta Business Suite:</strong>
              <a 
                href="https://business.facebook.com/wa/manage/home/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                https://business.facebook.com/wa/manage/home/
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            
            <li>
              <strong>Inicia sesión</strong> con tu cuenta de Facebook asociada a WhatsApp Business
            </li>
            
            <li>
              <strong>Selecciona tu aplicación de WhatsApp Business</strong> o crea una nueva si no tienes
            </li>
            
            <li>
              En el menú lateral, ve a <strong>"Configuración" → "Acceso a API"</strong> o <strong>"Settings" → "API Access"</strong>
            </li>
            
            <li>
              <strong>Genera un Token de Acceso PERMANENTE:</strong>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Haz clic en "Generar token" o "Generate token"</li>
                <li><strong className="text-red-600">IMPORTANTE:</strong> Selecciona "Token permanente", NO temporal</li>
                <li>Selecciona los permisos necesarios (whatsapp_business_messaging, whatsapp_business_management)</li>
                <li>Copia el token completo (debe tener 200+ caracteres)</li>
              </ul>
            </li>
            
            <li>
              <strong>Obtén tu Phone Number ID:</strong>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>En la misma sección o en "Números de teléfono"</li>
                <li>Verás tu número de WhatsApp Business con un ID numérico</li>
                <li>Copia ese ID (ejemplo: 123456789012345)</li>
                <li className="text-red-600"><strong>❌ NO uses tu número de teléfono (+34...)</strong></li>
                <li className="text-green-600"><strong>✅ USA el Phone Number ID numérico</strong></li>
              </ul>
            </li>
            
            <li>
              <strong>Pega ambos valores</strong> en los campos de abajo y guarda
            </li>
          </ol>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-amber-900 text-xs">
              <strong>⚠️ Nota importante:</strong> Los tokens temporales expiran en 24 horas. 
              Asegúrate de generar un token <strong>PERMANENTE</strong> para que la aplicación funcione continuamente.
            </p>
          </div>
        </div>
      )}

      {/* Formulario de configuración */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            WhatsApp API Key (Token de Acceso Permanente)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-sm mt-1">
            Token permanente de WhatsApp Business API (200+ caracteres)
          </p>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            WhatsApp Phone Number ID
          </label>
          <input
            type="text"
            value={phoneId}
            onChange={(e) => setPhoneId(e.target.value)}
            placeholder="123456789012345"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-sm mt-1">
            ID del número de teléfono de WhatsApp Business (números solamente)
          </p>
        </div>

        <button
          onClick={guardarConfiguracion}
          disabled={isSaving || !apiKey || !phoneId}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>

      {/* Links útiles */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">🔗 Enlaces Útiles</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a 
              href="https://business.facebook.com/wa/manage/home/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Meta Business Suite (WhatsApp)
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>
            <a 
              href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Documentación oficial de WhatsApp Business API
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>
            <a 
              href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#1--acquire-an-access-token-using-a-system-user-or-facebook-login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Cómo generar un token permanente
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}