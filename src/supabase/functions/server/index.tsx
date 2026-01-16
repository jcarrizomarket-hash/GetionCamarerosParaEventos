import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

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

app.post('/make-server-25b11ac0/clientes', async (c) => {
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

app.put('/make-server-25b11ac0/clientes/:id', async (c) => {
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

app.delete('/make-server-25b11ac0/clientes/:id', async (c) => {
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

app.post('/make-server-25b11ac0/camareros', async (c) => {
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

app.put('/make-server-25b11ac0/camareros/:id', async (c) => {
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

app.post('/make-server-25b11ac0/coordinadores', async (c) => {
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

app.post('/make-server-25b11ac0/pedidos', async (c) => {
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
    await kv.set(id, data);
    return c.json({ success: true, data });
  } catch (error) {
    console.log('Error al actualizar pedido:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-25b11ac0/pedidos/:id', async (c) => {
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
    const { token, pedidoId, camareroId } = await c.req.json();
    
    await kv.set(`confirmacion:${token}`, {
      pedidoId,
      camareroId,
      createdAt: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error al guardar token:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

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
    
    const { pedidoId, camareroId } = confirmacionData;
    const pedido = await kv.get(pedidoId);
    
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
    
    const { pedidoId, camareroId } = confirmacionData;
    const pedido = await kv.get(pedidoId);
    
    if (pedido) {
      // Remover camarero de las asignaciones
      const asignaciones = pedido.asignaciones.filter(a => a.camareroId !== camareroId);
      await kv.set(pedidoId, { ...pedido, asignaciones });
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

Deno.serve(app.fetch);