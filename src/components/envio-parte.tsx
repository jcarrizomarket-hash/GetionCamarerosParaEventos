import { useState, useMemo, useEffect } from 'react';
import { Mail, Eye, Send, CheckCircle, Clock, AlertCircle, X, FileText, User, AtSign, MessageSquare, Printer } from 'lucide-react';

// v2.0.0 - Lista automática de partes listos para enviar (todos confirmados)
export function EnvioParte({ pedidos, camareros, coordinadores, clientes, baseUrl, publicAnonKey, cargarDatos }) {

  const [previewPedido, setPreviewPedido]   = useState(null);
  const [emailPedido,   setEmailPedido]     = useState(null);
  const [enviandoId,    setEnviandoId]      = useState(null);
  const [enviados,      setEnviados]        = useState({});   // pedidoId -> {fechaEnvio, destinatario}
  const [emailData,     setEmailData]       = useState({ destinatario: '', asunto: '', mensaje: '', copiaCoordinador: false, emailCoordinador: '' });

  // Deduplicar
  const uniquePedidos  = useMemo(() => Array.from(new Map(pedidos.map(p  => [p.id,  p])).values()), [pedidos]);
  const uniqueClientes = useMemo(() => Array.from(new Map(clientes.map(c => [c.id, c])).values()), [clientes]);

  // Cargar partes ya enviados desde servidor al montar
  useEffect(() => {
    const cargarEnviados = async () => {
      try {
        const res = await fetch(`${baseUrl}/partes-enviados`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        });
        const data = await res.json();
        if (data.success) setEnviados(data.enviados || {});
      } catch (err) {
        console.error('Error al cargar partes enviados:', err);
      }
    };
    cargarEnviados();
  }, [baseUrl, publicAnonKey]);

  // Polling cada 15s para detectar nuevos eventos confirmados
  useEffect(() => {
    if (!cargarDatos) return;
    const polling = setInterval(cargarDatos, 15000);
    return () => clearInterval(polling);
  }, [cargarDatos]);

  // Solo pedidos donde TODOS los camareros están confirmados
  const partesListos = useMemo(() => uniquePedidos.filter(p => {
    const asigs = p.asignaciones || [];
    if (asigs.length === 0) return false;
    return asigs.every(a => a.estado === 'confirmado');
  }).sort((a, b) => new Date(a.diaEvento) - new Date(b.diaEvento)), [uniquePedidos]);

  // Buscar email del cliente
  const getEmailCliente = (nombreCliente) => {
    const c = uniqueClientes.find(cl => cl.nombre === nombreCliente);
    const emails = [c?.mail1, c?.mail2].filter(Boolean);
    return emails.join(', ');
  };

  // Generar HTML del parte (para preview y envío)
  const generarParteHTML = (pedido) => {
    const asigs = pedido.asignaciones || [];
    const filasVacias = Math.max(0, 8 - asigs.length);
    const filasVaciasHTML = Array.from({ length: filasVacias }, () => `
      <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    `).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      body{font-family:Arial,sans-serif;margin:0;padding:20px}
      .parte{max-width:800px;margin:0 auto;border:2px solid #333;padding:30px}
      h1{text-align:center;font-size:24px;margin-bottom:30px;border-bottom:3px solid #333;padding-bottom:10px}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
      .info-row{margin-bottom:10px}
      .label{display:inline-block;width:150px;font-weight:bold}
      .value{border-bottom:1px solid #333;display:inline-block;min-width:200px;padding:2px 8px}
      table{width:100%;border-collapse:collapse;margin-bottom:40px}
      th,td{border:2px solid #333;padding:10px;text-align:left}
      th{background-color:#f0f0f0;font-weight:bold}
    </style></head><body>
      <div class="parte">
        <h1>PARTE DE SERVICIO</h1>
        <div class="info-grid">
          <div>
            <div class="info-row"><span class="label">Cliente:</span><span class="value">${pedido.cliente}</span></div>
            <div class="info-row"><span class="label">Día:</span><span class="value">${new Date(pedido.diaEvento).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span></div>
          </div>
          <div>
            <div class="info-row"><span class="label">Lugar:</span><span class="value">${pedido.lugar}</span></div>
            <div class="info-row"><span class="label">Hora entrada:</span><span class="value">${pedido.horaEntrada}${pedido.horaEntrada2 ? ' / '+pedido.horaEntrada2 : ''}</span></div>
          </div>
        </div>
        <table>
          <thead><tr><th>Camarero</th><th>Hora Entrada</th><th>Hora Salida</th><th>Total</th><th>Observaciones</th></tr></thead>
          <tbody>
            ${asigs.map(a => `<tr>
              <td>#${a.camareroNumero} - ${a.camareroNombre}</td>
              <td>${pedido.horaEntrada}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
            </tr>`).join('')}
            ${filasVaciasHTML}
          </tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-top:40px">
          <div style="border:2px solid #333;padding:20px;width:300px;text-align:center">
            <p>Firma del Responsable</p>
            <div style="border-top:1px solid #333;margin-top:80px"></div>
          </div>
        </div>
      </div>
    </body></html>`;
  };

  // Abrir modal de email para un pedido
  const abrirModalEmail = (pedido) => {
    const emailCliente = getEmailCliente(pedido.cliente);
    const fecha = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setEmailData({
      destinatario: emailCliente,
      asunto: `Parte de Servicio - ${pedido.cliente} - ${new Date(pedido.diaEvento).toLocaleDateString('es-ES')}`,
      mensaje: `Estimado/a,\n\nAdjunto el parte de servicio para el evento.\n\nCliente: ${pedido.cliente}\nFecha: ${fecha}\nLugar: ${pedido.lugar}\nHora de entrada: ${pedido.horaEntrada}\n\nSaludos cordiales.`,
      copiaCoordinador: false,
      emailCoordinador: ''
    });
    setEmailPedido(pedido);
  };

  // Enviar email
  const enviarEmail = async (e) => {
    e.preventDefault();
    if (!emailPedido) return;
    if (!emailData.destinatario) { alert('El cliente no tiene email registrado'); return; }

    setEnviandoId(emailPedido.id);
    try {
      const parteHTML = generarParteHTML(emailPedido);
      const response = await fetch(`${baseUrl}/enviar-email-parte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({
          destinatario: emailData.destinatario,
          cc: emailData.copiaCoordinador && emailData.emailCoordinador ? emailData.emailCoordinador : null,
          asunto: emailData.asunto,
          mensaje: emailData.mensaje,
          parteHTML,
          pedido: {
            cliente: emailPedido.cliente,
            fecha: new Date(emailPedido.diaEvento).toLocaleDateString('es-ES'),
            diaEvento: emailPedido.diaEvento,
            lugar: emailPedido.lugar,
            horaEntrada: emailPedido.horaEntrada,
            horaEntrada2: emailPedido.horaEntrada2,
            asignaciones: emailPedido.asignaciones || []
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        // Persistir en servidor
        await fetch(`${baseUrl}/partes-enviados`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({
            pedidoId: emailPedido.id,
            fechaEnvio: new Date().toISOString(),
            destinatario: emailData.destinatario
          })
        }).catch(() => {});
        setEnviados(prev => ({ ...prev, [emailPedido.id]: { fechaEnvio: new Date().toISOString(), destinatario: emailData.destinatario } }));
        setEmailPedido(null);
        alert('✅ Parte enviado correctamente');
      } else {
        alert(`❌ Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (err) {
      alert('❌ Error al enviar. Revisá la consola.');
      console.error(err);
    } finally {
      setEnviandoId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Envío de Partes</h2>
          <p className="text-sm text-gray-500 mt-0.5">Solo se muestran los eventos con todos los camareros confirmados</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">{partesListos.length} {partesListos.length === 1 ? 'parte listo' : 'partes listos'}</span>
        </div>
      </div>

      {/* LISTA VACÍA */}
      {partesListos.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Clock className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay partes listos todavía</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Los partes aparecen aquí cuando todos los camareros de un evento han confirmado su asistencia.
          </p>
        </div>
      )}

      {/* LISTA DE PARTES */}
      <div className="space-y-3">
        {partesListos.map(pedido => {
          const emailCliente = getEmailCliente(pedido.cliente);
          const yaEnviado = !!enviados[pedido.id];
          const infoEnvio = enviados[pedido.id];
          const enviando  = enviandoId === pedido.id;
          const fecha = new Date(pedido.diaEvento);
          const diaStr = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
          const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const confirmados = pedido.asignaciones?.filter(a => a.estado === 'confirmado').length || 0;

          return (
            <div
              key={pedido.id}
              className={`bg-white rounded-xl border transition-all ${
                yaEnviado
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4 p-4">

                {/* FECHA */}
                <div className="flex-shrink-0 w-16 text-center bg-gray-100 rounded-lg py-2 px-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">{diaStr}</p>
                  <p className="text-lg font-bold text-gray-900 leading-none">{fecha.getDate()}</p>
                  <p className="text-xs text-gray-500">{fecha.toLocaleDateString('es-ES', { month: 'short' })}</p>
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 truncate">{pedido.cliente}</p>
                    {yaEnviado && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        <CheckCircle className="w-3 h-3" /> Enviado {infoEnvio?.fechaEnvio ? new Date(infoEnvio.fechaEnvio).toLocaleDateString('es-ES') : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">📍 {pedido.lugar} · 🕐 {pedido.horaEntrada}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-green-600 font-medium">✓ {confirmados} confirmados</span>
                    {emailCliente
                      ? <span className="text-xs text-gray-400">✉️ {emailCliente}</span>
                      : <span className="text-xs text-amber-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Sin email</span>
                    }
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewPedido(pedido)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Vista previa
                  </button>
                  <button
                    onClick={() => abrirModalEmail(pedido)}
                    disabled={enviando || !emailCliente}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      yaEnviado
                        ? 'text-green-700 bg-green-100 hover:bg-green-200'
                        : 'text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                    }`}
                    title={!emailCliente ? 'El cliente no tiene email registrado' : ''}
                  >
                    <Send className="w-4 h-4" />
                    {yaEnviado ? 'Reenviar' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL VISTA PREVIA */}
      {previewPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Vista previa — {previewPedido.cliente}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button
                  onClick={() => { setPreviewPedido(null); abrirModalEmail(previewPedido); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  <Send className="w-4 h-4" /> Enviar
                </button>
                <button onClick={() => setPreviewPedido(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <iframe
                srcDoc={generarParteHTML(previewPedido)}
                className="w-full rounded-lg border border-gray-200"
                style={{ height: '600px' }}
                title="Vista previa del parte"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL EMAIL */}
      {emailPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Enviar Parte por Email</h3>
              </div>
              <button onClick={() => setEmailPedido(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info del pedido */}
            <div className="mx-5 mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-500 uppercase mb-2">Parte a enviar</p>
              <p className="font-semibold text-gray-900">{emailPedido.cliente}</p>
              <p className="text-sm text-gray-600">{new Date(emailPedido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · {emailPedido.lugar}</p>
              <p className="text-sm text-gray-500 mt-1">{emailPedido.asignaciones?.length || 0} camareros confirmados</p>
            </div>

            {/* Formulario */}
            <form onSubmit={enviarEmail} className="p-5 space-y-4">

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <AtSign className="w-4 h-4" /> Destinatario *
                </label>
                <input
                  type="text"
                  value={emailData.destinatario}
                  onChange={e => setEmailData({ ...emailData, destinatario: e.target.value })}
                  placeholder="email@cliente.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {!emailData.destinatario && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Este cliente no tiene email registrado
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <FileText className="w-4 h-4" /> Asunto *
                </label>
                <input
                  type="text"
                  value={emailData.asunto}
                  onChange={e => setEmailData({ ...emailData, asunto: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare className="w-4 h-4" /> Mensaje
                </label>
                <textarea
                  value={emailData.mensaje}
                  onChange={e => setEmailData({ ...emailData, mensaje: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">El parte se adjunta como PDF automáticamente</p>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailData.copiaCoordinador}
                    onChange={e => setEmailData({ ...emailData, copiaCoordinador: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" /> Enviar copia al coordinador
                  </span>
                </label>
                {emailData.copiaCoordinador && (
                  <input
                    type="email"
                    value={emailData.emailCoordinador}
                    onChange={e => setEmailData({ ...emailData, emailCoordinador: e.target.value })}
                    placeholder="coordinador@correo.com"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={emailData.copiaCoordinador}
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailPedido(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  disabled={!!enviandoId}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={!!enviandoId}
                >
                  {enviandoId ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar Email</>
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
