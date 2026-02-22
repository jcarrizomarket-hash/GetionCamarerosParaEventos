export function htmlFichajeOk({ accion, camareroNombre, clienteNombre, lugar, fechaStr, horaStr, horaEntradaPrevista, horaSalidaPrevista, fichajeUrl }: any) {
  const esEntrada = accion === 'entrada';
  const esCompleto = accion === 'ya_completo';
  const color = esEntrada ? '#16a34a' : esCompleto ? '#6366f1' : '#dc2626';
  const bgColor = esEntrada ? '#f0fdf4' : esCompleto ? '#eef2ff' : '#fef2f2';
  const borderColor = esEntrada ? '#bbf7d0' : esCompleto ? '#c7d2fe' : '#fecaca';
  const icon = esEntrada ? '🟢' : esCompleto ? '✅' : '🔴';
  const titulo = esEntrada ? '¡Entrada registrada!' : esCompleto ? 'Fichaje completo' : '¡Salida registrada!';
  const subtitulo = esEntrada
    ? 'Escaneá este QR de nuevo cuando salgas del evento.'
    : esCompleto
    ? 'Entrada y salida ya registradas. Gracias.'
    : 'Tu salida ha sido registrada correctamente.';

  // Solo mostrar el QR en la pantalla de entrada — para que vuelvan a escanearlo al salir
  const mostrarQR = esEntrada && fichajeUrl;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fichaje · \${clienteNombre}</title>
  \${mostrarQR ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>' : ''}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: \${bgColor}; display: flex; justify-content: center; min-height: 100vh; padding: 1.5rem; }
    .card { background: white; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); max-width: 420px; width: 100%; overflow: hidden; border-top: 6px solid \${color}; height: fit-content; margin: auto; }
    .header { padding: 1.75rem; text-align: center; background: \${bgColor}; border-bottom: 1px solid \${borderColor}; }
    .icon { font-size: 3.25rem; margin-bottom: 0.5rem; display: block; }
    .titulo { color: \${color}; font-size: 1.4rem; font-weight: 700; }
    .subtitulo { color: #6b7280; font-size: 0.875rem; margin-top: 4px; line-height: 1.4; }
    .body { padding: 1.25rem 1.5rem; }
    .hora-badge { background: \${bgColor}; border: 2px solid \${borderColor}; border-radius: 12px; padding: 0.875rem; text-align: center; margin-bottom: 1rem; }
    .hora-badge .label { color: #94a3b8; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
    .hora-badge .hora { color: \${color}; font-size: 2rem; font-weight: 800; font-family: 'Courier New', monospace; letter-spacing: 0.05em; }
    .info { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .info-row { display: flex; gap: 0.625rem; align-items: flex-start; padding: 0.5rem 0.625rem; background: #f8fafc; border-radius: 8px; }
    .info-row .emoji { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
    .info-row .label { color: #9ca3af; font-size: 0.7rem; display: block; }
    .info-row .value { color: #1f2937; font-weight: 600; font-size: 0.875rem; }
    /* QR section */
    .qr-section { border: 2px dashed \${borderColor}; border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1rem; background: #fafafa; }
    .qr-section .qr-label { color: #374151; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.75rem; }
    .qr-section .qr-sub { color: #9ca3af; font-size: 0.75rem; margin-top: 0.625rem; }
    #qrcode { display: inline-block; padding: 8px; background: white; border-radius: 8px; }
    #qrcode canvas, #qrcode img { display: block; }
    .footer { padding: 0.875rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
    .footer p { color: #9ca3af; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="icon">\${icon}</span>
      <div class="titulo">\${titulo}</div>
      <div class="subtitulo">\${subtitulo}</div>
    </div>
    <div class="body">
      \${!esCompleto ? `
      <div class="hora-badge">
        <div class="label">\${esEntrada ? 'Hora de entrada' : 'Hora de salida'}</div>
        <div class="hora">\${horaStr}</div>
      </div>` : ''}

      <div class="info">
        <div class="info-row">
          <span class="emoji">👤</span>
          <div>
            <span class="label">Camarero</span>
            <span class="value">\${camareroNombre}</span>
          </div>
        </div>
        <div class="info-row">
          <span class="emoji">🏢</span>
          <div>
            <span class="label">Evento</span>
            <span class="value">\${clienteNombre}</span>
          </div>
        </div>
        <div class="info-row">
          <span class="emoji">📍</span>
          <div>
            <span class="label">Lugar</span>
            <span class="value">\${lugar}</span>
          </div>
        </div>
        <div class="info-row">
          <span class="emoji">📅</span>
          <div>
            <span class="label">Fecha</span>
            <span class="value">\${fechaStr}</span>
          </div>
        </div>
        \${horaEntradaPrevista ? `
        <div class="info-row">
          <span class="emoji">🕐</span>
          <div>
            <span class="label">Horario previsto</span>
            <span class="value">\${horaEntradaPrevista} – \${horaSalidaPrevista || '?'}</span>
          </div>
        </div>` : ''}
      </div>

      \${mostrarQR ? `
      <div class="qr-section">
        <div class="qr-label">📲 Escaneá al salir del evento</div>
        <div id="qrcode"></div>
        <div class="qr-sub">El mismo código registra tu salida</div>
      </div>` : ''}
    </div>
    <div class="footer">
      <p>Registro automático · Gestión de Eventos</p>
    </div>
  </div>
  \${mostrarQR ? `
  <script>
    new QRCode(document.getElementById("qrcode"), {
      text: "\${fichajeUrl}",
      width: 180,
      height: 180,
      colorDark: "#1f2937",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  <\/script>` : ''}
</body>
</html>`;
}


export function htmlFichajeError(msg: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error de fichaje</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #fef2f2; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1.5rem; }
    .card { background: white; border-radius: 16px; padding: 2rem; max-width: 380px; width: 100%; text-align: center; border-top: 5px solid #dc2626; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { color: #dc2626; font-size: 1.3rem; margin-bottom: 0.5rem; }
    p { color: #6b7280; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Error de fichaje</h1>
    <p>${msg}</p>
  </div>
</body>
</html>`;
}

// ================================================================
// CHATBOT WHATSAPP — COMUNICACIÓN CON CLIENTES
// ================================================================
// Menú principal:
//   1 → Solicitud de pedido (wizard por pasos)
//   2 → Contactar coordinador (derivación directa por teléfono)
//   3 → Comentario sobre evento (lista eventos pasados/futuros)
//   0 / "menu" / "hola" → reiniciar siempre
// ================================================================

const MENU_PRINCIPAL = `👋 ¡Hola! Soy el asistente de *Gestión de Eventos*.

¿En qué puedo ayudarte?

*1* — Solicitar un nuevo pedido
*2* — Contactar con tu coordinador
*3* — Dejar un comentario sobre un evento

Responde con el número de la opción.`;

// ── Enviar mensaje WhatsApp (texto libre) ──
async function enviarWA(telefono: string, texto: string) {
  const apiKey  = Deno.env.get('WHATSAPP_API_KEY');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
  if (!apiKey || !phoneId) { console.error('WhatsApp no configurado'); return; }
  let num = telefono.replace(/\D/g, '');
  if (num.length === 9) num = '34' + num;
  const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to: num, type: 'text',
      text: { body: texto, preview_url: false }
    })
  });
  if (!res.ok) console.error('WA send error:', await res.text());
  else console.error(`✅ WA → ${num}`);
}

// ── Buscar cliente por teléfono ──
async function buscarClientePorTel(telefono: string): Promise<any | null> {
  const clientes = await kv.getByPrefix('cliente:');
  const num = telefono.replace(/\D/g, '');
  return clientes.find((c: any) => {
    const t1 = (c.telefono1 || '').replace(/\D/g, '');
    const t2 = (c.telefono2 || '').replace(/\D/g, '');
    return t1 === num || t2 === num || t1.slice(-9) === num.slice(-9) || t2.slice(-9) === num.slice(-9);
  }) || null;
}

// ── Buscar coordinador del cliente (pedido más reciente) ──
async function buscarCoordinadorCliente(clienteNombre: string): Promise<{ coordinadorId: string; coordinador: any; pedido: any } | null> {
  const pedidos = await kv.getByPrefix('pedido:');
  const pedido = pedidos
    .filter((p: any) => p.cliente === clienteNombre && p.coordinadorId)
    .sort((a: any, b: any) => new Date(b.diaEvento).getTime() - new Date(a.diaEvento).getTime())[0];
  if (!pedido) return null;
  const coordinador = await kv.get(pedido.coordinadorId);
  return coordinador ? { coordinadorId: pedido.coordinadorId, coordinador, pedido } : null;
}

// ── Verificación del webhook Meta ──
app.get('/make-server-25b11ac0/whatsapp-webhook', async (c) => {
  const mode      = c.req.query('hub.mode');
  const token     = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  const expected  = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'gestion-eventos-verify';
  
  // Debug — ver exactamente qué llega
  console.error(`🔍 Webhook verify — mode:"${mode}" token:"${token}" expected:"${expected}" challenge:"${challenge}"`);
  
  // Comparar limpiando espacios por si acaso
  const tokenClean    = (token || '').trim();
  const expectedClean = (expected || '').trim();
  
  if (mode === 'subscribe' && tokenClean === expectedClean) {
    console.error('✅ WhatsApp webhook verificado OK');
    return c.text(challenge || '', 200);
  }
  console.error(`❌ Verificación fallida — token recibido: "${tokenClean}" esperado: "${expectedClean}"`);
  return c.text('Forbidden', 403);
});

// ── Recepción de mensajes entrantes ──
app.post('/make-server-25b11ac0/whatsapp-webhook', async (c) => {
  try {
    const body     = await c.req.json();
    const msg      = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return c.json({ status: 'no_message' });

    const telefono = msg.from;
    const textoRaw = (msg.text?.body || '').trim();
    const texto    = textoRaw.toLowerCase().trim();
    console.error(`📥 WA de ${telefono}: "${textoRaw}"`);

    const sesionKey = `chatbot-sesion:${telefono}`;
    const sesion    = await kv.get(sesionKey) || { paso: 'menu' };
    const save      = async (datos: any) => kv.set(sesionKey, { ...datos, ts: Date.now() });

    // Comandos globales → volver al menú siempre
    if (['0','menu','hola','hi','inicio','start','ayuda','help'].includes(texto)) {
      await save({ paso: 'menu' });
      await enviarWA(telefono, MENU_PRINCIPAL);
      return c.json({ status: 'ok' });
    }

    switch (sesion.paso) {

      // ══════════════════════════════════════════
      // MENÚ PRINCIPAL
      // ══════════════════════════════════════════
      case 'menu':
      default: {
        if (texto === '1') {
          await save({ paso: 'pedido_cliente' });
          await enviarWA(telefono,
            `📋 *Nuevo pedido*\n\n` +
            `Vamos a registrar tu solicitud paso a paso.\n\n` +
            `¿Cuál es el *nombre de tu empresa o cliente*?`
          );
        } else if (texto === '2') {
          await save({ paso: 'coordinador_derivando' });
          await chatbotDerivacionCoordinador(telefono, sesionKey);
        } else if (texto === '3') {
          await save({ paso: 'comentario_tipo' });
          await enviarWA(telefono,
            `💬 *Comentario sobre un evento*\n\n` +
            `¿El evento es pasado o futuro?\n\n` +
            `*1* — Evento pasado\n` +
            `*2* — Evento futuro\n\n` +
            `_(Escribe 0 para volver al menú)_`
          );
        } else {
          await save({ paso: 'menu' });
          await enviarWA(telefono, `No entendí tu respuesta. 😊\n\n${MENU_PRINCIPAL}`);
        }
        break;
      }

      // ══════════════════════════════════════════
      // FLUJO 1: PEDIDO (campos exactos solicitados)
      // ══════════════════════════════════════════

      case 'pedido_cliente': {
        await save({ paso: 'pedido_lugar', cliente: textoRaw });
        await enviarWA(telefono, `📍 ¿Cuál es el *lugar del evento*?\n_(Nombre del local o espacio)_`);
        break;
      }
      case 'pedido_lugar': {
        await save({ ...sesion, paso: 'pedido_ubicacion', lugarEvento: textoRaw });
        await enviarWA(telefono,
          `🗺 ¿Cuál es la *ubicación del evento*?\n\n` +
          `Por favor pegá el link de Google Maps.\n` +
          `_(Abrí Google Maps, buscá la dirección y copiá el enlace)_`
        );
        break;
      }
      case 'pedido_ubicacion': {
        await save({ ...sesion, paso: 'pedido_dia', ubicacion: textoRaw });
        await enviarWA(telefono,
          `📅 ¿Cuál es el *día del evento*?\n\n` +
          `_(Ej: 15 de marzo de 2025 o 15/03/2025)_`
        );
        break;
      }
      case 'pedido_dia': {
        await save({ ...sesion, paso: 'pedido_hora_entrada1', diaEvento: textoRaw });
        await enviarWA(telefono,
          `🕐 ¿Cuál es la *hora de entrada del primer turno*?\n_(Ej: 19:00)_`
        );
        break;
      }
      case 'pedido_hora_entrada1': {
        await save({ ...sesion, paso: 'pedido_hora_entrada2', horaEntrada1: textoRaw });
        await enviarWA(telefono,
          `🕑 ¿Hay un *segundo turno de entrada*?\n\n` +
          `Si lo hay, indicá la hora. Si no, escribe *no*.`
        );
        break;
      }
      case 'pedido_hora_entrada2': {
        const tieneSegundoTurno = !['no','n','ninguno','no hay'].includes(texto);
        await save({ ...sesion, paso: 'pedido_camisa', horaEntrada2: tieneSegundoTurno ? textoRaw : '' });
        await enviarWA(telefono,
          `👔 ¿Color de *camisa* para el servicio?\n\n` +
          `*1* — Negra\n` +
          `*2* — Blanca`
        );
        break;
      }
      case 'pedido_camisa': {
        const camisa = texto === '2' ? 'blanca' : 'negra';
        await save({ ...sesion, paso: 'pedido_barcelona', camisa });
        await enviarWA(telefono,
          `📍 ¿El evento es *dentro de Barcelona ciudad*?\n\n` +
          `*1* — Sí\n` +
          `*2* — No`
        );
        break;
      }
      case 'pedido_barcelona': {
        const enBarcelona = texto === '1' || texto === 'si' || texto === 'sí';
        await save({ ...sesion, paso: 'pedido_notas', enBarcelona });
        await enviarWA(telefono,
          `📝 ¿Alguna *nota adicional*?\n\n` +
          `_(Detalles especiales, instrucciones, alergias, dress code extra...)_\n\n` +
          `Si no tenés notas, escribe *no*.`
        );
        break;
      }
      case 'pedido_notas': {
        const notas = ['no','n','ninguna','sin notas'].includes(texto) ? '' : textoRaw;

        // Guardar solicitud completa
        const solicitudId = `solicitud-chatbot:${Date.now()}`;
        const solicitud = {
          id: solicitudId,
          telefonoCliente: telefono,
          cliente:        sesion.cliente,
          lugarEvento:    sesion.lugarEvento,
          ubicacion:      sesion.ubicacion,
          diaEvento:      sesion.diaEvento,
          horaEntrada1:   sesion.horaEntrada1,
          horaEntrada2:   sesion.horaEntrada2 || '',
          camisa:         sesion.camisa,
          enBarcelona:    sesion.enBarcelona,
          notas,
          creadoEn:       new Date().toISOString(),
          estado:         'pendiente',
          origen:         'chatbot_whatsapp',
        };
        await kv.set(solicitudId, solicitud);

        // Notificar a todos los coordinadores
        const coordsAll = await kv.getByPrefix('coordinador:');
        const msgNuevaSol =
          `🆕 NUEVA SOLICITUD VÍA WHATSAPP\n\n` +
          `👤 Cliente: ${solicitud.cliente}\n` +
          `📍 Lugar: ${solicitud.lugarEvento}\n` +
          `🗺 Ubicación: ${solicitud.ubicacion}\n` +
          `📅 Día: ${solicitud.diaEvento}\n` +
          `🕐 Entrada 1: ${solicitud.horaEntrada1}\n` +
          (solicitud.horaEntrada2 ? `🕑 Entrada 2: ${solicitud.horaEntrada2}\n` : '') +
          `👔 Camisa: ${solicitud.camisa}\n` +
          `📍 Barcelona: ${solicitud.enBarcelona ? 'Sí' : 'No'}\n` +
          (notas ? `📝 Notas: ${notas}\n` : '') +
          `📱 WhatsApp: +${telefono}`;
        for (const co of coordsAll) { if (co?.id) notificarCoordinador(co.id, msgNuevaSol).catch(() => {}); }

        await save({ paso: 'menu' });
        await enviarWA(telefono,
          `✅ *¡Solicitud registrada correctamente!*\n\n` +
          `📋 *Resumen:*\n` +
          `👤 ${solicitud.cliente}\n` +
          `📍 ${solicitud.lugarEvento}\n` +
          `📅 ${solicitud.diaEvento}\n` +
          `🕐 Entrada: ${solicitud.horaEntrada1}` +
          (solicitud.horaEntrada2 ? ` / ${solicitud.horaEntrada2}` : '') + `\n` +
          `👔 Camisa ${solicitud.camisa}\n` +
          `📍 Barcelona: ${solicitud.enBarcelona ? 'Sí' : 'No'}\n\n` +
          `Un coordinador se pondrá en contacto contigo en breve.\n\n` +
          `Escribe *0* para volver al menú.`
        );
        break;
      }

      // ══════════════════════════════════════════
      // FLUJO 2: COORDINADOR (derivación directa)
      // manejado por chatbotDerivacionCoordinador()
      // ══════════════════════════════════════════
      case 'coordinador_derivando': {
        // No debería llegar aquí — la función maneja el estado
        await save({ paso: 'menu' });
        break;
      }

      // ══════════════════════════════════════════
      // FLUJO 3: COMENTARIO CON LISTA DE EVENTOS
      // ══════════════════════════════════════════

      case 'comentario_tipo': {
        // El cliente eligió tipo: 1=pasado, 2=futuro
        if (texto !== '1' && texto !== '2') {
          await enviarWA(telefono, `Por favor respondé *1* para evento pasado o *2* para evento futuro.\n\nEscribí *0* para volver al menú.`);
          break;
        }
        const esPasado = texto === '1';
        await save({ ...sesion, paso: 'comentario_lista', tipoPeriodo: esPasado ? 'pasado' : 'futuro' });
        await chatbotMostrarEventos(telefono, sesionKey, sesion, esPasado);
        break;
      }

      case 'comentario_lista': {
        // El cliente eligió un número de evento de la lista
        const idx = parseInt(textoRaw) - 1;
        const eventos: any[] = sesion.eventosLista || [];
        if (isNaN(idx) || idx < 0 || idx >= eventos.length) {
          const lista = eventos.map((e: any, i: number) => `*${i+1}* — ${new Date(e.diaEvento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · ${e.cliente}`).join('\n');
          await enviarWA(telefono,
            `Por favor respondé con el *número* del evento.\n\n${lista}\n\nEscribí *0* para volver al menú.`
          );
          break;
        }
        const eventoElegido = eventos[idx];
        await save({ ...sesion, paso: 'comentario_texto', eventoElegido });
        const fechaStr = new Date(eventoElegido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        await enviarWA(telefono,
          `📝 *${eventoElegido.cliente}* — ${fechaStr}\n\n` +
          `Escribí tu comentario o valoración sobre este evento.\n\n` +
          `_(Podés incluir aspectos positivos, mejoras, sugerencias...)_`
        );
        break;
      }

      case 'comentario_texto': {
        const comentarioId = `comentario-chatbot:${Date.now()}`;
        const evento = sesion.eventoElegido || {};
        const comentario = {
          id: comentarioId,
          telefonoCliente: telefono,
          pedidoId:        evento.id || '',
          nombreEvento:    evento.cliente || 'Desconocido',
          lugarEvento:     evento.lugar || '',
          diaEvento:       evento.diaEvento || '',
          coordinadorId:   evento.coordinadorId || '',
          comentario:      textoRaw,
          tipoPeriodo:     sesion.tipoPeriodo || 'pasado',
          creadoEn:        new Date().toISOString(),
          leido:           false,
          origen:          'chatbot_whatsapp',
        };
        await kv.set(comentarioId, comentario);

        // Notificar al coordinador asignado al evento (si existe)
        if (evento.coordinadorId) {
          const fechaStr = new Date(evento.diaEvento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
          await notificarCoordinador(evento.coordinadorId,
            `💬 NUEVO COMENTARIO DE CLIENTE\n\n` +
            `📋 Evento: ${evento.cliente}\n` +
            `📅 Fecha: ${fechaStr}\n` +
            `📍 Lugar: ${evento.lugar || ''}\n` +
            `📱 De: +${telefono}\n\n` +
            `"${textoRaw}"`
          ).catch(() => {});
        } else {
          // Si no hay coordinador, notificar a todos
          const coordsAll = await kv.getByPrefix('coordinador:');
          for (const co of coordsAll) { if (co?.id) notificarCoordinador(co.id, `💬 Comentario de cliente: "${textoRaw}"`).catch(() => {}); }
        }

        await save({ paso: 'menu' });
        await enviarWA(telefono,
          `🙏 *¡Gracias por tu comentario!*\n\n` +
          `Tu opinión sobre *${evento.cliente || 'el evento'}* fue enviada al coordinador.\n\n` +
          `Escribí *0* para volver al menú.`
        );
        break;
      }
    }

    return c.json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Error en webhook WA:', error);
    return c.json({ status: 'error' }, 500);
  }
});

// ── Helper: derivación directa al coordinador ──
async function chatbotDerivacionCoordinador(telefono: string, sesionKey: string) {
  try {
    const cliente = await buscarClientePorTel(telefono);
    if (!cliente) {
      await kv.set(sesionKey, { paso: 'menu', ts: Date.now() });
      await enviarWA(telefono,
        `No encontramos tu número en nuestra base de datos.\n\n` +
        `Por favor contactanos directamente.\n\n` +
        `Escribe *0* para volver al menú.`
      );
      return;
    }
    const resultado = await buscarCoordinadorCliente(cliente.nombre);
    if (!resultado) {
      await kv.set(sesionKey, { paso: 'menu', ts: Date.now() });
      await enviarWA(telefono,
        `No encontramos un coordinador asignado a tus eventos.\n` +
        `Escribe *0* para volver al menú.`
      );
      return;
    }
    const { coordinadorId, coordinador, pedido } = resultado;
    const fechaEvento = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    // Notificar al coordinador con todos los datos del cliente
    await notificarCoordinador(coordinadorId,
      `📱 CLIENTE QUIERE CONTACTARTE (VÍA CHATBOT)\n\n` +
      `👤 Cliente: ${cliente.nombre}\n` +
      `📱 WhatsApp: +${telefono}\n` +
      `📋 Último evento: ${pedido.cliente} — ${fechaEvento}\n\n` +
      `El cliente solicitó contacto contigo desde el chatbot. Podés escribirle directamente a este número.`
    );

    await kv.set(sesionKey, { paso: 'menu', ts: Date.now() });
    await enviarWA(telefono,
      `📞 *¡Listo!*\n\n` +
      `Tu coordinador *${coordinador.nombre}* fue notificado y se pondrá en contacto contigo a la brevedad.\n\n` +
      `Escribe *0* si necesitás algo más.`
    );
  } catch (e) {
    console.error('Error en derivación coordinador:', e);
    await enviarWA(telefono, `Ocurrió un error. Por favor intentá más tarde.`);
  }
}

// ── Helper: mostrar lista de eventos del cliente para comentario ──
async function chatbotMostrarEventos(telefono: string, sesionKey: string, sesion: any, esPasado: boolean) {
  try {
    const cliente = await buscarClientePorTel(telefono);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let eventos: any[] = [];

    if (cliente) {
      // Cliente identificado — mostrar sus eventos específicos
      const pedidos = await kv.getByPrefix('pedido:');
      eventos = pedidos
        .filter((p: any) => {
          if (p.cliente !== cliente.nombre) return false;
          const fecha = new Date(p.diaEvento);
          return esPasado ? fecha < hoy : fecha >= hoy;
        })
        .sort((a: any, b: any) => {
          const da = new Date(a.diaEvento).getTime();
          const db = new Date(b.diaEvento).getTime();
          return esPasado ? db - da : da - db; // pasados: más reciente primero; futuros: próximo primero
        })
        .slice(0, 10);
    }

    if (eventos.length === 0) {
      const tipoTexto = esPasado ? 'pasados' : 'futuros';
      await kv.set(sesionKey, { paso: 'menu', ts: Date.now() });
      await enviarWA(telefono,
        `No encontramos eventos ${tipoTexto} asociados a tu número.\n\n` +
        `Escribe *0* para volver al menú.`
      );
      return;
    }

    // Guardar lista en sesión para validar la respuesta del cliente
    await kv.set(sesionKey, { ...sesion, paso: 'comentario_lista', eventosLista: eventos, ts: Date.now() });

    const tipoLabel = esPasado ? 'pasados' : 'próximos';
    const lista = eventos
      .map((e: any, i: number) => {
        const fecha = new Date(e.diaEvento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        return `*${i + 1}* — ${fecha}\n     ${e.cliente}${e.lugar ? ` · ${e.lugar}` : ''}`;
      })
      .join('\n\n');

    await enviarWA(telefono,
      `📋 *Tus eventos ${tipoLabel}:*\n\n${lista}\n\n` +
      `Respondé con el *número* del evento sobre el que querés dejar un comentario.\n\n` +
      `Escribe *0* para volver al menú.`
    );
  } catch (e) {
    console.error('Error mostrando eventos:', e);
    await enviarWA(telefono, `Ocurrió un error al cargar los eventos. Intentá más tarde.`);
  }
}

// ── Endpoints para la APP — leer solicitudes y comentarios ──
app.get('/make-server-25b11ac0/chatbot-solicitudes', async (c) => {
  try {
    const data = (await kv.getByPrefix('solicitud-chatbot:'))
      .sort((a: any, b: any) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
    return c.json({ success: true, data });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.get('/make-server-25b11ac0/chatbot-comentarios', async (c) => {
  try {
    const data = (await kv.getByPrefix('comentario-chatbot:'))
      .sort((a: any, b: any) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
    return c.json({ success: true, data });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.put('/make-server-25b11ac0/chatbot-solicitudes/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { estado, nota } = await c.req.json();
    const sol = await kv.get(id);
    if (!sol) return c.json({ success: false, error: 'No encontrada' }, 404);
    const updated = { ...sol, estado: estado || 'gestionada', nota, gestionadaEn: new Date().toISOString() };
    await kv.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});

app.put('/make-server-25b11ac0/chatbot-comentarios/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const com = await kv.get(id);
    if (!com) return c.json({ success: false, error: 'No encontrado' }, 404);
    const updated = { ...com, leido: true, leidoEn: new Date().toISOString() };
    await kv.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
});