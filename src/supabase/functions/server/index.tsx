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
    console.log('Error al obtener clientes:', error);
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
    console.log('Error al crear cliente:', error);
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
    console.log('Error al actualizar cliente:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/clientes/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error al eliminar cliente:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== CAMAREROS ==============
app.get('/make-server-25b11ac0/camareros', async (c) => {
  try {
    const camareros = await kv.getByPrefix('camarero:');
    return c.json({ success: true, data: camareros });
  } catch (error) {
    console.log('Error al obtener camareros:', error);
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
    console.log('Error al crear camarero:', error);
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
    console.log('Error al actualizar camarero:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/camareros/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error al eliminar camarero:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== COORDINADORES ==============
app.get('/make-server-25b11ac0/coordinadores', async (c) => {
  try {
    const coordinadores = await kv.getByPrefix('coordinador:');
    return c.json({ success: true, data: coordinadores });
  } catch (error) {
    console.log('Error al obtener coordinadores:', error);
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
    console.log('Error al crear coordinador:', error);
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
    console.log('Error al actualizar coordinador:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/coordinadores/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error al eliminar coordinador:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== PEDIDOS/EVENTOS ==============
app.get('/make-server-25b11ac0/pedidos', async (c) => {
  try {
    const pedidos = await kv.getByPrefix('pedido:');
    return c.json({ success: true, data: pedidos });
  } catch (error) {
    console.log('Error al obtener pedidos:', error);
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
    console.log('Error al crear pedido:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-25b11ac0/pedidos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    console.log('📝 Actualizando pedido:', id);
    console.log('   Estado asignaciones:', data.asignaciones?.map(a => ({ num: a.camareroNumero, estado: a.estado })));
    
    await kv.set(id, data);
    return c.json({ success: true, data });
  } catch (error) {
    console.log('❌ Error al actualizar pedido:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/pedidos/:id', requireSecret, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error al eliminar pedido:', error);
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
    console.log('Error al obtener informe de cliente:', error);
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
    console.log('Error al obtener informe de camarero:', error);
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
    console.log('Error al guardar token:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Función para enviar notificación al coordinador
async function notificarCoordinador(coordinadorId: string, mensaje: string) {
  try {
    const coordinador = await kv.get(coordinadorId);
    if (!coordinador || !coordinador.telefono) {
      console.log('Coordinador sin teléfono configurado');
      return;
    }

    // Obtener la API key de WhatsApp
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    
    if (!whatsappApiKey || !whatsappPhoneId) {
      console.log('WhatsApp API no configurada. Mensaje que se enviaría:', mensaje);
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
    console.log('Notificación enviada al coordinador:', result);
  } catch (error) {
    console.log('Error al notificar coordinador:', error);
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
    
    console.log(`✅ CONFIRMACIÓN: Camarero ${camarero?.nombre} ${camarero?.apellido} confirmó asistencia al evento "${pedido.cliente}"`);
    console.log(`   Estado actualizado: confirmado`);
    console.log(`   Asignaciones totales: ${asignaciones.length}`);
    
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
        console.log(`✅ Chat grupal creado automáticamente para pedido: ${pedido.cliente} (Expira: ${fechaEliminacion.toISOString()})`);
      }
    }
    
    // Notificar al coordinador
    const nombreCamarero = camarero ? `${camarero.nombre} ${camarero.apellido}` : 'Camarero';
    const fechaEvento = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    let mensajeCoordinador = `✅ CONFIRMACIÓN RECIBIDA\n\n${nombreCamarero} ha confirmado su asistencia.\n\nEvento: ${pedido.cliente}\nFecha: ${fechaEvento}\nLugar: ${pedido.lugar}\nHora: ${pedido.horaEntrada}`;
    
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
    console.log('Error al confirmar asistencia:', error);
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
      
      console.log(`❌ RECHAZO: Camarero ${camarero?.nombre} ${camarero?.apellido} rechazó el evento "${pedido.cliente}"`);
      console.log(`   Estado actualizado: rechazado`);
      console.log(`   Eliminación programada: ${new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()}`);
      
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
    console.log('Error al procesar no confirmación:', error);
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
    console.log('Error al crear chat grupal:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Diagnóstico completo de chats
app.get('/make-server-25b11ac0/diagnostico-chats', async (c) => {
  try {
    console.log('🔍 === EJECUTANDO DIAGNÓSTICO COMPLETO DE CHATS ===');
    
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
    
    console.log('📊 DIAGNÓSTICO COMPLETO:', JSON.stringify(diagnostico, null, 2));
    
    return c.json({ success: true, diagnostico });
  } catch (error) {
    console.log('❌ Error en diagnóstico:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reparar chats faltantes automáticamente
app.post('/make-server-25b11ac0/reparar-chats', async (c) => {
  try {
    console.log('🔧 === INICIANDO REPARACIÓN DE CHATS ===');
    
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
        console.log(`✅ Chat creado para pedido ${pedidoId}: ${pedido.cliente}`);
        
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
    
    console.log('🔧 RESUMEN DE REPARACIÓN:', resumen);
    
    return c.json({ 
      success: true, 
      resumen,
      resultados 
    });
  } catch (error) {
    console.log('❌ Error al reparar chats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Obtener chats del coordinador (con limpieza automática de expirados)
app.get('/make-server-25b11ac0/chats/:coordinadorId', async (c) => {
  try {
    const coordinadorId = c.req.param('coordinadorId');
    console.log(`🔍 Buscando chats para coordinadorId: ${coordinadorId}`);
    
    const todosLosChats = await kv.getByPrefix('chat:');
    console.log(`🔍 Total de chats en base de datos: ${todosLosChats.length}`);
    
    if (todosLosChats.length > 0) {
      console.log('🔍 IDs de coordinadores en todos los chats:', todosLosChats.map(c => ({ chatId: c.id, coordinadorId: c.coordinadorId })));
    }
    
    // Filtrar por coordinador
    let chatsDelCoordinador = todosLosChats.filter(chat => chat.coordinadorId === coordinadorId);
    console.log(`🔍 Chats filtrados por coordinadorId: ${chatsDelCoordinador.length}`);
    
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
        console.log(`🗑️ Chat eliminado por expiración: ${chat.id} - Expiró el ${fechaExpiracion.toISOString()}`);
      }
    }
    
    console.log(`📊 Chats activos para coordinador ${coordinadorId}: ${chatsActivos.length} de ${chatsDelCoordinador.length}`);
    
    return c.json({ success: true, data: chatsActivos });
  } catch (error) {
    console.log('Error al obtener chats:', error);
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
    console.log('⚠️ Error al generar PDF, usando fallback...', error);
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
  
  console.log('🔍 Diagnóstico de variables de entorno:');
  console.log(`  RESEND_API_KEY: ${resendApiKey ? `configurada (${resendApiKey.length} chars)` : 'NO CONFIGURADA'}`);
  console.log(`  SENDGRID_API_KEY: ${sendgridApiKey ? `configurada (${sendgridApiKey.length} chars)` : 'NO CONFIGURADA'}`);
  console.log(`  MAILGUN_API_KEY: ${mailgunApiKey ? `configurada (${mailgunApiKey.length} chars)` : 'NO CONFIGURADA'}`);
  console.log(`  EMAIL_FROM: ${emailFrom}`);
  console.log(`  Adjuntos: ${attachments ? attachments.length : 0}`);
  
  // 1. Intentar con Resend (prioridad 1)
  if (resendApiKey) {
    try {
      console.log('📧 Intentando enviar con Resend...');
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
        console.log('✅ Email enviado con Resend:', result);
        return { success: true, provider: 'Resend', messageId: result.id };
      } else {
        console.log('❌ Error de Resend:', result);
        throw new Error(result.message || 'Error al enviar con Resend');
      }
    } catch (error) {
      console.log('⚠️ Resend falló, intentando siguiente proveedor...', error);
    }
  }
  
  // 2. Intentar con SendGrid (prioridad 2)
  if (sendgridApiKey) {
    try {
      console.log('📧 Intentando enviar con SendGrid...');
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
        console.log('✅ Email enviado con SendGrid');
        return { success: true, provider: 'SendGrid' };
      } else {
        const errorText = await response.text();
        console.log('❌ Error de SendGrid:', errorText);
        throw new Error('Error al enviar con SendGrid');
      }
    } catch (error) {
      console.log('⚠️ SendGrid falló, intentando siguiente proveedor...', error);
    }
  }
  
  // 3. Intentar con Mailgun (prioridad 3)
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
  
  if (mailgunApiKey && mailgunDomain) {
    try {
      console.log('📧 Intentando enviar con Mailgun...');
      
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
        console.log('✅ Email enviado con Mailgun:', result);
        return { success: true, provider: 'Mailgun', messageId: result.id };
      } else {
        console.log('❌ Error de Mailgun:', result);
        throw new Error(result.message || 'Error al enviar con Mailgun');
      }
    } catch (error) {
      console.log('⚠️ Mailgun falló:', error);
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
    console.log('🔍 DIAGNÓSTICO COMPLETO DE EMAIL:');
    console.log(`  RESEND_API_KEY: ${resendApiKey ? `✓ configurada (${resendApiKey.length} chars, inicia con: ${resendApiKey.substring(0, 5)}...)` : '✗ NO CONFIGURADA'}`);
    console.log(`  SENDGRID_API_KEY: ${sendgridApiKey ? `✓ configurada (${sendgridApiKey.length} chars)` : '✗ NO CONFIGURADA'}`);
    console.log(`  MAILGUN_API_KEY: ${mailgunApiKey ? `✓ configurada (${mailgunApiKey.length} chars)` : '✗ NO CONFIGURADA'}`);
    console.log(`  MAILGUN_DOMAIN: ${mailgunDomain ? `✓ configurado: ${mailgunDomain}` : '✗ NO CONFIGURADO'}`);
    console.log(`  EMAIL_FROM: ${emailFrom}`);
    
    const servicios = {
      resend: !!resendApiKey,
      sendgrid: !!sendgridApiKey,
      mailgun: !!(mailgunApiKey && mailgunDomain)
    };
    
    console.log(`📊 Servicios detectados:`, servicios);
    
    let servicioActivo = null;
    if (servicios.resend) servicioActivo = 'Resend';
    else if (servicios.sendgrid) servicioActivo = 'SendGrid';
    else if (servicios.mailgun) servicioActivo = 'Mailgun';
    
    console.log(`🎯 Servicio activo seleccionado: ${servicioActivo}`);
    
    const configured = servicioActivo !== null;
    
    // Construir lista de servicios disponibles con capitalización correcta
    const serviciosDisponiblesList = [];
    if (servicios.resend) serviciosDisponiblesList.push('Resend');
    if (servicios.sendgrid) serviciosDisponiblesList.push('SendGrid');
    if (servicios.mailgun) serviciosDisponiblesList.push('Mailgun');
    
    console.log(`✅ Configurado: ${configured}, Servicios disponibles:`, serviciosDisponiblesList);
    
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
    console.log('Error al verificar configuración de email:', error);
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
    
    console.log('📧 Procesando envío de parte de servicio...');
    console.log(`   Cliente: ${pedido?.cliente}`);
    console.log(`   Fecha: ${pedido?.fecha}`);
    
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
    console.log('📄 Generando PDF del parte de servicio...');
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
      console.log(`✅ PDF generado exitosamente: ${nombreArchivo} (${Math.round(pdfBase64.length / 1024)} KB)`);
    } else {
      console.log('⚠️ No se pudo generar el PDF, el email se enviará sin adjunto');
    }
    
    // Enviar usando la función genérica
    console.log('📤 Enviando email...');
    const result = await enviarEmailGenerico({
      destinatario,
      cc,
      asunto,
      htmlBody: emailBody,
      attachments
    });
    
    if (result.success) {
      console.log(`✅ Email enviado exitosamente con ${attachments.length} adjunto(s)`);
    }
    
    return c.json(result);
  } catch (error) {
    console.log('❌ Error al enviar email:', error);
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
    console.log('Error al verificar configuración WhatsApp:', error);
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
    
    console.log(`📱 Enviando WhatsApp a ${numeroLimpio}`);
    
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
      console.log('❌ Error de WhatsApp API:', result);
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
    
    console.log('✅ WhatsApp enviado exitosamente:', result);
    return c.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      data: result
    });
    
  } catch (error) {
    console.log('❌ Error al enviar WhatsApp:', error);
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
    console.log('Error al obtener mensajes del chat:', error);
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
    console.log('Error al crear mensaje en chat:', error);
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
      console.log('Google Maps error:', data);
      return c.json({ success: false, error: 'No se pudo calcular la distancia', fallback: true });
    }

    const element = data.rows[0].elements[0];
    
    if (element.status !== 'OK') {
      return c.json({ success: false, error: 'Destino no encontrado', fallback: true });
    }

    const duracionSegundos = element.duration.value;
    const duracionMinutos = Math.ceil(duracionSegundos / 60);
    const distanciaKm = (element.distance.value / 1000).toFixed(1);

    console.log(`✅ Distancia calculada: ${distanciaKm}km, ${duracionMinutos}min`);

    return c.json({
      success: true,
      duracionMinutos,
      distanciaKm,
      duracionTexto: element.duration.text,
      distanciaTexto: element.distance.text
    });

  } catch (error) {
    console.log('Error al calcular distancia:', error);
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
    console.log('Error al marcar parte como enviado:', error);
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
    console.log('Error al obtener partes enviados:', error);
    return c.json({ success: false, enviados: {} }, 500);
  }
});

Deno.serve(app.fetch);