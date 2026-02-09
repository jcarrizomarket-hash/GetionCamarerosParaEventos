import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export function WhatsAppConfigStatus({ baseUrl, publicAnonKey }) {
  const [status, setStatus] = useState<{
    configured: boolean;
    message: string;
    checking: boolean;
  }>({
    configured: false,
    message: '',
    checking: true
  });

  const verificarConfiguracion = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    try {
      const response = await fetch(`${baseUrl}/verificar-whatsapp-config`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      });
      const result = await response.json();
      setStatus({
        configured: result.configured,
        message: result.message,
        checking: false
      });
    } catch (error) {
      console.log('Error al verificar configuración WhatsApp:', error);
      setStatus({
        configured: false,
        message: 'Error al verificar configuración',
        checking: false
      });
    }
  };

  useEffect(() => {
    verificarConfiguracion();
  }, [baseUrl, publicAnonKey]);

  if (status.checking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <p className="font-medium text-blue-900">Verificando configuración de WhatsApp...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status.configured) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-green-900 mb-1">✅ WhatsApp Business API Configurada</p>
            <p className="text-sm text-green-700">{status.message}</p>
            <div className="mt-3 space-y-1 text-sm text-green-700">
              <p>✓ Envío automático de mensajes activado</p>
              <p>✓ Notificaciones automáticas al coordinador</p>
              <p>✓ Confirmaciones y rechazos en tiempo real</p>
            </div>
          </div>
          <button
            onClick={verificarConfiguracion}
            className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-amber-900 mb-1">⚠️ WhatsApp Business API No Configurada</p>
          <p className="text-sm text-amber-700 mb-3">{status.message}</p>
          
          <div className="bg-white border border-amber-200 rounded-md p-3 mb-3">
            <p className="text-sm font-medium text-amber-900 mb-2">Modo Actual: WhatsApp Web (Manual)</p>
            <p className="text-xs text-amber-700">Se abrirá una ventana del navegador para cada mensaje.</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-900">Para activar el envío automático:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
              <li>Ve a la pestaña <strong>"Configuración WhatsApp"</strong> en el menú principal</li>
              <li>Sigue las instrucciones para obtener tus credenciales de Meta Business Suite</li>
              <li>Ingresa tu Token de Acceso Permanente y Phone Number ID</li>
              <li>Guarda la configuración - ¡Los cambios son inmediatos!</li>
            </ol>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={verificarConfiguracion}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Verificar de Nuevo
            </button>
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              Guía de Meta
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}