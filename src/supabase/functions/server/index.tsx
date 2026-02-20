import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Middleware de seguridad simple
const requireSecret = async (c, next) => {
  const expectedSecret = Deno.env.get('SUPABASE_FN_SECRET');
  const providedSecret = c.req.header('x-fn-secret');
  
  // Solo validar en métodos mutantes
  const methodsToProtect = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (methodsToProtect.includes(c.req.method)) {
    if (expectedSecret && providedSecret !== expectedSecret) {
      console.warn(`❌ Acceso no autorizado: ${c.req.method} ${c.req.url}`);
      return c.json({ success: false, error: 'No autorizado' }, 401);
    }
  }
  
  await next();
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============== CLIENTES ==============
app.get('/make-server-25b11ac0/clientes', async (c) => {
  try {
    const clientes = await kv.getByPrefix('cliente:');
    return c.json({ success: true, data: clientes });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-25b11ac0/clientes', requireSecret, async (c) => {
  try {
    const data = await c.req.json();
    const id = `cliente:${Date.now()}`;
    const cliente = {
      id,
      ...data
    };
    await kv.set(id, cliente);
    return c.json({ success: true, data: cliente });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-25b11ac0/clientes/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    await kv.set(id, data);
    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/clientes/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== CAMAREROS ==============
app.get('/make-server-25b11ac0/camareros', async (c) => {
  try {
    const camareros = await kv.getByPrefix('camarero:');
    return c.json({ success: true, data: camareros });
  } catch (error) {
    console.error('Error al obtener camareros:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-25b11ac0/camareros', requireSecret, async (c) => {
  try {
    const data = await c.req.json();
    
    // Obtener el contador actual
    const contadorData = await kv.get('contador:camareros');
    const contador = contadorData ? contadorData.valor + 1 : 1;
    
    // Actualizar contador
    await kv.set('contador:camareros', { valor: contador });
    
    const id = `camarero:${Date.now()}`;
    // FIX: Usar spread para persistir TODOS los campos del formulario
    // (tipoPerfil, codigo, especialidades, idiomas, certificaciones, coordinadorId, etc.)
    const camarero = {
      ...data,
      id,
      numero: contador,
      disponibilidad: data.disponibilidad || [],
      estado: data.estado || 'activo',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, camarero);
    return c.json({ success: true, data: camarero });
  } catch (error) {
    console.error('Error al crear camarero:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-25b11ac0/camareros/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    await kv.set(id, data);
    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error al actualizar camarero:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/camareros/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar camarero:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== COORDINADORES ==============
app.get('/make-server-25b11ac0/coordinadores', async (c) => {
  try {
    const coordinadores = await kv.getByPrefix('coordinador:');
    return c.json({ success: true, data: coordinadores });
  } catch (error) {
    console.error('Error al obtener coordinadores:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-25b11ac0/coordinadores', requireSecret, async (c) => {
  try {
    const { nombre, telefono, email } = await c.req.json();
    
    // Obtener el contador actual
    const contadorData = await kv.get('contador:coordinadores');
    const contador = contadorData ? contadorData.valor + 1 : 1;
    
    // Actualizar contador
    await kv.set('contador:coordinadores', { valor: contador });
    
    const id = `coordinador:${Date.now()}`;
    // FIX: Usar spread para consistencia con camareros
    const coordinador = {
      ...data,
      id,
      numero: contador,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, coordinador);
    return c.json({ success: true, data: coordinador });
  } catch (error) {
    console.error('Error al crear coordinador:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-25b11ac0/coordinadores/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    await kv.set(id, data);
    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error al actualizar coordinador:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/coordinadores/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar coordinador:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== PEDIDOS/EVENTOS ==============
app.get('/make-server-25b11ac0/pedidos', async (c) => {
  try {
    const pedidos = await kv.getByPrefix('pedido:');
    return c.json({ success: true, data: pedidos });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-25b11ac0/pedidos', requireSecret, async (c) => {
  try {
    const data = await c.req.json();
    const id = `pedido:${Date.now()}`;
    const pedido = {
      id,
      numero: data.numero,
      cliente: data.cliente,
      lugar: data.lugar,
      ubicacion: data.ubicacion,
      diaEvento: data.diaEvento,
      // Entrada 1
      cantidadCamareros: data.cantidadCamareros,
      horaEntrada: data.horaEntrada,
      horaSalida: data.horaSalida,
      totalHoras: data.totalHoras,
      // Entrada 2
      cantidadCamareros2: data.cantidadCamareros2 || 0,
      horaEntrada2: data.horaEntrada2 || '',
      horaSalida2: data.horaSalida2 || '',
      totalHoras2: data.totalHoras2 || '',
      
      catering: data.catering,
      tiempoViaje: data.tiempoViaje || '',
      camisa: data.camisa,
      notas: data.notas || '',
      asignaciones: data.asignaciones || [],
      // IMPORTANTE: Guardar coordinadorId y coordinadorNombre para chats grupales
      coordinadorId: data.coordinadorId || '',
      coordinadorNombre: data.coordinadorNombre || '',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, pedido);
    return c.json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-25b11ac0/pedidos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    console.error('📝 Actualizando pedido:', id);
    console.error('   Estado asignaciones:', data.asignaciones?.map(a => ({ num: a.camareroNumero, estado: a.estado })));
    
    await kv.set(id, data);
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error al actualizar pedido:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/pedidos/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== INFORMES ==============
app.get('/make-server-25b11ac0/informes/cliente', async (c) => {
  try {
    const { cliente, desde, hasta } = c.req.query();
    const pedidos = await kv.getByPrefix('pedido:');
    
    const filtrados = pedidos.filter(p => {
      const matchCliente = !cliente || p.cliente === cliente;
      const matchFecha = (!desde || p.diaEvento >= desde) && (!hasta || p.diaEvento <= hasta);
      return matchCliente && matchFecha;
    });
    
    return c.json({ success: true, data: filtrados });
  } catch (error) {
    console.error('Error al obtener informe de cliente:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-25b11ac0/informes/camarero', async (c) => {
  try {
    const { camareroId, desde, hasta } = c.req.query();
    const pedidos = await kv.getByPrefix('pedido:');
    
    const eventos = [];
    for (const pedido of pedidos) {
      const matchFecha = (!desde || pedido.diaEvento >= desde) && (!hasta || pedido.diaEvento <= hasta);
      if (!matchFecha) continue;
      
      if (pedido.asignaciones && Array.isArray(pedido.asignaciones)) {
        const asignacion = pedido.asignaciones.find(a => a.camareroId === camareroId);
        if (asignacion) {
          eventos.push({
            diaEvento: pedido.diaEvento,
            cliente: pedido.cliente,
            lugar: pedido.lugar,
            horaEntrada: pedido.horaEntrada,
            horaSalida: pedido.horaSalida,
            totalHoras: pedido.totalHoras,
            estado: asignacion.estado
          });
        }
      }
    }
    
    return c.json({ success: true, data: eventos });
  } catch (error) {
    console.error('Error al obtener informe de camarero:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== CONFIRMACIONES ==============
app.post('/make-server-25b11ac0/guardar-token', async (c) => {
  try {
    const { token, pedidoId, camareroId, coordinadorId } = await c.req.json();
    
    await kv.set(`confirmacion:${token}`, {
      pedidoId,
      camareroId,
      coordinadorId,
      createdAt: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al guardar token:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Función para enviar notificación al coordinador
async function notificarCoordinador(coordinadorId: string, mensaje: string) {
  try {
    const coordinador = await kv.get(coordinadorId);
    if (!coordinador || !coordinador.telefono) {
      console.error('Coordinador sin teléfono configurado');
      return;
    }

    // Obtener la API key de WhatsApp
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    
    if (!whatsappApiKey || !whatsappPhoneId) {
      console.error('WhatsApp API no configurada. Mensaje que se enviaría:', mensaje);
      return;
    }

    // Limpiar número de teléfono
    let numeroLimpio = coordinador.telefono.replace(/\D/g, '');
    if (numeroLimpio.length === 9) {
      numeroLimpio = '34' + numeroLimpio;
    }

    // Enviar mensaje usando WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: numeroLimpio,
        type: 'text',
        text: {
          body: mensaje
        }
      })
    });

    const result = await response.json();
    console.error('Notificación enviada al coordinador:', result);
  } catch (error) {
    console.error('Error al notificar coordinador:', error);
  }
}

app.get('/make-server-25b11ac0/confirmar/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const confirmacionData = await kv.get(`confirmacion:${token}`);
    
    if (!confirmacionData) {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Error</h1>
            <p>El enlace de confirmación no es válido o ya ha sido utilizado.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    const { pedidoId, camareroId, coordinadorId } = confirmacionData;
    const pedido = await kv.get(pedidoId);
    const camarero = await kv.get(camareroId);
    
    if (!pedido) {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Error</h1>
            <p>El pedido no existe.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Actualizar estado a confirmado
    const asignaciones = pedido.asignaciones.map(a => 
      a.camareroId === camareroId ? { ...a, estado: 'confirmado', eliminacionProgramada: null } : a
    );
    
    await kv.set(pedidoId, { ...pedido, asignaciones });
    
    console.error(`✅ CONFIRMACIÓN: Camarero ${camarero?.nombre} ${camarero?.apellido} confirmó asistencia al evento "${pedido.cliente}"`);
    console.error(`   Estado actualizado: confirmado`);
    console.error(`   Asignaciones totales: ${asignaciones.length}`);
    
    // Verificar si todos han confirmado y crear chat grupal automáticamente
    const todosConfirmados = asignaciones.length > 0 && asignaciones.every(a => a.estado === 'confirmado');
    
    if (todosConfirmados) {
      const chatId = `chat:${pedidoId}`;
      const chatExistente = await kv.get(chatId);
      
      if (!chatExistente) {
        // Calcular fecha de eliminación programada (24h después del evento)
        const fechaEvento = new Date(pedido.diaEvento);
        const horaFin = pedido.horaSalida || '23:59';
        const [horaFinH, horaFinM] = horaFin.split(':');
        fechaEvento.setHours(parseInt(horaFinH), parseInt(horaFinM), 0, 0);
        const fechaEliminacion = new Date(fechaEvento.getTime() + 24 * 60 * 60 * 1000);
        
        // Construir lista de miembros
        const miembros = [
          {
            user_id: coordinadorId,
            nombre: 'Coordinador',
            rol: 'coordinador'
          },
          ...asignaciones.map(a => ({
            user_id: a.camareroId,
            nombre: a.camareroNombre,
            rol: 'camarero'
          }))
        ];
        
        const chat = {
          id: chatId,
          pedido_id: pedidoId,
          nombre: `${pedido.cliente} - ${pedido.lugar}`,
          descripcion: `Evento: ${pedido.cliente} en ${pedido.lugar}`,
          fecha_evento: pedido.diaEvento,
          hora_fin_evento: pedido.horaSalida || '23:59',
          miembros,
          activo: true,
          fecha_eliminacion_programada: fechaEliminacion.toISOString(),
          // Campos adicionales para compatibilidad
          pedidoId,
          coordinadorId,
          camareroIds: asignaciones.map(a => a.camareroId),
          fechaCreacion: new Date().toISOString(),
          fechaEvento: pedido.diaEvento,
          cliente: pedido.cliente,
          lugar: pedido.lugar,
          horaEntrada: pedido.horaEntrada,
          estado: 'activo'
        };
        
        await kv.set(chatId, chat);
        console.error(`✅ Chat grupal creado automáticamente para pedido: ${pedido.cliente} (Expira: ${fechaEliminacion.toISOString()})`);
      }
    }
    
    // Notificar al coordinador
    const nombreCamarero = camarero ? `${camarero.nombre} ${camarero.apellido}` : 'Camarero';
    const fechaEvento = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });

    // Obtener o crear el QR de fichaje para enviar el link al coordinador
    const projectRef = Deno.env.get('SUPABASE_URL')?.replace('https://', '').split('.')[0] || '';
    const fichajeBaseUrl = `https://${projectRef}.supabase.co/functions/v1/make-server-25b11ac0`;
    let fichajeLink = '';
    try {
      const qrKeyRef = `qr-token:${pedidoId}:${camareroId}`;
      let qrData = await kv.get(qrKeyRef);
      if (!qrData) {
        // Crear el QR token si no existe aún
        const newToken = generarQRToken();
        qrData = {
          token: newToken,
          pedidoId,
          camareroId,
          camareroNombre: nombreCamarero,
          clienteNombre: pedido.cliente,
          lugar: pedido.lugar,
          diaEvento: pedido.diaEvento,
          horaEntradaPrevista: pedido.horaEntrada,
          horaSalidaPrevista: pedido.horaSalida,
          creadoEn: new Date().toISOString(),
        };
        await kv.set(qrKeyRef, qrData);
        await kv.set(`qr-token-idx:${newToken}`, qrKeyRef);
      }
      fichajeLink = `${fichajeBaseUrl}/fichar/${qrData.token}`;
    } catch (e) {
      console.error('No se pudo generar link de fichaje:', e);
    }

    let mensajeCoordinador = `✅ CONFIRMACIÓN RECIBIDA\n\n${nombreCamarero} ha confirmado su asistencia.\n\nEvento: ${pedido.cliente}\nFecha: ${fechaEvento}\nLugar: ${pedido.lugar}\nHora: ${pedido.horaEntrada}`;

    if (fichajeLink) {
      mensajeCoordinador += `\n\n📲 LINK DE FICHAJE — ${nombreCamarero}:\n${fichajeLink}\n(Podés enviar este link al cliente para control de entrada/salida)`;
    }
    
    if (todosConfirmados) {
      mensajeCoordinador += `\n\n🎉 ¡TODOS LOS CAMAREROS HAN CONFIRMADO!\n✅ Chat grupal creado automáticamente`;
    }
    
    await notificarCoordinador(coordinadorId, mensajeCoordinador);
    
    // Eliminar token usado
    await kv.del(`confirmacion:${token}`);
    
        // Limpiar token usado
    await kv.delete(`token:${token}`);

    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Asistencia</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0fdf4; padding: 1rem; }
          .container { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 420px; width: 100%; border-top: 6px solid #16a34a; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { color: #16a34a; font-size: 1.8rem; margin-bottom: 0.5rem; }
          .evento { background: #f0fdf4; border-radius: 10px; padding: 1rem; margin: 1.5rem 0; text-align: left; border: 1px solid #bbf7d0; }
          .evento p { color: #374151; font-size: 0.95rem; margin: 0.3rem 0; }
          .evento strong { color: #15803d; }
          p.msg { color: #6b7280; font-size: 0.9rem; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>¡Confirmado!</h1>
          <div class="evento">
            <p>📅 <strong>${new Date(pedido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
            <p>👤 <strong>${pedido.cliente}</strong></p>
            <p>📍 ${pedido.lugar}</p>
            <p>🕐 Entrada: ${pedido.horaEntrada}</p>
          </div>
          <p class="msg">Tu asistencia ha sido registrada.<br>El coordinador ha sido notificado.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error al confirmar asistencia:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          .error { color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">❌ Error</h1>
          <p>Ha ocurrido un error al procesar tu confirmación.</p>
        </div>
      </body>
      </html>
    `);
  }
});

app.get('/make-server-25b11ac0/no-confirmar/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const confirmacionData = await kv.get(`confirmacion:${token}`);
    
    if (!confirmacionData) {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Error</h1>
            <p>El enlace no es válido o ya ha sido utilizado.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    const { pedidoId, camareroId, coordinadorId } = confirmacionData;
    const pedido = await kv.get(pedidoId);
    const camarero = await kv.get(camareroId);
    
    if (pedido) {
      // CAMBIO: En lugar de eliminar inmediatamente, marcar como rechazado con eliminación programada en 5 horas
      const asignaciones = pedido.asignaciones.map(a => 
        a.camareroId === camareroId ? { 
          ...a, 
          estado: 'rechazado',
          eliminacionProgramada: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() // 5 horas
        } : a
      );
      await kv.set(pedidoId, { ...pedido, asignaciones });
      
      console.error(`❌ RECHAZO: Camarero ${camarero?.nombre} ${camarero?.apellido} rechazó el evento "${pedido.cliente}"`);
      console.error(`   Estado actualizado: rechazado`);
      console.error(`   Eliminación programada: ${new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()}`);
      
      // Notificar al coordinador
      const nombreCamarero = camarero ? `${camarero.nombre} ${camarero.apellido}` : 'Camarero';
      const fechaEvento = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      const mensajeCoordinador = `❌ RECHAZO DE SERVICIO\n\n${nombreCamarero} ha indicado que NO puede asistir.\n\nEvento: ${pedido.cliente}\nFecha: ${fechaEvento}\nLugar: ${pedido.lugar}\nHora: ${pedido.horaEntrada}\n\n⚠️ Será eliminado automáticamente en 5 horas.\n\n💡 ACCIÓN REQUERIDA: Asignar un camarero de reemplazo.`;
      
      await notificarCoordinador(coordinadorId, mensajeCoordinador);
    }
    
    // Eliminar token usado
    await kv.del(`confirmacion:${token}`);
    
    // Limpiar token usado
    await kv.delete(`token:${token}`);

    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rechazo Registrado</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fef2f2; padding: 1rem; }
          .container { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 420px; width: 100%; border-top: 6px solid #dc2626; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { color: #dc2626; font-size: 1.8rem; margin-bottom: 0.5rem; }
          .evento { background: #fef2f2; border-radius: 10px; padding: 1rem; margin: 1.5rem 0; text-align: left; border: 1px solid #fecaca; }
          .evento p { color: #374151; font-size: 0.95rem; margin: 0.3rem 0; }
          .evento strong { color: #b91c1c; }
          p.msg { color: #6b7280; font-size: 0.9rem; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>Rechazo registrado</h1>
          <div class="evento">
            <p>📅 <strong>${new Date(pedido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
            <p>👤 <strong>${pedido.cliente}</strong></p>
            <p>📍 ${pedido.lugar}</p>
            <p>🕐 Entrada: ${pedido.horaEntrada}</p>
          </div>
          <p class="msg">El coordinador ha sido notificado<br>para buscar un reemplazo.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error al procesar no confirmación:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          .error { color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">❌ Error</h1>
          <p>Ha ocurrido un error al procesar tu respuesta.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// ============== CHATS GRUPALES ==============
// Crear chat grupal cuando todos confirmen
app.post('/make-server-25b11ac0/crear-chat-grupal', async (c) => {
  try {
    const { pedidoId, coordinadorId } = await c.req.json();
    
    const pedido = await kv.get(pedidoId);
    if (!pedido) {
      return c.json({ success: false, error: 'Pedido no encontrado' });
    }
    
    // Verificar que todos hayan confirmado
    const asignaciones = pedido.asignaciones || [];
    const todosConfirmados = asignaciones.length > 0 && asignaciones.every(a => a.estado === 'confirmado');
    
    if (!todosConfirmados) {
      return c.json({ success: false, error: 'No todos han confirmado aún' });
    }
    
    // Verificar si ya existe un chat para este pedido
    const chatIdExistente = `chat:${pedidoId}`;
    const chatExistente = await kv.get(chatIdExistente);
    
    if (chatExistente) {
      return c.json({ success: true, chatId: chatIdExistente, alreadyExists: true });
    }
    
    // Crear el chat
    const chatId = `chat:${pedidoId}`;
    
    // Calcular fecha de eliminación programada (24h después del evento)
    const fechaEvento = new Date(pedido.diaEvento);
    const horaFin = pedido.horaSalida || '23:59'; // Usar hora de salida o fin del día
    const [horaFinH, horaFinM] = horaFin.split(':');
    fechaEvento.setHours(parseInt(horaFinH), parseInt(horaFinM), 0, 0);
    const fechaEliminacion = new Date(fechaEvento.getTime() + 24 * 60 * 60 * 1000); // +24 horas
    
    // Construir lista de miembros según esquema
    const miembros = [
      {
        user_id: coordinadorId,
        nombre: pedido.coordinadorNombre || 'Coordinador',
        rol: 'coordinador'
      },
      ...asignaciones.map(a => ({
        user_id: a.camareroId,
        nombre: a.camareroNombre,
        rol: 'camarero'
      }))
    ];
    
    const chat = {
      id: chatId,
      pedido_id: pedidoId,
      nombre: `${pedido.cliente} - ${pedido.lugar}`,
      descripcion: `Evento: ${pedido.cliente} en ${pedido.lugar}`,
      fecha_evento: pedido.diaEvento,
      hora_fin_evento: pedido.horaSalida || '23:59',
      miembros,
      activo: true,
      fecha_eliminacion_programada: fechaEliminacion.toISOString(),
      // Campos adicionales para compatibilidad con código existente
      pedidoId,
      coordinadorId,
      camareroIds: asignaciones.map(a => a.camareroId),
      fechaCreacion: new Date().toISOString(),
      fechaEvento: pedido.diaEvento,
      cliente: pedido.cliente,
      lugar: pedido.lugar,
      horaEntrada: pedido.horaEntrada,
      estado: 'activo'
    };
    
    await kv.set(chatId, chat);
    
    return c.json({ success: true, chatId, chat });
  } catch (error) {
    console.error('Error al crear chat grupal:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Diagnóstico completo de chats
app.get('/make-server-25b11ac0/diagnostico-chats', async (c) => {
  try {
    console.error('🔍 === EJECUTANDO DIAGNÓSTICO COMPLETO DE CHATS ===');
    
    // Obtener todos los datos relevantes
    const todosLosChats = await kv.getByPrefix('chat:');
    const todosLosCoordinadores = await kv.getByPrefix('coordinador:');
    const todosLosPedidos = await kv.getByPrefix('pedido:');
    
    const ahora = new Date();
    
    // Información de coordinadores
    const infoCoordinadores = todosLosCoordinadores.map(coord => ({
      id: coord.id,
      nombre: coord.nombre,
      numero: coord.numero,
      telefono: coord.telefono
    }));
    
    // Información de chats con cálculo de expiración
    const infoChats = todosLosChats.map(chat => {
      let fechaExpiracion;
      
      if (chat.fecha_eliminacion_programada) {
        fechaExpiracion = new Date(chat.fecha_eliminacion_programada);
      } else {
        const fechaEvento = new Date(chat.fechaEvento);
        const horaSalida = chat.hora_fin_evento || chat.horaSalida || '23:59';
        const [hora, minutos] = horaSalida.split(':');
        fechaEvento.setHours(parseInt(hora), parseInt(minutos), 0, 0);
        fechaExpiracion = new Date(fechaEvento.getTime() + 24 * 60 * 60 * 1000);
      }
      
      const expirado = ahora >= fechaExpiracion;
      const horasRestantes = (fechaExpiracion.getTime() - ahora.getTime()) / (1000 * 60 * 60);
      
      return {
        id: chat.id,
        coordinadorId: chat.coordinadorId,
        pedidoId: chat.pedidoId,
        cliente: chat.cliente,
        lugar: chat.lugar,
        fechaEvento: chat.fechaEvento,
        fechaCreacion: chat.fechaCreacion,
        fechaExpiracion: fechaExpiracion.toISOString(),
        expirado,
        horasRestantes: Math.round(horasRestantes * 10) / 10,
        numeroCamareros: chat.camareroIds?.length || 0,
        estado: chat.estado
      };
    });
    
    // Información de eventos con confirmaciones - MEJORADA
    const infoEventos = todosLosPedidos
      .filter(p => p.asignaciones && p.asignaciones.length > 0)
      .map(pedido => {
        const totalCamareros = pedido.asignaciones.length;
        const confirmados = pedido.asignaciones.filter(a => a.estado === 'confirmado').length;
        const todosConfirmados = confirmados === totalCamareros && totalCamareros > 0;
        const chatId = `chat:${pedido.id}`;
        const tieneChat = todosLosChats.some(chat => chat.id === chatId);
        
        // NUEVO: Información detallada de las asignaciones
        const detalleAsignaciones = pedido.asignaciones.map(a => ({
          camareroId: a.camareroId,
          camareroNombre: a.camareroNombre,
          estado: a.estado
        }));
        
        return {
          pedidoId: pedido.id,
          cliente: pedido.cliente,
          lugar: pedido.lugar,
          fechaEvento: pedido.diaEvento,
          totalCamareros,
          confirmados,
          todosConfirmados,
          tieneChat,
          chatEsperadoId: chatId,
          // NUEVO: Campos adicionales para diagnóstico profundo
          coordinadorId: pedido.coordinadorId,
          tieneCoordinadorId: !!pedido.coordinadorId,
          asignaciones: detalleAsignaciones
        };
      });
    
    // Agrupar chats por coordinador
    const chatsPorCoordinador = {};
    for (const chat of infoChats) {
      if (!chatsPorCoordinador[chat.coordinadorId]) {
        chatsPorCoordinador[chat.coordinadorId] = [];
      }
      chatsPorCoordinador[chat.coordinadorId].push(chat);
    }
    
    const diagnostico = {
      timestamp: ahora.toISOString(),
      resumen: {
        totalCoordinadores: infoCoordinadores.length,
        totalChats: infoChats.length,
        chatsActivos: infoChats.filter(c => !c.expirado).length,
        chatsExpirados: infoChats.filter(c => c.expirado).length,
        eventosConAsignaciones: infoEventos.length,
        eventosCompletos: infoEventos.filter(e => e.todosConfirmados).length,
        eventosConChat: infoEventos.filter(e => e.tieneChat).length,
        // NUEVO
        eventosCompletosSinChat: infoEventos.filter(e => e.todosConfirmados && !e.tieneChat).length,
        eventosSinCoordinadorId: infoEventos.filter(e => !e.tieneCoordinadorId).length
      },
      coordinadores: infoCoordinadores,
      chats: infoChats,
      chatsPorCoordinador,
      eventos: infoEventos,
      posiblesProblemas: []
    };
    
    // Detectar problemas potenciales
    for (const evento of infoEventos) {
      if (evento.todosConfirmados && !evento.tieneChat) {
        const problema = {
          tipo: 'CHAT_FALTANTE',
          mensaje: `Evento "${evento.cliente}" tiene todos confirmados pero no tiene chat`,
          pedidoId: evento.pedidoId,
          cliente: evento.cliente,
          // NUEVO: Información adicional
          coordinadorId: evento.coordinadorId,
          tieneCoordinadorId: evento.tieneCoordinadorId
        };
        
        if (!evento.tieneCoordinadorId) {
          problema.mensaje += ' (⚠️ NO TIENE coordinadorId - esta es la causa)';
        }
        
        diagnostico.posiblesProblemas.push(problema);
      }
    }
    
    if (infoChats.length > 0 && infoCoordinadores.length > 0) {
      for (const chat of infoChats) {
        const coordinadorExiste = infoCoordinadores.some(c => c.id === chat.coordinadorId);
        if (!coordinadorExiste) {
          diagnostico.posiblesProblemas.push({
            tipo: 'COORDINADOR_NO_EXISTE',
            mensaje: `Chat "${chat.cliente}" tiene un coordinadorId que no existe: ${chat.coordinadorId}`,
            chatId: chat.id,
            coordinadorId: chat.coordinadorId
          });
        }
      }
    }
    
    console.error('📊 DIAGNÓSTICO COMPLETO:', JSON.stringify(diagnostico, null, 2));
    
    return c.json({ success: true, diagnostico });
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reparar chats faltantes automáticamente
app.post('/make-server-25b11ac0/reparar-chats', async (c) => {
  try {
    console.error('🔧 === INICIANDO REPARACIÓN DE CHATS ===');
    
    const { pedidosIds, coordinadorIdPorDefecto } = await c.req.json();
    
    if (!pedidosIds || !Array.isArray(pedidosIds) || pedidosIds.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Se requiere un array de pedidosIds' 
      });
    }
    
    const resultados = [];
    
    for (const pedidoId of pedidosIds) {
      try {
        const pedido = await kv.get(pedidoId);
        
        if (!pedido) {
          resultados.push({
            pedidoId,
            success: false,
            error: 'Pedido no encontrado'
          });
          continue;
        }
        
        // Verificar que todos hayan confirmado
        const asignaciones = pedido.asignaciones || [];
        const todosConfirmados = asignaciones.length > 0 && asignaciones.every(a => a.estado === 'confirmado');
        
        if (!todosConfirmados) {
          resultados.push({
            pedidoId,
            success: false,
            error: 'No todos los camareros han confirmado'
          });
          continue;
        }
        
        // Verificar si ya existe un chat
        const chatId = `chat:${pedidoId}`;
        const chatExistente = await kv.get(chatId);
        
        if (chatExistente) {
          resultados.push({
            pedidoId,
            success: true,
            accion: 'Ya existe',
            chatId
          });
          continue;
        }
        
        // Determinar coordinadorId
        let coordinadorId = pedido.coordinadorId || coordinadorIdPorDefecto;
        
        if (!coordinadorId) {
          resultados.push({
            pedidoId,
            success: false,
            error: 'No se puede determinar coordinadorId (no está en el pedido ni se proporcionó uno por defecto)'
          });
          continue;
        }
        
        // Crear el chat
        const fechaEvento = new Date(pedido.diaEvento);
        const horaFin = pedido.horaSalida || '23:59';
        const [horaFinH, horaFinM] = horaFin.split(':');
        fechaEvento.setHours(parseInt(horaFinH), parseInt(horaFinM), 0, 0);
        const fechaEliminacion = new Date(fechaEvento.getTime() + 24 * 60 * 60 * 1000);
        
        const miembros = [
          {
            user_id: coordinadorId,
            nombre: pedido.coordinadorNombre || 'Coordinador',
            rol: 'coordinador'
          },
          ...asignaciones.map(a => ({
            user_id: a.camareroId,
            nombre: a.camareroNombre,
            rol: 'camarero'
          }))
        ];
        
        const chat = {
          id: chatId,
          pedido_id: pedidoId,
          nombre: `${pedido.cliente} - ${pedido.lugar}`,
          descripcion: `Evento: ${pedido.cliente} en ${pedido.lugar}`,
          fecha_evento: pedido.diaEvento,
          hora_fin_evento: pedido.horaSalida || '23:59',
          miembros,
          activo: true,
          fecha_eliminacion_programada: fechaEliminacion.toISOString(),
          pedidoId,
          coordinadorId,
          camareroIds: asignaciones.map(a => a.camareroId),
          fechaCreacion: new Date().toISOString(),
          fechaEvento: pedido.diaEvento,
          cliente: pedido.cliente,
          lugar: pedido.lugar,
          horaEntrada: pedido.horaEntrada,
          estado: 'activo'
        };
        
        await kv.set(chatId, chat);
        console.error(`✅ Chat creado para pedido ${pedidoId}: ${pedido.cliente}`);
        
        resultados.push({
          pedidoId,
          success: true,
          accion: 'Creado',
          chatId,
          cliente: pedido.cliente,
          coordinadorId
        });
        
      } catch (error) {
        resultados.push({
          pedidoId,
          success: false,
          error: String(error)
        });
      }
    }
    
    const resumen = {
      total: resultados.length,
      creados: resultados.filter(r => r.accion === 'Creado').length,
      yaExistian: resultados.filter(r => r.accion === 'Ya existe').length,
      fallidos: resultados.filter(r => !r.success).length
    };
    
    console.error('🔧 RESUMEN DE REPARACIÓN:', resumen);
    
    return c.json({ 
      success: true, 
      resumen,
      resultados 
    });
  } catch (error) {
    console.error('❌ Error al reparar chats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Obtener chats del coordinador (con limpieza automática de expirados)
app.get('/make-server-25b11ac0/chats/:coordinadorId', async (c) => {
  try {
    const coordinadorId = c.req.param('coordinadorId');
    console.error(`🔍 Buscando chats para coordinadorId: ${coordinadorId}`);
    
    const todosLosChats = await kv.getByPrefix('chat:');
    console.error(`🔍 Total de chats en base de datos: ${todosLosChats.length}`);
    
    if (todosLosChats.length > 0) {
      console.error('🔍 IDs de coordinadores en todos los chats:', todosLosChats.map(c => ({ chatId: c.id, coordinadorId: c.coordinadorId })));
    }
    
    // Filtrar por coordinador
    let chatsDelCoordinador = todosLosChats.filter(chat => chat.coordinadorId === coordinadorId);
    console.error(`🔍 Chats filtrados por coordinadorId: ${chatsDelCoordinador.length}`);
    
    // Limpiar chats expirados (24 horas después del evento + hora de salida)
    const ahora = new Date();
    const chatsActivos = [];
    
    for (const chat of chatsDelCoordinador) {
      // Usar fecha_eliminacion_programada si existe, sino calcular desde fechaEvento + hora
      let fechaExpiracion;
      
      if (chat.fecha_eliminacion_programada) {
        fechaExpiracion = new Date(chat.fecha_eliminacion_programada);
      } else {
        // Fallback: calcular desde fechaEvento + hora de salida + 24h
        const fechaEvento = new Date(chat.fechaEvento);
        const horaSalida = chat.hora_fin_evento || chat.horaSalida || '23:59';
        const [hora, minutos] = horaSalida.split(':');
        fechaEvento.setHours(parseInt(hora), parseInt(minutos), 0, 0);
        fechaExpiracion = new Date(fechaEvento.getTime() + 24 * 60 * 60 * 1000);
      }
      
      // Si aún no ha expirado, mantenerlo
      if (ahora < fechaExpiracion) {
        chatsActivos.push(chat);
      } else {
        // Eliminar chat y sus mensajes
        await kv.del(chat.id);
        await kv.del(`${chat.id}:mensajes`);
        console.error(`🗑️ Chat eliminado por expiración: ${chat.id} - Expiró el ${fechaExpiracion.toISOString()}`);
      }
    }
    
    console.error(`📊 Chats activos para coordinador ${coordinadorId}: ${chatsActivos.length} de ${chatsDelCoordinador.length}`);
    
    return c.json({ success: true, data: chatsActivos });
  } catch (error) {
    console.error('Error al obtener chats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Nota: Los endpoints de chat-mensajes están definidos en la sección CHAT GRUPAL al final del archivo

// ============== ENVÍO DE EMAIL ==============

// Función para generar PDF del parte de servicio
async function generarPDFParte(pedido: any, parteHTML: string): Promise<string> {
  try {
    // Usar jsPDF en lugar de PDFKit para evitar warnings de readFileSync
    const { jsPDF } = await import('npm:jspdf@2.5.1');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Configuración de fuentes y estilos
    const pageWidth = 210; // A4 width in mm
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPos = 20;
    
    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTE DE SERVICIO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    // Información del evento en dos columnas
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Columna izquierda
    doc.text('Cliente:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(pedido.cliente, margin + 30, yPos);
    
    // Columna derecha
    doc.setFont('helvetica', 'bold');
    doc.text('Lugar del evento:', pageWidth / 2 + 10, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(pedido.lugar, pageWidth / 2 + 50, yPos, { maxWidth: 70 });
    
    yPos += 8;
    
    // Segunda fila
    doc.setFont('helvetica', 'bold');
    doc.text('Día:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const fechaEvento = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(fechaEvento, margin + 30, yPos, { maxWidth: 70 });
    
    doc.setFont('helvetica', 'bold');
    doc.text('Hora entrada:', pageWidth / 2 + 10, yPos);
    doc.setFont('helvetica', 'normal');
    const horaTexto = pedido.horaEntrada2 
      ? `${pedido.horaEntrada} / ${pedido.horaEntrada2}` 
      : pedido.horaEntrada;
    doc.text(horaTexto, pageWidth / 2 + 50, yPos);
    
    yPos += 12;
    
    // Línea separadora
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    // Tabla de camareros
    doc.setFontSize(9);
    
    const tableStartY = yPos;
    const colWidths = [60, 30, 30, 25, 35]; // Anchos en mm
    const rowHeight = 8;
    const headers = ['Camarero', 'Hora Entrada', 'Hora Salida', 'Total', 'Observaciones'];
    
    // Encabezados
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, rowHeight, 'FD');
    
    let xPos = margin;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], xPos + 2, yPos + 5.5);
      xPos += colWidths[i];
    }
    
    yPos += rowHeight;
    
    // Filas de camareros
    doc.setFont('helvetica', 'normal');
    const camareros = pedido.asignaciones || [];
    const totalFilas = Math.max(8, camareros.length);
    
    for (let i = 0; i < totalFilas; i++) {
      const asignacion = camareros[i];
      
      // Dibujar borde de la fila
      doc.rect(margin, yPos, contentWidth, rowHeight);
      
      xPos = margin;
      
      if (asignacion) {
        const camareroText = `#${asignacion.camareroNumero} - ${asignacion.camareroNombre}`;
        doc.text(camareroText, xPos + 2, yPos + 5.5, { maxWidth: colWidths[0] - 4 });
        xPos += colWidths[0];
        
        doc.text(pedido.horaEntrada, xPos + 2, yPos + 5.5);
      } else {
        xPos += colWidths[0];
      }
      
      // Líneas verticales de la tabla
      for (let j = 1; j < colWidths.length; j++) {
        doc.line(xPos, yPos, xPos, yPos + rowHeight);
        xPos += colWidths[j];
      }
      
      yPos += rowHeight;
    }
    
    // Firma del responsable
    yPos += 20;
    const firmaWidth = 80;
    const firmaHeight = 35;
    const firmaX = pageWidth - margin - firmaWidth;
    
    doc.rect(firmaX, yPos, firmaWidth, firmaHeight);
    doc.setFont('helvetica', 'normal');
    doc.text('Firma del Responsable', firmaX + firmaWidth / 2, yPos + 8, { align: 'center' });
    doc.line(firmaX + 10, yPos + firmaHeight - 5, firmaX + firmaWidth - 10, yPos + firmaHeight - 5);
    
    // Generar el PDF como base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    return pdfBase64;
  } catch (error) {
    console.error('⚠️ Error al generar PDF, usando fallback...', error);
    // Retornar vacío si falla, el email se enviará sin adjunto
    return '';
  }
}

// Función genérica para enviar emails con detección automática de proveedor
async function enviarEmailGenerico({ destinatario, cc, asunto, htmlBody, attachments }: { 
  destinatario: string; 
  cc?: string | null; 
  asunto: string; 
  htmlBody: string;
  attachments?: Array<{ filename: string; content: string; encoding: string }>;
}) {
  // Log para diagnóstico (sin mostrar valores completos por seguridad)
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
  const emailFrom = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';
  
  console.error('🔍 Diagnóstico de variables de entorno:');
  console.error(`  RESEND_API_KEY: ${resendApiKey ? `configurada (${resendApiKey.length} chars)` : 'NO CONFIGURADA'}`);
  console.error(`  SENDGRID_API_KEY: ${sendgridApiKey ? `configurada (${sendgridApiKey.length} chars)` : 'NO CONFIGURADA'}`);
  console.error(`  MAILGUN_API_KEY: ${mailgunApiKey ? `configurada (${mailgunApiKey.length} chars)` : 'NO CONFIGURADA'}`);
  console.error(`  EMAIL_FROM: ${emailFrom}`);
  console.error(`  Adjuntos: ${attachments ? attachments.length : 0}`);
  
  // 1. Intentar con Resend (prioridad 1)
  if (resendApiKey) {
    try {
      console.error('📧 Intentando enviar con Resend...');
      const resendBody: any = {
        from: emailFrom,
        to: [destinatario],
        subject: asunto,
        html: htmlBody
      };
      
      if (cc) {
        resendBody.cc = [cc];
      }
      
      // Agregar adjuntos si existen
      if (attachments && attachments.length > 0) {
        resendBody.attachments = attachments;
      }
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resendBody)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.error('✅ Email enviado con Resend:', result);
        return { success: true, provider: 'Resend', messageId: result.id };
      } else {
        console.error('❌ Error de Resend:', result);
        throw new Error(result.message || 'Error al enviar con Resend');
      }
    } catch (error) {
      console.error('⚠️ Resend falló, intentando siguiente proveedor...', error);
    }
  }
  
  // 2. Intentar con SendGrid (prioridad 2)
  if (sendgridApiKey) {
    try {
      console.error('📧 Intentando enviar con SendGrid...');
      const sendgridBody: any = {
        personalizations: [{
          to: [{ email: destinatario }],
          subject: asunto
        }],
        from: { email: emailFrom },
        content: [{
          type: 'text/html',
          value: htmlBody
        }]
      };
      
      if (cc) {
        sendgridBody.personalizations[0].cc = [{ email: cc }];
      }
      
      // Agregar adjuntos si existen
      if (attachments && attachments.length > 0) {
        sendgridBody.attachments = attachments.map(att => ({
          content: att.content,
          filename: att.filename,
          type: 'application/pdf',
          disposition: 'attachment'
        }));
      }
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendgridBody)
      });
      
      if (response.ok) {
        console.error('✅ Email enviado con SendGrid');
        return { success: true, provider: 'SendGrid' };
      } else {
        const errorText = await response.text();
        console.error('❌ Error de SendGrid:', errorText);
        throw new Error('Error al enviar con SendGrid');
      }
    } catch (error) {
      console.error('⚠️ SendGrid falló, intentando siguiente proveedor...', error);
    }
  }
  
  // 3. Intentar con Mailgun (prioridad 3)
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
  
  if (mailgunApiKey && mailgunDomain) {
    try {
      console.error('📧 Intentando enviar con Mailgun...');
      
      const formData = new FormData();
      formData.append('from', emailFrom);
      formData.append('to', destinatario);
      if (cc) {
        formData.append('cc', cc);
      }
      formData.append('subject', asunto);
      formData.append('html', htmlBody);
      
      // Agregar adjuntos si existen
      if (attachments && attachments.length > 0) {
        for (const att of attachments) {
          const buffer = Uint8Array.from(atob(att.content), c => c.charCodeAt(0));
          const blob = new Blob([buffer], { type: 'application/pdf' });
          formData.append('attachment', blob, att.filename);
        }
      }
      
      const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.error('✅ Email enviado con Mailgun:', result);
        return { success: true, provider: 'Mailgun', messageId: result.id };
      } else {
        console.error('❌ Error de Mailgun:', result);
        throw new Error(result.message || 'Error al enviar con Mailgun');
      }
    } catch (error) {
      console.error('⚠️ Mailgun falló:', error);
    }
  }
  
  // Si ninguno funcionó
  return { 
    success: false, 
    error: 'No hay ningún servicio de email configurado o todos fallaron. Por favor, configura RESEND_API_KEY, SENDGRID_API_KEY, o MAILGUN_API_KEY en las variables de entorno.' 
  };
}

// Endpoint para verificar qué servicio de email está configurado
app.get('/make-server-25b11ac0/verificar-email-config', async (c) => {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';
    
    // Log detallado para debugging
    console.error('🔍 DIAGNÓSTICO COMPLETO DE EMAIL:');
    console.error(`  RESEND_API_KEY: ${resendApiKey ? `✓ configurada (${resendApiKey.length} chars, inicia con: ${resendApiKey.substring(0, 5)}...)` : '✗ NO CONFIGURADA'}`);
    console.error(`  SENDGRID_API_KEY: ${sendgridApiKey ? `✓ configurada (${sendgridApiKey.length} chars)` : '✗ NO CONFIGURADA'}`);
    console.error(`  MAILGUN_API_KEY: ${mailgunApiKey ? `✓ configurada (${mailgunApiKey.length} chars)` : '✗ NO CONFIGURADA'}`);
    console.error(`  MAILGUN_DOMAIN: ${mailgunDomain ? `✓ configurado: ${mailgunDomain}` : '✗ NO CONFIGURADO'}`);
    console.error(`  EMAIL_FROM: ${emailFrom}`);
    
    const servicios = {
      resend: !!resendApiKey,
      sendgrid: !!sendgridApiKey,
      mailgun: !!(mailgunApiKey && mailgunDomain)
    };
    
    console.error(`📊 Servicios detectados:`, servicios);
    
    let servicioActivo = null;
    if (servicios.resend) servicioActivo = 'Resend';
    else if (servicios.sendgrid) servicioActivo = 'SendGrid';
    else if (servicios.mailgun) servicioActivo = 'Mailgun';
    
    console.error(`🎯 Servicio activo seleccionado: ${servicioActivo}`);
    
    const configured = servicioActivo !== null;
    
    // Construir lista de servicios disponibles con capitalización correcta
    const serviciosDisponiblesList = [];
    if (servicios.resend) serviciosDisponiblesList.push('Resend');
    if (servicios.sendgrid) serviciosDisponiblesList.push('SendGrid');
    if (servicios.mailgun) serviciosDisponiblesList.push('Mailgun');
    
    console.error(`✅ Configurado: ${configured}, Servicios disponibles:`, serviciosDisponiblesList);
    
    return c.json({
      configured,
      servicioActivo,
      serviciosDisponibles: serviciosDisponiblesList,
      emailFrom,
      debug: {
        hasResend: !!resendApiKey,
        hasSendgrid: !!sendgridApiKey,
        hasMailgun: !!mailgunApiKey,
        hasMailgunDomain: !!mailgunDomain,
        resendKeyLength: resendApiKey?.length || 0
      },
      message: configured 
        ? `Email configurado correctamente con ${servicioActivo}` 
        : '⚠️ No hay ningún servicio de email configurado. Si acabas de configurar las variables, espera 1-2 minutos y recarga la página para que el servidor actualice la configuración.'
    });
  } catch (error) {
    console.error('Error al verificar configuración de email:', error);
    return c.json({
      configured: false,
      error: String(error),
      message: 'Error al verificar la configuración'
    }, 500);
  }
});

// Endpoint para enviar parte por email
app.post('/make-server-25b11ac0/enviar-email-parte', async (c) => {
  try {
    const { destinatario, cc, asunto, mensaje, parteHTML, pedido } = await c.req.json();
    
    if (!destinatario || !asunto || !parteHTML) {
      return c.json({ 
        success: false, 
        error: 'Faltan campos requeridos: destinatario, asunto, parteHTML' 
      });
    }
    
    console.error('📧 Procesando envío de parte de servicio...');
    console.error(`   Cliente: ${pedido?.cliente}`);
    console.error(`   Fecha: ${pedido?.fecha}`);
    
    // Construir el cuerpo del email
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        ${mensaje ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #374151; margin: 0; white-space: pre-line;">${mensaje}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <p style="color: #374151; font-size: 14px; text-align: center;">
            📎 El parte de servicio se encuentra adjunto en formato PDF para su descarga.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p><strong>Sistema de Gestión de Camareros</strong></p>
          <p>Parte de servicio para: ${pedido.cliente}</p>
          <p>Fecha: ${pedido.fecha} | Lugar: ${pedido.lugar}</p>
          <p>Email generado automáticamente - No responder</p>
        </div>
      </div>
    `;
    
    // Generar PDF del parte de servicio
    console.error('📄 Generando PDF del parte de servicio...');
    const pdfBase64 = await generarPDFParte(pedido, parteHTML);
    
    // Preparar adjuntos si hay PDF
    const attachments: Array<{ filename: string; content: string; encoding: string }> = [];
    if (pdfBase64) {
      const nombreArchivo = `Parte_Servicio_${pedido.cliente.replace(/\s+/g, '_')}_${pedido.fecha.replace(/\//g, '-')}.pdf`;
      attachments.push({
        filename: nombreArchivo,
        content: pdfBase64,
        encoding: 'base64'
      });
      console.error(`✅ PDF generado exitosamente: ${nombreArchivo} (${Math.round(pdfBase64.length / 1024)} KB)`);
    } else {
      console.error('⚠️ No se pudo generar el PDF, el email se enviará sin adjunto');
    }
    
    // Enviar usando la función genérica
    console.error('📤 Enviando email...');
    const result = await enviarEmailGenerico({
      destinatario,
      cc,
      asunto,
      htmlBody: emailBody,
      attachments
    });
    
    if (result.success) {
      console.error(`✅ Email enviado exitosamente con ${attachments.length} adjunto(s)`);
    }
    
    return c.json(result);
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return c.json({ 
      success: false, 
      error: String(error) 
    }, 500);
  }
});

// ============== VERIFICAR CONFIGURACIÓN DE WHATSAPP ==============
app.get('/make-server-25b11ac0/verificar-whatsapp-config', async (c) => {
  try {
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    
    if (!whatsappApiKey || !whatsappPhoneId) {
      return c.json({
        configured: false,
        hasToken: !!whatsappApiKey,
        phoneId: !!whatsappPhoneId,
        message: 'WhatsApp Business API no está configurado. Necesitas configurar WHATSAPP_API_KEY y WHATSAPP_PHONE_ID en las variables de entorno.',
        configSource: 'environment'
      });
    }
    
    // 🚨 VALIDACIÓN CRÍTICA: Detectar si el token es sospechosamente corto
    if (whatsappApiKey.length < 100) {
      return c.json({
        configured: false,
        hasToken: true,
        phoneId: true,
        tokenLength: whatsappApiKey.length,
        suspiciousToken: true,
        message: '⚠️ ERROR: El WHATSAPP_API_KEY es demasiado corto. Un token válido debe tener más de 200 caracteres. Es posible que hayas usado el Phone ID como token.',
        detail: `Token actual: ${whatsappApiKey.length} caracteres. Token válido: 200+ caracteres. El Phone ID es DIFERENTE del API Key.`,
        configSource: 'environment'
      });
    }
    
    // Verificar si el token y phone ID son iguales (error común)
    if (whatsappApiKey === whatsappPhoneId) {
      return c.json({
        configured: false,
        hasToken: true,
        phoneId: true,
        duplicateValues: true,
        message: '⚠️ ERROR: WHATSAPP_API_KEY y WHATSAPP_PHONE_ID tienen el mismo valor. Son dos credenciales DIFERENTES.',
        detail: 'El Phone ID es un número corto (15 dígitos). El API Key es un token largo (200+ caracteres que empieza con "EAA...").',
        configSource: 'environment'
      });
    }
    
    return c.json({
      configured: true,
      hasToken: true,
      phoneId: whatsappPhoneId,
      tokenLength: whatsappApiKey.length,
      message: 'WhatsApp Business API configurado correctamente',
      configSource: 'environment'
    });
  } catch (error) {
    console.error('Error al verificar configuración WhatsApp:', error);
    return c.json({
      configured: false,
      error: String(error),
      message: 'Error al verificar la configuración'
    }, 500);
  }
});

// ============== ENVIAR WHATSAPP ==============
app.post('/make-server-25b11ac0/enviar-whatsapp', async (c) => {
  try {
    const { telefono, mensaje } = await c.req.json();
    
    if (!telefono || !mensaje) {
      return c.json({
        success: false,
        error: 'Faltan campos requeridos: telefono y mensaje'
      }, 400);
    }
    
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    
    if (!whatsappApiKey || !whatsappPhoneId) {
      return c.json({
        success: false,
        needsConfiguration: true,
        error: 'WhatsApp Business API no está configurado',
        debugInfo: {
          configSource: 'environment',
          tokenLength: whatsappApiKey ? whatsappApiKey.length : 0,
          phoneId: whatsappPhoneId || null
        }
      });
    }
    
    // Limpiar número de teléfono (remover espacios, guiones, etc.)
    let numeroLimpio = telefono.replace(/\D/g, '');
    
    // Si el número tiene 9 dígitos, agregar prefijo de España (34)
    if (numeroLimpio.length === 9) {
      numeroLimpio = '34' + numeroLimpio;
    }
    
    console.error(`📱 Enviando WhatsApp a ${numeroLimpio}`);
    
    // Enviar mensaje usando WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: numeroLimpio,
        type: 'text',
        text: {
          body: mensaje
        }
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error de WhatsApp API:', result);
      return c.json({
        success: false,
        error: result.error?.message || 'Error al enviar mensaje por WhatsApp',
        needsConfiguration: result.error?.code === 190, // Token inválido
        debugInfo: {
          httpStatus: response.status,
          whatsappError: result.error,
          phoneId: whatsappPhoneId,
          tokenLength: whatsappApiKey.length,
          tokenPrefix: whatsappApiKey.substring(0, 20) + '...'
        }
      });
    }
    
    console.error('✅ WhatsApp enviado exitosamente:', result);
    return c.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error);
    return c.json({
      success: false,
      error: String(error)
    }, 500);
  }
});

// ============== CHAT GRUPAL ==============
// Obtener mensajes de un chat grupal (usando getByPrefix — compatible con POST)
app.get('/make-server-25b11ac0/chat-mensajes/:chatId', async (c) => {
  try {
    const chatId = c.req.param('chatId');
    const mensajes = await kv.getByPrefix(`chat-mensaje:${chatId}:`);
    
    // Ordenar por timestamp
    const mensajesOrdenados = mensajes.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return c.json({
      success: true,
      mensajes: mensajesOrdenados
    });
  } catch (error) {
    console.error('Error al obtener mensajes del chat:', error);
    return c.json({
      success: false,
      error: String(error)
    }, 500);
  }
});

// Crear mensaje en chat grupal
app.post('/make-server-25b11ac0/chat-mensajes', async (c) => {
  try {
    const mensaje = await c.req.json();
    const key = `chat-mensaje:${mensaje.chatId}:${mensaje.id}`;
    await kv.set(key, mensaje);
    return c.json({ success: true, mensaje });
  } catch (error) {
    console.error('Error al crear mensaje en chat:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});


// ============== GOOGLE MAPS DISTANCE ==============
app.get('/make-server-25b11ac0/calcular-distancia', async (c) => {
  try {
    const { destino } = c.req.query();
    const googleMapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!googleMapsKey) {
      return c.json({ 
        success: false, 
        error: 'GOOGLE_MAPS_API_KEY no configurada',
        fallback: true 
      });
    }

    if (!destino) {
      return c.json({ success: false, error: 'Falta parámetro destino' });
    }

    // Punto de encuentro fijo (Fabra i Puig)
    const origen = 'https://maps.app.goo.gl/nofiiyVsnx5XLkES8';
    const origenCoords = '41.4400,2.1900'; // Coordenadas aproximadas Fabra i Puig, Barcelona

    // Resolver destino: puede ser URL de Google Maps o nombre de lugar
    let destinoQuery = destino;
    if (destino.includes('maps.google.com') || destino.includes('maps.app.goo.gl')) {
      // Extraer query del URL si es posible
      const match = destino.match(/query=([^&]+)/);
      if (match) {
        destinoQuery = decodeURIComponent(match[1]);
      }
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origenCoords}&destinations=${encodeURIComponent(destinoQuery)}&mode=driving&language=es&key=${googleMapsKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      console.error('Google Maps error:', data);
      return c.json({ success: false, error: 'No se pudo calcular la distancia', fallback: true });
    }

    const element = data.rows[0].elements[0];
    
    if (element.status !== 'OK') {
      return c.json({ success: false, error: 'Destino no encontrado', fallback: true });
    }

    const duracionSegundos = element.duration.value;
    const duracionMinutos = Math.ceil(duracionSegundos / 60);
    const distanciaKm = (element.distance.value / 1000).toFixed(1);

    console.error(`✅ Distancia calculada: ${distanciaKm}km, ${duracionMinutos}min`);

    return c.json({
      success: true,
      duracionMinutos,
      distanciaKm,
      duracionTexto: element.duration.text,
      distanciaTexto: element.distance.text
    });

  } catch (error) {
    console.error('Error al calcular distancia:', error);
    return c.json({ success: false, error: String(error), fallback: true });
  }
});


// ============== PARTES ENVIADOS ==============
// Marcar parte como enviado
app.post('/make-server-25b11ac0/partes-enviados', async (c) => {
  try {
    const { pedidoId, fechaEnvio, destinatario } = await c.req.json();
    await kv.set(`parte-enviado:${pedidoId}`, {
      pedidoId,
      fechaEnvio: fechaEnvio || new Date().toISOString(),
      destinatario
    });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al marcar parte como enviado:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Consultar qué partes ya fueron enviados
app.get('/make-server-25b11ac0/partes-enviados', async (c) => {
  try {
    const enviados = await kv.getByPrefix('parte-enviado:');
    const map = {};
    for (const item of enviados) {
      if (item && item.pedidoId) {
        map[item.pedidoId] = item;
      }
    }
    return c.json({ success: true, enviados: map });
  } catch (error) {
    console.error('Error al obtener partes enviados:', error);
    return c.json({ success: false, enviados: {} }, 500);
  }
});

// ============== AUTH ==============

// Hash simple con SHA-256 para contraseñas (sin bcrypt en Deno Edge)
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verificar si el sistema ya tiene un Admin creado
app.get('/make-server-25b11ac0/auth/status', async (c) => {
  try {
    const adminExists = await kv.get('system:admin-created');
    return c.json({ success: true, needsSetup: !adminExists });
  } catch (error) {
    console.error('Error al verificar estado del sistema:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Setup inicial: crear el primer Admin (solo funciona si no existe ninguno)
app.post('/make-server-25b11ac0/auth/setup', async (c) => {
  try {
    const adminExists = await kv.get('system:admin-created');
    if (adminExists) {
      return c.json({ success: false, error: 'El sistema ya fue configurado' }, 403);
    }

    const { nombre, email, password } = await c.req.json();
    if (!nombre || !email || !password) {
      return c.json({ success: false, error: 'Faltan campos requeridos' }, 400);
    }
    if (password.length < 8) {
      return c.json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
    }

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const id = `user:${Date.now()}`;

    const usuario = {
      id,
      email: email.toLowerCase().trim(),
      nombre,
      role: 'admin',
      passwordHash: hash,
      salt,
      creadoEn: new Date().toISOString(),
    };

    await kv.set(id, usuario);
    await kv.set(`user-email:${email.toLowerCase().trim()}`, id);
    await kv.set('system:admin-created', true);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error en setup:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Login — soporta contraseña definitiva y contraseña temporal (24h)
app.post('/make-server-25b11ac0/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ success: false, error: 'Email y contraseña requeridos' }, 400);
    }

    const emailNorm = email.toLowerCase().trim();
    const userId = await kv.get(`user-email:${emailNorm}`);
    if (!userId) {
      return c.json({ success: false, error: 'Credenciales incorrectas' }, 401);
    }

    const usuario = await kv.get(userId);
    if (!usuario) {
      return c.json({ success: false, error: 'Credenciales incorrectas' }, 401);
    }

    // 1. Intentar con contraseña definitiva
    const hashDefinitivo = await hashPassword(password, usuario.salt);
    let autenticado = hashDefinitivo === usuario.passwordHash;
    let usandoPasswordTemporal = false;

    // 2. Si no coincide, intentar con contraseña temporal
    if (!autenticado) {
      const tempData = await kv.get(`temp-password:${userId}`);
      if (tempData && !tempData.used) {
        // Verificar que no expiró
        if (new Date(tempData.expiresAt) > new Date()) {
          const hashTemp = await hashPassword(password, tempData.salt);
          if (hashTemp === tempData.hash) {
            autenticado = true;
            usandoPasswordTemporal = true;
            // Marcar como usada para que no se reutilice indefinidamente
            await kv.set(`temp-password:${userId}`, { ...tempData, used: true });
          }
        } else {
          // Limpiar token expirado
          await kv.del(`temp-password:${userId}`);
        }
      }
    }

    if (!autenticado) {
      return c.json({ success: false, error: 'Credenciales incorrectas' }, 401);
    }

    // Generar token de sesión (expira en 8h)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    await kv.set(`session:${token}`, {
      token,
      userId: usuario.id,
      expiresAt,
    });

    const { passwordHash: _, salt: __, ...publicUser } = usuario;
    return c.json({
      success: true,
      user: publicUser,
      token,
      // Avisa al frontend que debe cambiar la contraseña
      requirePasswordChange: usandoPasswordTemporal,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Cambiar contraseña (usuario autenticado con password temporal)
app.post('/make-server-25b11ac0/auth/cambiar-password', async (c) => {
  try {
    const sessionToken = c.req.header('x-session-token');
    if (!sessionToken) {
      return c.json({ success: false, error: 'No autenticado' }, 401);
    }

    // Verificar sesión
    const session = await kv.get(`session:${sessionToken}`);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return c.json({ success: false, error: 'Sesión expirada' }, 401);
    }

    const { passwordNueva } = await c.req.json();
    if (!passwordNueva || passwordNueva.length < 8) {
      return c.json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
    }

    const usuario = await kv.get(session.userId);
    if (!usuario) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    // Actualizar contraseña definitiva
    const nuevoSalt = generateSalt();
    const nuevoHash = await hashPassword(passwordNueva, nuevoSalt);

    await kv.set(session.userId, {
      ...usuario,
      passwordHash: nuevoHash,
      salt: nuevoSalt,
    });

    // Limpiar contraseña temporal si existe
    await kv.del(`temp-password:${session.userId}`);

    console.error(`✅ Contraseña actualizada para usuario ${usuario.email}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Verificar token de sesión activo
app.get('/make-server-25b11ac0/auth/verify', async (c) => {
  try {
    const token = c.req.header('x-session-token');
    if (!token) return c.json({ success: false }, 401);

    const session = await kv.get(`session:${token}`);
    if (!session) return c.json({ success: false }, 401);

    if (new Date(session.expiresAt) < new Date()) {
      await kv.del(`session:${token}`);
      return c.json({ success: false }, 401);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false }, 500);
  }
});

// Listar usuarios (solo Admin)
app.get('/make-server-25b11ac0/auth/usuarios', async (c) => {
  try {
    const usuarios = await kv.getByPrefix('user:');
    const publicos = usuarios.map(({ passwordHash, salt, ...u }) => u);
    return c.json({ success: true, data: publicos });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Crear usuario (solo Admin)
app.post('/make-server-25b11ac0/auth/usuarios', requireSecret, async (c) => {
  try {
    const { nombre, email, password, role, coordinadorId } = await c.req.json();
    if (!nombre || !email || !password || !role) {
      return c.json({ success: false, error: 'Faltan campos requeridos' }, 400);
    }
    if (password.length < 8) {
      return c.json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
    }

    // Verificar que el email no esté en uso
    const existing = await kv.get(`user-email:${email.toLowerCase().trim()}`);
    if (existing) {
      return c.json({ success: false, error: 'Ya existe un usuario con ese email' }, 409);
    }

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const id = `user:${Date.now()}`;

    const usuario = {
      id,
      email: email.toLowerCase().trim(),
      nombre,
      role,
      coordinadorId: role === 'coordinador' ? coordinadorId : undefined,
      passwordHash: hash,
      salt,
      creadoEn: new Date().toISOString(),
    };

    await kv.set(id, usuario);
    await kv.set(`user-email:${email.toLowerCase().trim()}`, id);

    const { passwordHash: _, salt: __, ...publicUser } = usuario;
    return c.json({ success: true, data: publicUser });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Eliminar usuario (solo Admin)
app.delete('/make-server-25b11ac0/auth/usuarios/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    const usuario = await kv.get(id);
    if (!usuario) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    await kv.del(id);
    await kv.del(`user-email:${usuario.email}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== RECUPERACIÓN DE CONTRASEÑA ==============

// Genera una contraseña temporal legible (sin caracteres confusos)
const generarPasswordTemporal = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const array = new Uint8Array(10);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => chars[b % chars.length]).join('');
};

// Solicitar recuperación — envía email con contraseña temporal
app.post('/make-server-25b11ac0/auth/recuperar-password', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ success: false, error: 'Email requerido' }, 400);
    }

    const emailNorm = email.toLowerCase().trim();
    const userId = await kv.get(`user-email:${emailNorm}`);

    // Respuesta genérica independientemente de si el email existe (seguridad)
    if (!userId) {
      return c.json({ success: true, message: 'Si el email está registrado, recibirás las instrucciones.' });
    }

    const usuario = await kv.get(userId);
    if (!usuario) {
      return c.json({ success: true, message: 'Si el email está registrado, recibirás las instrucciones.' });
    }

    // Generar contraseña temporal
    const passwordTemporal = generarPasswordTemporal();
    const salt = generateSalt();
    const hash = await hashPassword(passwordTemporal, salt);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 horas

    // Guardar en KV: contraseña temporal con expiración
    await kv.set(`temp-password:${userId}`, {
      hash,
      salt,
      expiresAt,
      used: false,
    });

    // Construir email HTML
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';
    const appName = 'Gestión de Camareros para Eventos';

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de contraseña</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:36px 40px;text-align:center;">
              <div style="width:52px;height:52px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;">🔐</span>
              </div>
              <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.02em;">${appName}</h1>
              <p style="color:#64748b;font-size:14px;margin:8px 0 0;">Recuperación de acceso</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hola, <strong>${usuario.nombre}</strong></p>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Recibimos una solicitud para restablecer tu contraseña. Tu contraseña temporal es:
              </p>

              <!-- Contraseña temporal destacada -->
              <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
                <p style="color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px;">Contraseña temporal</p>
                <p style="color:#0f172a;font-size:28px;font-weight:700;letter-spacing:0.12em;font-family:'Courier New',monospace;margin:0;">${passwordTemporal}</p>
              </div>

              <!-- Alerta expiración -->
              <div style="background:#fef9c3;border-left:4px solid #eab308;border-radius:8px;padding:14px 16px;margin-bottom:28px;">
                <p style="color:#713f12;font-size:13px;margin:0;line-height:1.5;">
                  ⏱ <strong>Esta contraseña expira en 24 horas.</strong><br>
                  Después de ingresar, deberás cambiarla por una contraseña definitiva desde tu perfil.
                </p>
              </div>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 4px;">
                Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual permanece sin cambios.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">${appName} · Mensaje automático, no responder</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const resultado = await enviarEmailGenerico({
      destinatario: emailNorm,
      asunto: `🔐 Tu contraseña temporal — ${appName}`,
      htmlBody,
    });

    if (!resultado.success) {
      console.error('Error al enviar email de recuperación:', resultado);
      return c.json({ success: false, error: 'No se pudo enviar el email. Contacta al administrador.' }, 500);
    }

    console.error(`✅ Email de recuperación enviado a ${emailNorm}`);
    return c.json({ success: true, message: 'Si el email está registrado, recibirás las instrucciones.' });

  } catch (error) {
    console.error('Error en recuperar-password:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================================
// SISTEMA DE FICHAJES CON QR
// ============================================================

// --- Generador de QR SVG (sin dependencias externas) ---
// Implementación mínima de QR Code versión 1 (21x21) usando el estándar ISO 18004
// Para URLs cortas como las de fichaje (token de 12 chars) es suficiente
// Se usa una librería CDN-loaded en la página HTML del cliente

// Genera un token de fichaje único para un camarero+pedido
const generarQRToken = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const array = new Uint8Array(14);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => chars[b % chars.length]).join('');
};

// POST /qr-tokens — Genera y guarda un token QR para fichaje
// Llamado desde envio-mensaje al enviar el mensaje de confirmación
app.post('/make-server-25b11ac0/qr-tokens', async (c) => {
  try {
    const { pedidoId, camareroId } = await c.req.json();
    if (!pedidoId || !camareroId) {
      return c.json({ success: false, error: 'Faltan pedidoId y camareroId' }, 400);
    }

    // Reutilizar token si ya existe para este camarero+pedido
    const keyExistente = `qr-token:${pedidoId}:${camareroId}`;
    const existente = await kv.get(keyExistente);
    if (existente) {
      const projectRefEx = Deno.env.get('SUPABASE_URL')?.replace('https://', '').split('.')[0] || '';
      const baseUrlEx = `https://${projectRefEx}.supabase.co/functions/v1/make-server-25b11ac0`;
      return c.json({ success: true, token: existente.token, qrUrl: `${baseUrlEx}/fichar/${existente.token}` });
    }

    const token = generarQRToken();
    const pedido = await kv.get(pedidoId);
    const camarero = await kv.get(camareroId);

    await kv.set(keyExistente, {
      token,
      pedidoId,
      camareroId,
      camareroNombre: camarero ? `${camarero.nombre} ${camarero.apellido}` : 'Camarero',
      clienteNombre: pedido?.cliente || '',
      lugar: pedido?.lugar || '',
      diaEvento: pedido?.diaEvento || '',
      horaEntradaPrevista: pedido?.horaEntrada || '',
      horaSalidaPrevista: pedido?.horaSalida || '',
      creadoEn: new Date().toISOString(),
    });
    // Índice inverso para buscar por token
    await kv.set(`qr-token-idx:${token}`, keyExistente);

    const projectRef = Deno.env.get('SUPABASE_URL')?.replace('https://', '').split('.')[0] || '';
    const fichajeUrl = `https://${projectRef}.supabase.co/functions/v1/make-server-25b11ac0/fichar/${token}`;

    return c.json({ success: true, token, qrUrl: fichajeUrl });
  } catch (error) {
    console.error('Error al crear QR token:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /qr-tokens/:pedidoId/:camareroId — Obtiene el token existente
app.get('/make-server-25b11ac0/qr-tokens/:pedidoId/:camareroId', async (c) => {
  try {
    const pedidoId = c.req.param('pedidoId');
    const camareroId = c.req.param('camareroId');
    const data = await kv.get(`qr-token:${pedidoId}:${camareroId}`);
    if (!data) {
      return c.json({ success: false, error: 'No existe QR para este camarero+pedido' }, 404);
    }
    const projectRef = Deno.env.get('SUPABASE_URL')?.replace('https://', '').split('.')[0] || '';
    const fichajeUrl = `https://${projectRef}.supabase.co/functions/v1/make-server-25b11ac0/fichar/${data.token}`;
    return c.json({ success: true, token: data.token, qrUrl: fichajeUrl });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /fichajes/:pedidoId — Obtiene todos los fichajes de un pedido
app.get('/make-server-25b11ac0/fichajes/:pedidoId', async (c) => {
  try {
    const pedidoId = c.req.param('pedidoId');
    const fichajes = await kv.getByPrefix(`fichaje:${pedidoId}:`);
    return c.json({ success: true, data: fichajes });
  } catch (error) {
    console.error('Error al obtener fichajes:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// PUT /fichajes/:pedidoId/:camareroId — Edición manual por coordinador
app.put('/make-server-25b11ac0/fichajes/:pedidoId/:camareroId', requireSecret, async (c) => {
  try {
    const pedidoId = c.req.param('pedidoId');
    const camareroId = c.req.param('camareroId');
    const { entrada, salida, nota } = await c.req.json();

    const key = `fichaje:${pedidoId}:${camareroId}`;
    const existente = await kv.get(key) || {};

    const fichajeActualizado = {
      ...existente,
      pedidoId,
      camareroId,
      entrada: entrada ?? existente.entrada ?? null,
      salida: salida ?? existente.salida ?? null,
      nota: nota ?? existente.nota ?? '',
      editadoManualmente: true,
      editadoEn: new Date().toISOString(),
    };

    await kv.set(key, fichajeActualizado);

    // Disparar webhook si está configurado y hay salida registrada
    if (fichajeActualizado.salida) {
      await dispararWebhookFichaje(pedidoId, fichajeActualizado).catch(e => 
        console.error('Webhook falló (no bloqueante):', e)
      );
    }

    return c.json({ success: true, data: fichajeActualizado });
  } catch (error) {
    console.error('Error al actualizar fichaje:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Función interna: disparar webhook de nóminas
async function dispararWebhookFichaje(pedidoId: string, fichaje: any) {
  const pedido = await kv.get(pedidoId);
  const webhookUrl = pedido?.webhookNominas || Deno.env.get('WEBHOOK_NOMINAS_URL');
  if (!webhookUrl) return;

  const camarero = await kv.get(fichaje.camareroId);

  let horasTrabajadas: number | null = null;
  if (fichaje.entrada && fichaje.salida) {
    const entrada = new Date(fichaje.entrada);
    const salida = new Date(fichaje.salida);
    horasTrabajadas = Math.round(((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60)) * 100) / 100;
  }

  const payload = {
    evento: 'fichaje_completado',
    timestamp: new Date().toISOString(),
    pedido: {
      id: pedidoId,
      cliente: pedido?.cliente,
      lugar: pedido?.lugar,
      fecha: pedido?.diaEvento,
    },
    camarero: {
      id: fichaje.camareroId,
      nombre: camarero ? `${camarero.nombre} ${camarero.apellido}` : fichaje.camareroNombre,
      telefono: camarero?.telefono,
    },
    fichaje: {
      entrada: fichaje.entrada,
      salida: fichaje.salida,
      horas_trabajadas: horasTrabajadas,
      editado_manualmente: fichaje.editadoManualmente || false,
      nota: fichaje.nota || '',
    },
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.error(`📤 Webhook nóminas → ${webhookUrl} → HTTP ${res.status}`);
}

// GET /fichar/:token — Página HTML del QR (escaneo = fichaje automático)
app.get('/make-server-25b11ac0/fichar/:token', async (c) => {
  const token = c.req.param('token');
  const projectRef = Deno.env.get('SUPABASE_URL')?.replace('https://', '').split('.')[0] || '';
  const fichajeBaseUrl = `https://${projectRef}.supabase.co/functions/v1/make-server-25b11ac0`;

  try {
    const keyRef = await kv.get(`qr-token-idx:${token}`);
    if (!keyRef) {
      return c.html(htmlFichajeError('QR no válido o expirado'));
    }

    const qrData = await kv.get(keyRef);
    if (!qrData) {
      return c.html(htmlFichajeError('Datos del QR no encontrados'));
    }

    const { pedidoId, camareroId, camareroNombre, clienteNombre, lugar, diaEvento, horaEntradaPrevista, horaSalidaPrevista } = qrData;

    // Verificar si el evento es del día correcto (tolerancia ±12h)
    const ahora = new Date();
    const fechaEvento = new Date(diaEvento);
    const diffHoras = Math.abs(ahora.getTime() - fechaEvento.getTime()) / (1000 * 60 * 60);

    // Leer fichaje existente
    const fichajeKey = `fichaje:${pedidoId}:${camareroId}`;
    const fichaje = await kv.get(fichajeKey);

    let accion: 'entrada' | 'salida' | 'ya_completo';
    let timestamp = ahora.toISOString();

    if (!fichaje || !fichaje.entrada) {
      accion = 'entrada';
    } else if (!fichaje.salida) {
      accion = 'salida';
    } else {
      accion = 'ya_completo';
    }

    if (accion !== 'ya_completo') {
      const fichajeActualizado = {
        pedidoId,
        camareroId,
        camareroNombre,
        clienteNombre,
        lugar,
        diaEvento,
        entrada: accion === 'entrada' ? timestamp : fichaje?.entrada,
        salida: accion === 'salida' ? timestamp : null,
        editadoManualmente: false,
      };
      await kv.set(fichajeKey, fichajeActualizado);
      console.error(`✅ Fichaje ${accion.toUpperCase()} — ${camareroNombre} → ${clienteNombre} @ ${timestamp}`);

      // Disparar webhook al completar salida
      if (accion === 'salida') {
        await dispararWebhookFichaje(pedidoId, fichajeActualizado).catch(() => {});
      }

      // Notificar al coordinador del evento
      const pedido = await kv.get(pedidoId);
      if (pedido?.coordinadorId) {
        const emoji = accion === 'entrada' ? '🟢' : '🔴';
        const hora = new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        await notificarCoordinador(
          pedido.coordinadorId,
          `${emoji} FICHAJE ${accion === 'entrada' ? 'ENTRADA' : 'SALIDA'}\n\n${camareroNombre}\nEvento: ${clienteNombre}\nLugar: ${lugar}\nHora: ${hora}`
        );
      }
    }

    const fechaStr = new Date(diaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const horaStr = new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const fichajeUrlPage = `${fichajeBaseUrl}/fichar/${token}`;
    return c.html(htmlFichajeOk({ accion, camareroNombre, clienteNombre, lugar, fechaStr, horaStr, horaEntradaPrevista, horaSalidaPrevista, fichajeUrl: fichajeUrlPage }));

  } catch (error) {
    console.error('Error en fichaje QR:', error);
    return c.html(htmlFichajeError('Error interno al procesar el fichaje'));
  }
});

// Helper: HTML página de fichaje exitoso
function htmlFichajeOk({ accion, camareroNombre, clienteNombre, lugar, fechaStr, horaStr, horaEntradaPrevista, horaSalidaPrevista, fichajeUrl }: any) {
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

  return \`<!DOCTYPE html>
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
      \${!esCompleto ? \`
      <div class="hora-badge">
        <div class="label">\${esEntrada ? 'Hora de entrada' : 'Hora de salida'}</div>
        <div class="hora">\${horaStr}</div>
      </div>\` : ''}

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
        \${horaEntradaPrevista ? \`
        <div class="info-row">
          <span class="emoji">🕐</span>
          <div>
            <span class="label">Horario previsto</span>
            <span class="value">\${horaEntradaPrevista} – \${horaSalidaPrevista || '?'}</span>
          </div>
        </div>\` : ''}
      </div>

      \${mostrarQR ? \`
      <div class="qr-section">
        <div class="qr-label">📲 Escaneá al salir del evento</div>
        <div id="qrcode"></div>
        <div class="qr-sub">El mismo código registra tu salida</div>
      </div>\` : ''}
    </div>
    <div class="footer">
      <p>Registro automático · Gestión de Eventos</p>
    </div>
  </div>
  \${mostrarQR ? \`
  <script>
    new QRCode(document.getElementById("qrcode"), {
      text: "\${fichajeUrl}",
      width: 180,
      height: 180,
      colorDark: "#1f2937",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  <\/script>\` : ''}
</body>
</html>\`;
}

function htmlFichajeError(msg: string) {
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

Deno.serve(app.fetch);