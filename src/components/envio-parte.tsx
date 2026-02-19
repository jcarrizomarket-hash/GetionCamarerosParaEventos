import { useState } from 'react';
import { Printer, Mail, X, Send, FileText, User, AtSign, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { EmailConfigStatus } from './email-config-status';

export function EnvioParte({ pedidos, camareros, coordinadores, clientes, baseUrl, publicAnonKey }) {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    destinatario: '',
    asunto: '',
    mensaje: '',
    copiaCoordinador: false,
    emailCoordinador: ''
  });
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  // Deduplicar pedidos
  const uniquePedidos = Array.from(new Map(pedidos.map(p => [p.id, p])).values());

  const imprimirParte = () => {
    window.print();
  };

  // Función para generar el HTML del parte
  const generarParteHTML = (pedido) => {
    const camareros = pedido.asignaciones || [];
    const filasVacias = Math.max(0, 8 - camareros.length);
    
    const filasVaciasHTML = Array.from({ length: filasVacias }, (_, i) => `
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .parte { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
          h1 { text-align: center; font-size: 24px; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-row { margin-bottom: 10px; }
          .label { display: inline-block; width: 150px; font-weight: bold; }
          .value { border-bottom: 1px solid #333; display: inline-block; min-width: 250px; padding: 2px 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th, td { border: 2px solid #333; padding: 10px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .firma { float: right; border: 2px solid #333; padding: 20px; width: 300px; text-align: center; margin-top: 40px; }
          .firma-linea { border-top: 1px solid #333; margin-top: 80px; }
        </style>
      </head>
      <body>
        <div class="parte">
          <h1>PARTE DE SERVICIO</h1>
          
          <div class="info-grid">
            <div>
              <div class="info-row">
                <span class="label">Cliente:</span>
                <span class="value">${pedido.cliente}</span>
              </div>
              <div class="info-row">
                <span class="label">Día:</span>
                <span class="value">${new Date(pedido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="label">Lugar del evento:</span>
                <span class="value">${pedido.lugar}</span>
              </div>
              <div class="info-row">
                <span class="label">Hora entrada:</span>
                <span class="value">${pedido.horaEntrada}${pedido.horaEntrada2 ? ` / ${pedido.horaEntrada2}` : ''}</span>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Camarero</th>
                <th>Hora Entrada</th>
                <th>Hora Salida</th>
                <th>Total</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              ${camareros.map((asig) => `
                <tr>
                  <td>#${asig.camareroNumero} - ${asig.camareroNombre}</td>
                  <td>${pedido.horaEntrada}</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              `).join('')}
              ${filasVaciasHTML}
            </tbody>
          </table>

          <div class="firma">
            <p>Firma del Responsable</p>
            <div class="firma-linea"></div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const pedidoSeleccionado = uniquePedidos.find(p => p.id === selectedPedido);

  return (
    <div className="max-w-6xl mx-auto">
      {!showPrintView ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-gray-900 mb-6">Envío de Parte</h2>
          
          {/* Estado de configuración de Email */}
          <EmailConfigStatus baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
          
          {/* Botón de diagnóstico adicional */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${baseUrl}/verificar-email-config`, {
                    headers: { Authorization: `Bearer ${publicAnonKey}` }
                  });
                  const data = await response.json();
                  console.log('🔍 DIAGNÓSTICO COMPLETO:', data);
                  alert(`Diagnóstico:\n\nConfigurado: ${data.configured ? 'SÍ' : 'NO'}\nServicio: ${data.servicioActivo || 'Ninguno'}\nEmail From: ${data.emailFrom}\n\nDebug Info:\n${JSON.stringify(data.debug, null, 2)}\n\nMira la consola para más detalles.`);
                } catch (error) {
                  console.error('Error en diagnóstico:', error);
                  alert('Error al verificar configuración. Revisa la consola.');
                }
              }}
              className="text-sm px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md font-medium"
            >
              🔍 Diagnóstico Completo de Email
            </button>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Seleccionar Pedido</label>
            <select
              value={selectedPedido || ''}
              onChange={(e) => setSelectedPedido(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="pedido-empty" value="">Seleccione un pedido</option>
              {uniquePedidos
                .sort((a, b) => new Date(a.diaEvento) - new Date(b.diaEvento))
                .map((pedido) => (
                  <option key={pedido.id} value={pedido.id}>
                    {new Date(pedido.diaEvento).toLocaleDateString('es-ES')} - {pedido.cliente} - {pedido.lugar}
                  </option>
                ))}
            </select>
          </div>

          {selectedPedido && pedidoSeleccionado && (
            <div className="flex gap-4">
              <button
                onClick={() => setShowPrintView(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                <span>Ver Parte para Imprimir</span>
              </button>
              <button
                onClick={() => {
                  // Buscar emails del cliente
                  const clienteData = clientes.find(c => c.nombre === pedidoSeleccionado.cliente);
                  const emailsCliente = [];
                  
                  if (clienteData?.mail1) emailsCliente.push(clienteData.mail1);
                  if (clienteData?.mail2) emailsCliente.push(clienteData.mail2);
                  
                  const destinatarioEmail = emailsCliente.join(', ');
                  
                  // Pre-rellenar datos del email
                  setEmailData({
                    destinatario: destinatarioEmail,
                    asunto: `Parte de Servicio - ${pedidoSeleccionado.cliente} - ${new Date(pedidoSeleccionado.diaEvento).toLocaleDateString('es-ES')}`,
                    mensaje: `Adjunto el parte de servicio para el evento en formato PDF.\\\\n\\\\nCliente: ${pedidoSeleccionado.cliente}\\\\nFecha: ${new Date(pedidoSeleccionado.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\\\\nLugar: ${pedidoSeleccionado.lugar}\\\\nHora de entrada: ${pedidoSeleccionado.horaEntrada}\\\\n\\\\nSaludos cordiales.`,
                    copiaCoordinador: false,
                    emailCoordinador: ''
                  });
                  setShowEmailModal(true);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                <span>Enviar por Email</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Vista de impresión */}
          <div className="print-only-show">
            <style>{`
              @media print {
                .no-print { display: none !important; }
                .print-only-show { display: block !important; }
                body { background: white; }
                @page { margin: 20mm; }
              }
              @media screen {
                .print-only-show { background: white; padding: 40px; }
              }
            `}</style>

            {/* Botones de acción - solo en pantalla */}
            <div className="no-print mb-6 flex gap-4">
              <button
                onClick={imprimirParte}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setShowPrintView(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <span>Volver</span>
              </button>
            </div>

            {/* Documento imprimible */}
            <div className="bg-white p-8 border border-gray-300" style={{ minHeight: '297mm' }}>
              {/* Cabecera */}
              <div className="mb-8 pb-4 border-b-2 border-gray-800">
                <h1 className="text-center mb-6">PARTE DE SERVICIO</h1>
                
                <div className="grid grid-cols-2 gap-6">
                  <div key="col-izquierda">
                    <p className="mb-2">
                      <span className="inline-block w-32">Cliente:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {pedidoSeleccionado.cliente}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="inline-block w-32">Día:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {new Date(pedidoSeleccionado.diaEvento).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </p>
                  </div>
                  <div key="col-derecha">
                    <p className="mb-2">
                      <span className="inline-block w-40">Lugar del evento:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {pedidoSeleccionado.lugar}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="inline-block w-40">Hora entrada:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {pedidoSeleccionado.horaEntrada}
                        {pedidoSeleccionado.horaEntrada2 && <span> / {pedidoSeleccionado.horaEntrada2}</span>}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla de camareros */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-2 border-gray-800">
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Camarero</th>
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Hora Entrada</th>
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Hora Salida</th>
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Total</th>
                      <th className="border-gray-800 p-3 text-left bg-gray-100">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSeleccionado.asignaciones && pedidoSeleccionado.asignaciones.length > 0 ? (
                      <>
                        {pedidoSeleccionado.asignaciones.map((asignacion, index) => (
                          <tr key={`asig-${pedidoSeleccionado.id}-${asignacion.camareroId}-${index}`} className="border-2 border-gray-800">
                            <td className="border-r-2 border-gray-800 p-3">
                              #{asignacion.camareroNumero} - {asignacion.camareroNombre}
                            </td>
                            <td className="border-r-2 border-gray-800 p-3">
                              {pedidoSeleccionado.horaEntrada}
                            </td>
                            <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                            <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                            <td className="border-gray-800 p-3">&nbsp;</td>
                          </tr>
                        ))}
                        {/* Filas adicionales para completar */}
                        {Array.from({ length: Math.max(0, 8 - pedidoSeleccionado.asignaciones.length) }).map((_, index) => (
                          <tr key={`extra-${pedidoSeleccionado.id}-${pedidoSeleccionado.asignaciones.length}-${index}`} className="border-2 border-gray-800">
                            <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                            <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                            <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                            <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                            <td className="border-gray-800 p-3">&nbsp;</td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      // Filas vacías si no hay camareros asignados
                      Array.from({ length: 8 }).map((_, index) => (
                        <tr key={`empty-${pedidoSeleccionado.id}-${index}`} className="border-2 border-gray-800">
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-gray-800 p-3">&nbsp;</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Firma del responsable */}
              <div className="flex justify-end mt-16">
                <div className="border-2 border-gray-800 p-6 w-80 text-center">
                  <p className="mb-12">Firma del Responsable</p>
                  <div className="border-t border-gray-800 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de envío por email - Mejorado */}
      {showEmailModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Enviar Parte por Email</h3>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Información del pedido */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 m-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Parte a enviar:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div key="info-cliente"><span className="font-medium">Cliente:</span> {pedidoSeleccionado.cliente}</div>
                    <div key="info-lugar"><span className="font-medium">Lugar:</span> {pedidoSeleccionado.lugar}</div>
                    <div key="info-fecha"><span className="font-medium">Fecha:</span> {new Date(pedidoSeleccionado.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div key="info-hora"><span className="font-medium">Hora:</span> {pedidoSeleccionado.horaEntrada}</div>
                    <div key="info-camareros" className="col-span-2"><span className="font-medium">Camareros:</span> {pedidoSeleccionado.asignaciones?.length || 0} asignados</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                
                if (!emailData.destinatario) {
                  alert('Por favor, ingresa un destinatario');
                  return;
                }
                
                // Validar que si copiaCoordinador está marcado, el email no esté vacío
                if (emailData.copiaCoordinador && !emailData.emailCoordinador.trim()) {
                  alert('Por favor, ingresa el email del coordinador o desmarca la opción de copia');
                  return;
                }
                
                setEnviandoEmail(true);
                
                try {
                  // Generar el HTML del parte
                  const parteHTML = generarParteHTML(pedidoSeleccionado);
                  
                  const response = await fetch(`${baseUrl}/enviar-email-parte`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${publicAnonKey}`
                    },
                    body: JSON.stringify({
                      destinatario: emailData.destinatario,
                      cc: emailData.copiaCoordinador && emailData.emailCoordinador.trim() ? emailData.emailCoordinador.trim() : null,
                      asunto: emailData.asunto,
                      mensaje: emailData.mensaje,
                      parteHTML,
                      pedido: {
                        cliente: pedidoSeleccionado.cliente,
                        fecha: new Date(pedidoSeleccionado.diaEvento).toLocaleDateString('es-ES'),
                        diaEvento: pedidoSeleccionado.diaEvento,
                        lugar: pedidoSeleccionado.lugar,
                        horaEntrada: pedidoSeleccionado.horaEntrada,
                        horaEntrada2: pedidoSeleccionado.horaEntrada2,
                        asignaciones: pedidoSeleccionado.asignaciones || []
                      }
                    })
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    setShowEmailModal(false);
                    alert('✅ Email enviado correctamente con parte de servicio adjunto en PDF');
                  } else {
                    alert(`❌ Error al enviar email: ${result.error || 'Error desconocido'}`);
                  }
                } catch (error) {
                  console.log('Error al enviar email:', error);
                  alert('❌ Error al enviar el email. Por favor, intenta nuevamente.');
                } finally {
                  setEnviandoEmail(false);
                }
              }}
              className="p-6 space-y-5"
            >
              {/* Destinatario */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <AtSign className="w-4 h-4 text-gray-500" />
                  <span>Destinatario *</span>
                </label>
                <input
                  type="email"
                  value={emailData.destinatario}
                  onChange={(e) => setEmailData({ ...emailData, destinatario: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
                {emailData.destinatario && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Emails del cliente agregados automáticamente
                  </p>
                )}
                {!emailData.destinatario && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    El cliente no tiene emails registrados
                  </p>
                )}
              </div>

              {/* Asunto */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Asunto *</span>
                </label>
                <input
                  type="text"
                  value={emailData.asunto}
                  onChange={(e) => setEmailData({ ...emailData, asunto: e.target.value })}
                  placeholder="Asunto del correo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Mensaje */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span>Mensaje</span>
                </label>
                <textarea
                  value={emailData.mensaje}
                  onChange={(e) => setEmailData({ ...emailData, mensaje: e.target.value })}
                  placeholder="Mensaje opcional que acompañará al parte..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">El parte se enviará como documento adjunto al email</p>
              </div>

              {/* Copia al coordinador */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={emailData.copiaCoordinador}
                    onChange={(e) => setEmailData({ ...emailData, copiaCoordinador: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                      Enviar copia al coordinador
                    </span>
                  </div>
                </label>
                
                {emailData.copiaCoordinador && (
                  <div className="mt-3 ml-8 animate-in slide-in-from-top-2 duration-200">
                    <input
                      type="email"
                      value={emailData.emailCoordinador}
                      onChange={(e) => setEmailData({ ...emailData, emailCoordinador: e.target.value })}
                      placeholder="coordinador@correo.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={emailData.copiaCoordinador}
                    />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  disabled={enviandoEmail}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={enviandoEmail}
                >
                  {enviandoEmail ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}