import { logger } from '../utils/logger';
import { useState } from 'react';
import { Send, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { EmailConfigStatus } from './email-config-status';

interface TestEmailProps {
  baseUrl: string;
  publicAnonKey: string;
}

export function TestEmail({ baseUrl, publicAnonKey }: TestEmailProps) {
  const [emailData, setEmailData] = useState({
    destinatario: '',
    asunto: 'Test de Email - Sistema de Gestión de Camareros',
    mensaje: 'Este es un email de prueba del sistema.\n\nSi recibes este mensaje, tu configuración de email está funcionando correctamente.'
  });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ success: boolean; message: string } | null>(null);

  const enviarEmailTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.destinatario) {
      alert('Por favor, ingresa un destinatario');
      return;
    }
    
    setEnviando(true);
    setResultado(null);
    
    try {
      // Generar un HTML simple para el parte de prueba
      const parteHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .parte { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #333; padding: 30px; }
            h1 { text-align: center; font-size: 24px; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 10px; color: #10b981; }
            .info-row { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 2px solid #333; padding: 12px; text-align: left; }
            th { background-color: #10b981; color: white; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="parte">
            <h1>✅ PRUEBA DE EMAIL EXITOSA</h1>
            
            <div class="info-row">
              <span class="label">🎉 ¡Felicidades!</span>
            </div>
            <div class="info-row">
              <span class="value">Tu sistema de email está configurado correctamente y funcionando.</span>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Componente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Servidor Backend</td>
                  <td>✅ Funcionando</td>
                </tr>
                <tr>
                  <td>Proveedor de Email</td>
                  <td>✅ Conectado</td>
                </tr>
                <tr>
                  <td>Envío de HTML</td>
                  <td>✅ Activo</td>
                </tr>
                <tr>
                  <td>Formato Profesional</td>
                  <td>✅ Aplicado</td>
                </tr>
              </tbody>
            </table>
            
            <div class="info-row">
              <span class="label">📋 Cliente de Prueba:</span>
              <span class="value"> Empresa XYZ S.A.</span>
            </div>
            <div class="info-row">
              <span class="label">📅 Fecha de Prueba:</span>
              <span class="value"> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-row">
              <span class="label">📍 Lugar:</span>
              <span class="value"> Salón de Eventos Principal</span>
            </div>
            <div class="info-row">
              <span class="label">⏰ Hora de entrada:</span>
              <span class="value"> 18:00</span>
            </div>
            
            <div class="footer">
              <p><strong>Sistema de Gestión de Camareros</strong></p>
              <p>Email de prueba generado automáticamente</p>
              <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const response = await fetch(`${baseUrl}/enviar-email-parte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          destinatario: emailData.destinatario,
          cc: null,
          asunto: emailData.asunto,
          mensaje: emailData.mensaje,
          parteHTML,
          pedido: {
            cliente: 'Cliente de Prueba',
            fecha: new Date().toLocaleDateString('es-ES'),
            lugar: 'Salón de Eventos Principal'
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResultado({
          success: true,
          message: `✅ Email enviado exitosamente usando ${result.provider}!\n\nRevisa tu bandeja de entrada en: ${emailData.destinatario}`
        });
      } else {
        setResultado({
          success: false,
          message: `❌ Error al enviar: ${result.error || 'Error desconocido'}`
        });
      }
    } catch (error) {
      logger.error('Error al enviar email de prueba:', error);
      setResultado({
        success: false,
        message: `❌ Error de conexión: ${error.message}`
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test de Envío de Email</h2>
            <p className="text-sm text-gray-600">Verifica que tu configuración de email funciona correctamente</p>
          </div>
        </div>

        {/* Estado de configuración */}
        <EmailConfigStatus baseUrl={baseUrl} publicAnonKey={publicAnonKey} />

        {/* Formulario de prueba */}
        <form onSubmit={enviarEmailTest} className="space-y-5">
          {/* Destinatario */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              📧 Destinatario (tu email para recibir la prueba) *
            </label>
            <input
              type="email"
              value={emailData.destinatario}
              onChange={(e) => setEmailData({ ...emailData, destinatario: e.target.value })}
              placeholder="tu-email@ejemplo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={enviando}
            />
            <p className="text-xs text-gray-500 mt-1">Ingresa tu email personal para recibir el email de prueba</p>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              📝 Asunto del Email
            </label>
            <input
              type="text"
              value={emailData.asunto}
              onChange={(e) => setEmailData({ ...emailData, asunto: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={enviando}
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              💬 Mensaje de Prueba
            </label>
            <textarea
              value={emailData.mensaje}
              onChange={(e) => setEmailData({ ...emailData, mensaje: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={enviando}
            />
            <p className="text-xs text-gray-500 mt-1">Este mensaje aparecerá antes del parte de prueba</p>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">📋 El email incluirá:</p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>✓ Tu mensaje personalizado</li>
              <li>✓ Un parte de servicio de ejemplo con formato profesional</li>
              <li>✓ Información de cliente, fecha y lugar simulados</li>
              <li>✓ Tabla de camareros de ejemplo</li>
              <li>✓ Diseño HTML completo y profesional</li>
            </ul>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {enviando ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Enviando email de prueba...</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span>Enviar Email de Prueba</span>
              </>
            )}
          </button>
        </form>

        {/* Resultado */}
        {resultado && (
          <div className={`mt-6 p-5 rounded-lg border-2 ${
            resultado.success 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {resultado.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium mb-1 ${
                  resultado.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {resultado.success ? '¡Email Enviado!' : 'Error al Enviar'}
                </p>
                <p className={`text-sm whitespace-pre-line ${
                  resultado.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {resultado.message}
                </p>
                
                {resultado.success && (
                  <div className="mt-4 space-y-2 text-sm text-green-800">
                    <p className="font-medium">🔍 Qué hacer ahora:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Revisa tu bandeja de entrada en <strong>{emailData.destinatario}</strong></li>
                      <li>Si no lo ves, revisa la carpeta de <strong>Spam</strong> o <strong>Promociones</strong></li>
                      <li>Si usas <code className="bg-green-100 px-1 py-0.5 rounded">onboarding@resend.dev</code> como remitente, es normal que vaya a spam</li>
                      <li>Para evitar spam en producción, <strong>configura tu propio dominio</strong> en Resend</li>
                    </ol>
                  </div>
                )}
                
                {!resultado.success && (
                  <div className="mt-4 space-y-2 text-sm text-red-800">
                    <p className="font-medium">🔧 Soluciones posibles:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Verifica que <code className="bg-red-100 px-1 py-0.5 rounded">RESEND_API_KEY</code> esté correctamente configurada</li>
                      <li>Asegúrate de que <code className="bg-red-100 px-1 py-0.5 rounded">EMAIL_FROM</code> esté configurada</li>
                      <li>Si usas tu dominio, verifica que esté verificado en Resend</li>
                      <li>Consulta la documentación en <code className="bg-red-100 px-1 py-0.5 rounded">EMAIL_SETUP.md</code></li>
                    </ul>
                    
                    {/* Mostrar detalles técnicos del error */}
                    <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
                      <p className="font-semibold mb-2">📋 Detalles Técnicos (para debugging):</p>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-white p-2 rounded border border-red-200 max-h-40">
                        {JSON.stringify(resultado, null, 2)}
                      </pre>
                      <p className="text-xs mt-2 text-red-700">
                        💡 Copia este mensaje completo si necesitas ayuda con el error.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tips adicionales */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">💡 Tips importantes:</p>
          <ul className="text-sm text-gray-700 space-y-1 ml-4">
            <li>• El email de prueba tiene el mismo formato que los partes reales</li>
            <li>• Si funciona esta prueba, los envíos reales también funcionarán</li>
            <li>• Puedes verificar los logs en la consola del navegador (F12)</li>
            <li>• Revisa el panel de Resend para ver estadísticas: <a href="https://resend.com/emails" target="_blank" className="text-blue-600 underline">resend.com/emails</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}