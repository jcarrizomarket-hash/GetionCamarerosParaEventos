import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';

export function WhatsAppQuickSetup() {
  const [copied, setCopied] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      number: 1,
      title: 'Crear cuenta en Meta for Developers',
      description: 'Necesitas una cuenta de Facebook/Meta para acceder a la API de WhatsApp Business.',
      action: (
        <a
          href="https://developers.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Ir a Meta Developers
          <ExternalLink className="w-4 h-4" />
        </a>
      )
    },
    {
      number: 2,
      title: 'Crear una App de tipo "Business"',
      description: 'En el panel de Meta, crea una nueva aplicación y selecciona el tipo "Business".',
      details: [
        'Haz clic en "Mis Apps" → "Crear App"',
        'Selecciona "Business" como tipo',
        'Completa el nombre y email de contacto'
      ]
    },
    {
      number: 3,
      title: 'Agregar WhatsApp como producto',
      description: 'En tu app recién creada, agrega WhatsApp como producto disponible.',
      details: [
        'Busca "WhatsApp" en los productos',
        'Haz clic en "Configurar"',
        'Crea o selecciona una cuenta de WhatsApp Business'
      ]
    },
    {
      number: 4,
      title: 'Verificar tu número de teléfono',
      description: 'Necesitas verificar el número desde el cual se enviarán los mensajes.',
      details: [
        'Ve a WhatsApp → Números de teléfono',
        'Haz clic en "Agregar número"',
        'Completa el proceso de verificación (SMS/llamada)',
        'Este número aparecerá como remitente'
      ]
    },
    {
      number: 5,
      title: 'Obtener WHATSAPP_PHONE_ID',
      description: 'Este es el identificador del número de teléfono verificado.',
      details: [
        'Ve a WhatsApp → Números de teléfono',
        'Haz clic en tu número verificado',
        'Copia el "Phone number ID" (formato: 123456789012345)'
      ],
      copyField: {
        label: 'WHATSAPP_PHONE_ID',
        placeholder: '123456789012345',
        note: 'Copia este valor de Meta y guárdalo'
      }
    },
    {
      number: 6,
      title: 'Obtener WHATSAPP_API_KEY (Token de Acceso)',
      description: '⚠️ CRÍTICO: Necesitas un token de acceso PERMANENTE (200+ caracteres). NO uses el Phone ID aquí.',
      details: [
        '🔑 Ve a tu aplicación en Meta for Developers',
        '📝 Configuración → Básica',
        '🏢 Después ve a Configuración del negocio → Tokens de acceso del sistema',
        '➕ Haz clic en "Crear nuevo token"',
        '✅ Selecciona los permisos: "whatsapp_business_management" y "whatsapp_business_messaging"',
        '⏳ Marca "Token de acceso que nunca caduca" (permanente)',
        '📋 Copia el token COMPLETO (empieza con "EAA..." y tiene 200+ caracteres)',
        '⚠️ IMPORTANTE: El token solo se muestra UNA VEZ. Si lo pierdes, tendrás que crear uno nuevo.',
        '🚫 DIFERENCIA: El Token es LARGO (200+ chars), el Phone ID es CORTO (15 dígitos)'
      ],
      copyField: {
        label: 'WHATSAPP_API_KEY',
        placeholder: 'EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx... (200+ caracteres)',
        note: '⚠️ Token permanente - Debe tener más de 200 caracteres. NO ES el Phone ID.'
      }
    },
    {
      number: 7,
      title: 'Configurar en Supabase',
      description: 'Agrega las credenciales como variables de entorno en tu proyecto.',
      details: [
        'Ve a tu proyecto en Supabase',
        'Project Settings → Edge Functions → Secrets',
        'Agrega ambas variables:',
      ],
      action: (
        <div className="space-y-3 mt-3">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Variable 1:</span>
              <button
                onClick={() => copyToClipboard('WHATSAPP_API_KEY', 'var1')}
                className="p-1 hover:bg-gray-800 rounded"
              >
                {copied === 'var1' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div>WHATSAPP_API_KEY = tu_token_aqui</div>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Variable 2:</span>
              <button
                onClick={() => copyToClipboard('WHATSAPP_PHONE_ID', 'var2')}
                className="p-1 hover:bg-gray-800 rounded"
              >
                {copied === 'var2' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div>WHATSAPP_PHONE_ID = tu_phone_id_aqui</div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Abrir Supabase Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )
    },
    {
      number: 8,
      title: '¡Listo! Prueba el sistema',
      description: 'Recarga la aplicación y verifica que la configuración sea correcta.',
      details: [
        'Recarga esta página (F5 o Ctrl+R)',
        'Ve a Pedidos → Entrada de Pedidos → Envío de Mensaje',
        'Verás un mensaje verde confirmando la configuración',
        'Envía un mensaje de prueba a tu propio número'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🚀 Configuración Rápida de WhatsApp Business API
        </h3>
        <p className="text-gray-600 text-sm">
          Sigue estos pasos para activar el envío automático de mensajes sin necesidad de abrir el navegador.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((stepItem) => (
          <div
            key={stepItem.number}
            className={`border rounded-lg p-4 transition-all ${
              step === stepItem.number 
                ? 'border-blue-500 bg-blue-50' 
                : step > stepItem.number 
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === stepItem.number 
                  ? 'bg-blue-600 text-white' 
                  : step > stepItem.number 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepItem.number ? <CheckCircle className="w-5 h-5" /> : stepItem.number}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{stepItem.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{stepItem.description}</p>
                
                {stepItem.details && (
                  <ul className="space-y-1 mb-3">
                    {stepItem.details.map((detail, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {stepItem.copyField && (
                  <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {stepItem.copyField.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={stepItem.copyField.placeholder}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                        readOnly
                      />
                      <button
                        onClick={() => copyToClipboard(stepItem.copyField.label, `field-${stepItem.number}`)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {copied === `field-${stepItem.number}` ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{stepItem.copyField.note}</p>
                  </div>
                )}

                {stepItem.action && (
                  <div className="mt-3">
                    {stepItem.action}
                  </div>
                )}

                {step === stepItem.number && stepItem.number < steps.length && (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Siguiente Paso →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-900 font-medium mb-2">💰 Costos de WhatsApp Business API</p>
        <ul className="space-y-1 text-amber-800 text-sm">
          <li>✅ <strong>Gratis:</strong> Primeros 1,000 mensajes al mes</li>
          <li>✅ <strong>Número de prueba:</strong> Gratis para desarrollo (máximo 5 destinatarios)</li>
          <li>💰 <strong>De pago:</strong> ~€0.03 por conversación adicional en España</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-900 font-medium mb-2">📚 Recursos Útiles</p>
        <div className="space-y-2">
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Guía oficial de WhatsApp Cloud API
          </a>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Documentación completa
          </a>
        </div>
      </div>
    </div>
  );
}