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
    const camarero = {
      id,
      numero: contador,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      email: data.email,
      disponibilidad: data.disponibilidad || [],
      comentarios: data.comentarios || ''
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
    const { nombre, telefono } = await c.req.json();
    
    // Obtener el contador actual
    const contadorData = await kv.get('contador:coordinadores');
    const contador = contadorData ? contadorData.valor + 1 : 1;
    
    // Actualizar contador
    await kv.set('contador:coordinadores', { valor: contador });
    
    const id = `coordinador:${Date.now()}`;
    const coordinador = {
      id,
      numero: contador,
      nombre,
      telefono: telefono || ''
    };
    
    await kv.set(id, coordinador);
    return c.json({ success: true, data: coordinador });
  } catch (error) {
    console.log('Error al crear coordinador:', error);
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
      a.camareroId === camareroId ? { ...a, estado: 'confirmado' } : a
    );
    
    await kv.set(pedidoId, { ...pedido, asignaciones });
    
    // Notificar al coordinador
    const nombreCamarero = camarero ? `${camarero.nombre} ${camarero.apellido}` : 'Camarero';
    const fechaEvento = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    const mensajeCoordinador = `✅ CONFIRMACIÓN RECIBIDA\n\n${nombreCamarero} ha confirmado su asistencia.\n\nEvento: ${pedido.cliente}\nFecha: ${fechaEvento}\nLugar: ${pedido.lugar}\nHora: ${pedido.horaEntrada}`;
    
    await notificarCoordinador(coordinadorId, mensajeCoordinador);
    
    // Eliminar token usado
    await kv.del(`confirmacion:${token}`);
    
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación Exitosa</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          .success { color: #16a34a; font-size: 3rem; }
          h1 { color: #16a34a; margin: 1rem 0; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h1>¡Confirmado!</h1>
          <p>Has confirmado tu asistencia al evento exitosamente.</p>
          <p>El coordinador ha sido notificado de tu confirmación.</p>
          <p>Gracias por tu confirmación.</p>
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
      // Remover camarero de las asignaciones
      const asignaciones = pedido.asignaciones.filter(a => a.camareroId !== camareroId);
      await kv.set(pedidoId, { ...pedido, asignaciones });
      
      // Notificar al coordinador
      const nombreCamarero = camarero ? `${camarero.nombre} ${camarero.apellido}` : 'Camarero';
      const fechaEvento = new Date(pedido.diaEvento).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      const mensajeCoordinador = `❌ RECHAZO DE SERVICIO\n\n${nombreCamarero} ha indicado que NO puede asistir y ha sido eliminado automáticamente.\n\nEvento: ${pedido.cliente}\nFecha: ${fechaEvento}\nLugar: ${pedido.lugar}\nHora: ${pedido.horaEntrada}\n\n⚠️ ACCIÓN REQUERIDA: Asignar un camarero de reemplazo.`;
      
      await notificarCoordinador(coordinadorId, mensajeCoordinador);
    }
    
    // Eliminar token usado
    await kv.del(`confirmacion:${token}`);
    
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>No Confirmado</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          .info { color: #ea580c; font-size: 3rem; }
          h1 { color: #ea580c; margin: 1rem 0; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="info">✗</div>
          <h1>No Confirmado</h1>
          <p>Has indicado que no podrás asistir al evento.</p>
          <p>Has sido eliminado automáticamente de la asignación.</p>
          <p>El coordinador ha sido notificado.</p>
          <p>Gracias por tu respuesta.</p>
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

// ============== WHATSAPP ==============
app.get('/make-server-25b11ac0/verificar-whatsapp-config', async (c) => {
  try {
    let whatsappApiKey = null;
    let whatsappPhoneId = null;
    let source = null;
    
    // PRIORIDAD 1: Buscar en KV store primero
    const kvApiKey = await kv.get('config:whatsapp_api_key');
    const kvPhoneId = await kv.get('config:whatsapp_phone_id');
    
    if (kvApiKey && kvPhoneId && kvApiKey.length >= 50) {
      whatsappApiKey = kvApiKey;
      whatsappPhoneId = kvPhoneId;
      source = 'configuración guardada (KV store)';
    } else {
      // PRIORIDAD 2: Variables de entorno (solo si son válidas)
      const envApiKey = Deno.env.get('WHATSAPP_API_KEY');
      const envPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
      
      // Validar que el token de variables de entorno sea válido
      if (envApiKey && envPhoneId && envApiKey.length >= 50) {
        whatsappApiKey = envApiKey;
        whatsappPhoneId = envPhoneId;
        source = 'variables de entorno';
      } else if (envApiKey && envApiKey.length < 50) {
        console.log(`⚠️ Token en variables de entorno es inválido (${envApiKey.length} chars, comienza con "${envApiKey.substring(0, 10)}..."). Ignorando.`);
      }
    }
    
    const configured = !!(whatsappApiKey && whatsappPhoneId && whatsappApiKey.length >= 50);
    
    return c.json({ 
      success: true, 
      configured,
      source: configured ? source : null,
      message: configured 
        ? `WhatsApp Business API configurada correctamente (desde ${source})` 
        : 'WhatsApp Business API no configurada o el token es inválido. Por favor, configura un token permanente válido desde la pestaña "Configuración WhatsApp".'
    });
  } catch (error) {
    console.log('Error al verificar configuración WhatsApp:', error);
    return c.json({ success: false, configured: false }, 500);
  }
});

app.post('/make-server-25b11ac0/actualizar-whatsapp-config', async (c) => {
  try {
    const { apiKey, phoneId } = await c.req.json();
    
    if (!apiKey || !phoneId) {
      return c.json({ 
        success: false, 
        error: 'API Key y Phone ID son requeridos' 
      });
    }
    
    // Validar formato del token
    if (apiKey.length < 100) {
      return c.json({
        success: false,
        error: 'El token parece inválido (muy corto). Debe ser un token de acceso permanente.'
      });
    }
    
    // Guardar en KV store con prefijo especial para configuración
    await kv.set('config:whatsapp_api_key', apiKey);
    await kv.set('config:whatsapp_phone_id', phoneId);
    
    console.log('✅ Configuración de WhatsApp actualizada en KV store');
    console.log('   - API Key length:', apiKey.length, 'chars');
    console.log('   - Phone ID:', phoneId);
    
    return c.json({ 
      success: true, 
      message: 'Configuración guardada exitosamente. Los cambios están activos inmediatamente.'
    });
  } catch (error) {
    console.log('❌ Error al actualizar configuración WhatsApp:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-25b11ac0/enviar-whatsapp', async (c) => {
  try {
    const { telefono, mensaje } = await c.req.json();
    
    console.log('📱 Intentando enviar WhatsApp a:', telefono);
    
    // Estrategia de obtención de configuración:
    // 1. Primero intentar KV store (configuración guardada por el usuario)
    // 2. Luego variables de entorno (solo si son válidas)
    // 3. Validar que los tokens sean de longitud adecuada
    
    let whatsappApiKey = null;
    let whatsappPhoneId = null;
    let configSource = null;
    
    // PRIORIDAD 1: Buscar en KV store primero
    const kvApiKey = await kv.get('config:whatsapp_api_key');
    const kvPhoneId = await kv.get('config:whatsapp_phone_id');
    
    if (kvApiKey && kvPhoneId && kvApiKey.length >= 50) {
      whatsappApiKey = kvApiKey;
      whatsappPhoneId = kvPhoneId;
      configSource = 'KV store (configuración guardada desde la pestaña)';
      console.log('🔑 Usando configuración de WhatsApp desde KV store');
    } else {
      // PRIORIDAD 2: Variables de entorno (solo si son válidas)
      const envApiKey = Deno.env.get('WHATSAPP_API_KEY');
      const envPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
      
      // Validar que el token de variables de entorno sea válido (mínimo 50 caracteres)
      if (envApiKey && envPhoneId && envApiKey.length >= 50) {
        whatsappApiKey = envApiKey;
        whatsappPhoneId = envPhoneId;
        configSource = 'variables de entorno';
        console.log('🔑 Usando configuración de WhatsApp desde variables de entorno');
      } else if (envApiKey && envApiKey.length < 50) {
        console.log(`⚠️ Token en variables de entorno es inválido (${envApiKey.length} chars). Ignorando.`);
      }
    }
    
    if (!whatsappApiKey || !whatsappPhoneId) {
      console.log('❌ WhatsApp API no configurada correctamente');
      return c.json({ 
        success: false, 
        error: 'WhatsApp API no configurada. Por favor, ve a la pestaña "Configuración WhatsApp" y configura tus credenciales de Meta Business Suite con un token permanente válido.',
        needsConfiguration: true,
        helpMessage: '💡 El token debe ser un Token de Acceso PERMANENTE de WhatsApp Business API con 200+ caracteres. Los tokens temporales NO funcionan.'
      });
    }
    
    // VALIDACIÓN CRÍTICA: El Phone Number ID NO debe ser un número de teléfono
    // Un Phone Number ID válido es un número largo como "123456789012345"
    // NO debe contener + ni espacios
    if (whatsappPhoneId.includes('+') || whatsappPhoneId.includes(' ') || whatsappPhoneId.length < 10) {
      console.log('❌ Phone Number ID inválido:', whatsappPhoneId);
      return c.json({
        success: false,
        error: `❌ PHONE NUMBER ID INCORRECTO\n\n` +
               `Has configurado: "${whatsappPhoneId}"\n\n` +
               `❗ IMPORTANTE: El "Phone Number ID" NO es un número de teléfono.\n\n` +
               `🔧 CÓMO OBTENER EL PHONE NUMBER ID CORRECTO:\n\n` +
               `1. Ve a: https://business.facebook.com/wa/manage/home/\n` +
               `2. Selecciona tu cuenta de WhatsApp Business\n` +
               `3. En la sección "API Setup" o "Configuración de API"\n` +
               `4. Busca "Phone Number ID" (es un número largo como "123456789012345")\n` +
               `5. Cópialo EXACTAMENTE (sin el + ni espacios)\n` +
               `6. Actualízalo en la pestaña "Configuración WhatsApp"\n\n` +
               `💡 Ejemplo:\n` +
               `   ✅ Correcto: "106540852500791" (Phone Number ID)\n` +
               `   ❌ Incorrecto: "+34628904614" (número de teléfono)\n\n` +
               `El Phone Number ID es diferente al número de teléfono y lo encuentras en la configuración de tu cuenta de WhatsApp Business API.`,
        needsConfiguration: true,
        helpUrl: 'https://business.facebook.com/wa/manage/home/',
        debugInfo: {
          phoneIdRecibido: whatsappPhoneId,
          problema: 'El valor contiene caracteres de número de teléfono (+, espacios) o es muy corto',
          solucion: 'Debes usar el Phone Number ID, no el número de teléfono'
        }
      });
    }
    
    // Información de debug (sin mostrar el token completo por seguridad)
    console.log('🔍 Debug Info:');
    console.log('   - Config source:', configSource);
    console.log('   - API Key length:', whatsappApiKey.length, 'chars');
    console.log('   - API Key prefix:', whatsappApiKey.substring(0, 20) + '...');
    console.log('   - Phone Number ID:', whatsappPhoneId);
    
    // Validar formato del token - Los tokens válidos suelen tener 200+ caracteres
    if (whatsappApiKey.length < 50) {
      console.log('⚠️ El token parece ser inválido (muy corto)');
      return c.json({
        success: false,
        error: `El token actual tiene solo ${whatsappApiKey.length} caracteres y no es válido.\n\n` +
               `Un token válido de WhatsApp Business API debe tener 200+ caracteres.\n\n` +
               `🔧 SOLUCIÓN:\n` +
               `1. Ve a la pestaña "Configuración WhatsApp"\n` +
               `2. Genera un nuevo Token de Acceso PERMANENTE desde Meta Business Suite\n` +
               `3. Guárdalo en la aplicación\n\n` +
               `El token guardado sobrescribirá automáticamente cualquier configuración incorrecta.`,
        needsConfiguration: true,
        helpUrl: 'https://developers.facebook.com/docs/whatsapp/business-management-api/get-started',
        debugInfo: {
          tokenLength: whatsappApiKey.length,
          configSource: configSource,
          tokenPrefix: whatsappApiKey.substring(0, 10) + '...'
        }
      });
    }

    // Limpiar número de teléfono destinatario
    let numeroLimpio = telefono.replace(/\D/g, '');
    if (numeroLimpio.length === 9) {
      numeroLimpio = '34' + numeroLimpio;
    }
    
    console.log('📱 Número destinatario limpio:', numeroLimpio);

    // Enviar mensaje usando WhatsApp Business API
    const whatsappApiUrl = `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`;
    console.log('🌐 URL de API:', whatsappApiUrl);
    
    const response = await fetch(whatsappApiUrl, {
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
    
    if (response.ok) {
      console.log('✅ WhatsApp enviado exitosamente:', result);
      return c.json({ success: true, data: result });
    } else {
      console.log('❌ Error al enviar WhatsApp:', result);
      
      // Detectar errores específicos
      let errorMessage = result.error?.message || 'Error al enviar mensaje';
      let needsConfiguration = false;
      
      if (errorMessage.includes('access token') || errorMessage.includes('OAuth') || errorMessage.includes('Invalid OAuth')) {
        errorMessage = `Token de WhatsApp inválido o expirado: "${result.error?.message}".\n\n` +
                      `🔧 SOLUCIÓN:\n` +
                      `1. Ve a: https://business.facebook.com/wa/manage/home/\n` +
                      `2. Genera un nuevo Token de Acceso PERMANENTE (no temporal)\n` +
                      `3. Ve a la pestaña "Configuración WhatsApp" en la aplicación\n` +
                      `4. Pega el nuevo token y guarda\n\n` +
                      `El token debe ser permanente y tener permisos de whatsapp_business_messaging.`;
        needsConfiguration = true;
      } else if (errorMessage.includes('does not exist') || errorMessage.includes('cannot be loaded') || result.error?.code === 100) {
        errorMessage = `❌ PHONE NUMBER ID INCORRECTO\n\n` +
                      `El Phone Number ID "${whatsappPhoneId}" no existe o no tienes permisos.\n\n` +
                      `❗ IMPORTANTE: El "Phone Number ID" NO es tu número de teléfono.\n\n` +
                      `🔧 CÓMO OBTENER EL PHONE NUMBER ID CORRECTO:\n\n` +
                      `1. Ve a: https://business.facebook.com/wa/manage/home/\n` +
                      `2. Selecciona tu cuenta de WhatsApp Business\n` +
                      `3. En "API Setup", busca "Phone Number ID"\n` +
                      `4. Es un número largo (ej: "106540852500791")\n` +
                      `5. Cópialo y actualízalo en "Configuración WhatsApp"\n\n` +
                      `💡 NO uses tu número de teléfono (+34...), usa el ID que te proporciona Meta.`;
        needsConfiguration = true;
      }
      
      return c.json({ 
        success: false, 
        error: errorMessage,
        needsConfiguration,
        details: result,
        helpUrl: 'https://business.facebook.com/wa/manage/home/',
        debugInfo: {
          configSource: configSource,
          phoneId: whatsappPhoneId,
          tokenLength: whatsappApiKey.length
        }
      });
    }
  } catch (error) {
    console.log('❌ Error general al enviar WhatsApp:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============== ENVÍO DE EMAIL ==============

// Función genérica para enviar emails con detección automática del proveedor
async function enviarEmailGenerico(params: {
  destinatario: string;
  cc?: string | null;
  asunto: string;
  htmlBody: string;
}) {
  const { destinatario, cc, asunto, htmlBody } = params;
  
  // Detectar qué servicio está configurado
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
  
  // Email remitente configurable
  const emailFrom = Deno.env.get('EMAIL_FROM') || 'no-reply@sistema.com';
  
  // PRIORIDAD 1: Resend
  if (resendApiKey) {
    console.log('🚀 Usando Resend para enviar email');
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [destinatario],
          cc: cc ? [cc] : undefined,
          subject: asunto,
          html: htmlBody
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Email enviado exitosamente con Resend:', result);
        return { success: true, provider: 'Resend', data: result };
      } else {
        console.log('❌ Error al enviar con Resend:', result);
        return { 
          success: false, 
          provider: 'Resend',
          error: result.message || 'Error al enviar email' 
        };
      }
    } catch (error) {
      console.log('❌ Error de conexión con Resend:', error);
      return { success: false, provider: 'Resend', error: String(error) };
    }
  }
  
  // PRIORIDAD 2: SendGrid
  if (sendgridApiKey) {
    console.log('🚀 Usando SendGrid para enviar email');
    try {
      const emailData: any = {
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
      
      // Agregar CC si existe
      if (cc) {
        emailData.personalizations[0].cc = [{ email: cc }];
      }
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        console.log('✅ Email enviado exitosamente con SendGrid');
        return { success: true, provider: 'SendGrid', data: { id: response.headers.get('x-message-id') } };
      } else {
        const errorText = await response.text();
        console.log('❌ Error al enviar con SendGrid:', errorText);
        return { 
          success: false, 
          provider: 'SendGrid',
          error: errorText || 'Error al enviar email' 
        };
      }
    } catch (error) {
      console.log('❌ Error de conexión con SendGrid:', error);
      return { success: false, provider: 'SendGrid', error: String(error) };
    }
  }
  
  // PRIORIDAD 3: Mailgun
  if (mailgunApiKey && mailgunDomain) {
    console.log('🚀 Usando Mailgun para enviar email');
    try {
      const formData = new FormData();
      formData.append('from', emailFrom);
      formData.append('to', destinatario);
      if (cc) formData.append('cc', cc);
      formData.append('subject', asunto);
      formData.append('html', htmlBody);
      
      const response = await fetch(
        `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
          },
          body: formData
        }
      );

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Email enviado exitosamente con Mailgun:', result);
        return { success: true, provider: 'Mailgun', data: result };
      } else {
        console.log('❌ Error al enviar con Mailgun:', result);
        return { 
          success: false, 
          provider: 'Mailgun',
          error: result.message || 'Error al enviar email' 
        };
      }
    } catch (error) {
      console.log('❌ Error de conexión con Mailgun:', error);
      return { success: false, provider: 'Mailgun', error: String(error) };
    }
  }
  
  // Si no hay ningún servicio configurado
  console.log('⚠️ No hay ningún servicio de email configurado');
  return { 
    success: false, 
    provider: 'Ninguno',
    error: 'No hay ningún servicio de email configurado. Por favor, configura al menos uno: RESEND_API_KEY, SENDGRID_API_KEY, o MAILGUN_API_KEY + MAILGUN_DOMAIN' 
  };
}

// Endpoint para verificar configuración de email
app.get('/make-server-25b11ac0/verificar-email-config', async (c) => {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const emailFrom = Deno.env.get('EMAIL_FROM');
    
    const serviciosDisponibles = [];
    let servicioActivo = null;
    
    if (resendApiKey) {
      serviciosDisponibles.push('Resend');
      servicioActivo = servicioActivo || 'Resend';
    }
    if (sendgridApiKey) {
      serviciosDisponibles.push('SendGrid');
      servicioActivo = servicioActivo || 'SendGrid';
    }
    if (mailgunApiKey && mailgunDomain) {
      serviciosDisponibles.push('Mailgun');
      servicioActivo = servicioActivo || 'Mailgun';
    }
    
    const configured = serviciosDisponibles.length > 0;
    
    return c.json({ 
      success: true, 
      configured,
      servicioActivo,
      serviciosDisponibles,
      emailFrom: emailFrom || 'no-reply@sistema.com',
      message: configured 
        ? `Servicio de email configurado: ${servicioActivo} (Disponibles: ${serviciosDisponibles.join(', ')})` 
        : 'No hay ningún servicio de email configurado. Configura al menos uno: Resend, SendGrid o Mailgun.'
    });
  } catch (error) {
    console.log('Error al verificar configuración de email:', error);
    return c.json({ success: false, configured: false }, 500);
  }
});

app.post('/make-server-25b11ac0/enviar-email-parte', async (c) => {
  try {
    const { destinatario, cc, asunto, mensaje, parteHTML, pedido } = await c.req.json();
    
    console.log('📧 Solicitud de envío de email recibida');
    console.log('   Destinatario:', destinatario);
    console.log('   CC:', cc || 'No');
    console.log('   Asunto:', asunto);
    console.log('   Pedido:', pedido.cliente, '-', pedido.fecha);
    
    // Construir el cuerpo del email con diseño profesional
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .wrapper { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h2 { color: white; margin: 0; font-size: 24px; }
          .message-box { background: #f9fafb; padding: 25px; border-left: 4px solid #10b981; border-right: 1px solid #e5e7eb; }
          .message-box p { color: #374151; line-height: 1.8; white-space: pre-line; margin: 0; }
          .parte-container { background: white; border: 1px solid #e5e7eb; overflow: hidden; }
          .footer { margin-top: 20px; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center; }
          .footer p { color: #6b7280; font-size: 13px; margin: 5px 0; }
          .footer a { color: #10b981; text-decoration: none; }
          .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h2>📋 Parte de Servicio</h2>
            <span class="badge">Sistema de Gestión de Camareros</span>
          </div>
          
          <div class="message-box">
            <p>${mensaje}</p>
          </div>
          
          <div class="parte-container">
            ${parteHTML}
          </div>
          
          <div class="footer">
            <p><strong>Este email fue generado automáticamente</strong></p>
            <p>Sistema de Gestión de Camareros</p>
            <p style="margin-top: 15px; font-size: 11px;">
              Si tienes alguna pregunta sobre este parte, contacta directamente con el coordinador.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Enviar email usando la función genérica
    const result = await enviarEmailGenerico({
      destinatario,
      cc,
      asunto,
      htmlBody: emailBody
    });
    
    if (result.success) {
      console.log(`✅ Email enviado exitosamente usando ${result.provider}`);
      return c.json({ 
        success: true, 
        provider: result.provider,
        data: result.data,
        message: `Email enviado correctamente usando ${result.provider}` 
      });
    } else {
      console.log(`❌ Error al enviar email con ${result.provider}:`, result.error);
      return c.json({ 
        success: false, 
        provider: result.provider,
        error: result.error 
      }, 400);
    }
    
  } catch (error) {
    console.log('❌ Error general al procesar envío de email:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);