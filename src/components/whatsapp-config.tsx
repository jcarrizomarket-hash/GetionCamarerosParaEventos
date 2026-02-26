import { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, RefreshCw, ExternalLink, AlertTriangle, Copy, Check } from 'lucide-react';

interface WhatsAppConfigProps {
  baseUrl: string;
  publicAnonKey: string;
}

export function WhatsAppConfig({ baseUrl, publicAnonKey }: WhatsAppConfigProps) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [message, setMessage] = useState('');
  const [configDetails, setConfigDetails] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    verificarConfiguracion();
  }, []);

  const verificarConfiguracion = async () => {
    setChecking(true);
    try {
      const response = await fetch(`${baseUrl}/verificar-whatsapp-config`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      });
      const result = await response.json();
      setIsConfigured(result.configured);
      setConfigDetails(result);
      
      if (result.configured) {
        setMessage('✅ WhatsApp Business API configurada correctamente');
      } else if (result.suspiciousToken || result.duplicateValues) {
        setMessage('🚨 Error en la configuración detectado');
      } else {
        setMessage('⚠️ WhatsApp Business API no configurada');
      }
    } catch (error) {
      console.error('Error al verificar configuración:', error);
      setMessage('❌ Error al verificar configuración');
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Configuración de WhatsApp Business API</h2>
        </div>
        <button
          onClick={verificarConfiguracion}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          Verificar
        </button>
      </div>

      {/* Estado actual */}
      <div className={`p-4 rounded-lg mb-6 border-2 ${
        isConfigured 
          ? 'bg-green-50 border-green-300' 
          : (configDetails?.suspiciousToken || configDetails?.duplicateValues)
            ? 'bg-red-50 border-red-300'
            : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (configDetails?.suspiciousToken || configDetails?.duplicateValues) ? (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          ) : (
            <XCircle className="w-6 h-6 text-yellow-600" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              isConfigured 
                ? 'text-green-900' 
                : (configDetails?.suspiciousToken || configDetails?.duplicateValues)
                  ? 'text-red-900'
                  : 'text-yellow-900'
            }`}>
              {message}
            </p>
            {configDetails?.tokenLength && (
              <p className="text-sm text-gray-600 mt-1">
                Token actual: {configDetails.tokenLength} caracteres
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instrucciones de configuración en Supabase */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          🔧 Cómo configurar WhatsApp Business API
        </h3>
        
        <div className="space-y-6">
          {/* Paso 1: Obtener credenciales */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">📋 Paso 1: Obtener credenciales de Meta</h4>
            <ol className="space-y-2 text-sm text-gray-800 list-decimal ml-5">
              <li>
                Ve a{' '}
                <a 
                  href="https://developers.facebook.com/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                >
                  Meta for Developers
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Selecciona tu app → <strong>Configuración del negocio → Tokens de acceso del sistema</strong></li>
              <li>Genera un <strong>Token Permanente</strong> con permisos de WhatsApp Business</li>
              <li>Copia el <strong>WHATSAPP_API_KEY</strong> (200+ caracteres, empieza con "EAA...")</li>
              <li>Ve a <strong>WhatsApp → Números de teléfono</strong> y copia el <strong>Phone Number ID</strong> (15 dígitos)</li>
            </ol>
          </div>

          {/* Paso 2: Configurar en Supabase */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">⚙️ Paso 2: Configurar en Supabase</h4>
            <ol className="space-y-3 text-sm text-gray-800 list-decimal ml-5">
              <li>
                Abre{' '}
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                >
                  Supabase Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Ve a tu proyecto → <strong>Project Settings ⚙️</strong> → <strong>Edge Functions</strong> → <strong>Secrets</strong></li>
              <li>Busca o agrega las siguientes variables de entorno:</li>
            </ol>

            <div className="mt-4 space-y-3">
              {/* Variable 1 */}
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Variable 1:</span>
                  <button
                    onClick={() => copyToClipboard('WHATSAPP_API_KEY', 'var1')}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    title="Copiar nombre de variable"
                  >
                    {copied === 'var1' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <code className="text-sm">
                  <span className="text-blue-400">WHATSAPP_API_KEY</span> = tu_token_permanente_aqui
                </code>
                <p className="text-xs text-gray-400 mt-2">
                  ⚠️ Debe tener 200+ caracteres y empezar con "EAA..."
                </p>
              </div>

              {/* Variable 2 */}
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Variable 2:</span>
                  <button
                    onClick={() => copyToClipboard('WHATSAPP_PHONE_ID', 'var2')}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    title="Copiar nombre de variable"
                  >
                    {copied === 'var2' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <code className="text-sm">
                  <span className="text-green-400">WHATSAPP_PHONE_ID</span> = 984665461396378
                </code>
                <p className="text-xs text-gray-400 mt-2">
                  ℹ️ Solo números, sin espacios ni caracteres especiales
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>💡 Importante:</strong> Después de guardar las variables en Supabase, 
                haz clic en el botón <strong>"Verificar"</strong> arriba para comprobar que la configuración sea correcta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diferencias entre credenciales */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3">📋 Diferencias entre credenciales</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Phone ID */}
          <div className="bg-white rounded-lg p-4 border-2 border-green-300">
            <h4 className="font-semibold text-green-900 mb-2">WHATSAPP_PHONE_ID</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Número corto (15 dígitos)</li>
              <li>✓ Ejemplo: <code className="bg-gray-100 px-2 py-0.5 rounded">61587002352487</code></li>
              <li>✓ Se obtiene en: WhatsApp → Números</li>
            </ul>
          </div>

          {/* API Key */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">WHATSAPP_API_KEY</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Token largo (200+ caracteres)</li>
              <li>✓ Empieza con: <code className="bg-gray-100 px-2 py-0.5 rounded">EAA...</code></li>
              <li>✓ Se obtiene en: Tokens de acceso</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Links útiles */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">🔗 Enlaces Útiles</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a 
              href="https://developers.facebook.com/apps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Meta for Developers
            </a>
          </li>
          <li>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Supabase Dashboard
            </a>
          </li>
          <li>
            <a 
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Guía oficial de WhatsApp Cloud API
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}