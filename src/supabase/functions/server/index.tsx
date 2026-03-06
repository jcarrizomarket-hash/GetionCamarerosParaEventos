import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { z } from 'npm:zod@3';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.tsx';
import { requireAuth, kvRateLimit } from './middleware';
import { validate, validationError } from './validate.ts';
import {
  CreateClienteSchema, UpdateClienteSchema,
  CreateCamareroSchema, UpdateCamareroSchema,
  CreateCoordinadorSchema, UpdateCoordinadorSchema,
  CreatePedidoSchema, UpdatePedidoSchema,
} from '../../schemas/index.ts';

const app = new Hono();

// Restrict CORS to the production frontend; allow localhost in development
const allowedOrigins = [
  'https://appservice.jcarrizo.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use('*', cors({
  origin: (origin) => allowedOrigins.includes(origin) ? origin : null,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

// Rate limiting global: 120 req/min por IP (KV-backed, persiste entre cold starts)
app.use('*', kvRateLimit(120, 60000));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============================================================
// AUTHENTICATION POLICY
// All endpoints require a valid Supabase JWT Bearer token via
// the requireAuth middleware, EXCEPT:
//   - GET /confirmar-asistencia  (public confirmation link)
//   - POST /whatsapp-webhook     (verified by WhatsApp HMAC)
// ============================================================

// ============== IDIOMAS ==============
app.get('/make-server-25b11ac0/idiomas', requireAuth, async (c) => {
  try {
    const { data, error } = await supabase
      .from('idiomas')
      .select('id, name, sort_order, is_active, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error al obtener idiomas:', error);
      return c.json({ success: false, error: 'Error interno del servidor' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener idiomas:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

// ============== CLIENTES ==============
app.get('/make-server-25b11ac0/clientes', requireAuth, async (c) => {
  try {
    const clientes = await kv.getByPrefix('cliente:');
    return c.json({ success: true, data: clientes });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.post('/make-server-25b11ac0/clientes', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateClienteSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    const id = `cliente:${Date.now()}`;
    const cliente = { id, ...parsed.data };
    await kv.set(id, cliente);
    return c.json({ success: true, data: cliente });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.put('/make-server-25b11ac0/clientes/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = validate(UpdateClienteSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    await kv.set(id, parsed.data);
    return c.json({ success: true, data: parsed.data });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.delete('/make-server-25b11ac0/clientes/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

// ============== CAMAREROS ==============
app.get('/make-server-25b11ac0/camareros', requireAuth, async (c) => {
  try {
    const camareros = await kv.getByPrefix('camarero:');
    return c.json({ success: true, data: camareros });
  } catch (error) {
    console.error('Error al obtener camareros:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.post('/make-server-25b11ac0/camareros', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateCamareroSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    const contadorData = await kv.get('contador:camareros');
    const contador = contadorData ? contadorData.valor + 1 : 1;
    await kv.set('contador:camareros', { valor: contador });

    const id = `camarero:${Date.now()}`;
    const camarero = { id, numero: contador, ...parsed.data };
    await kv.set(id, camarero);
    return c.json({ success: true, data: camarero });
  } catch (error) {
    console.error('Error al crear camarero:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.put('/make-server-25b11ac0/camareros/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = validate(UpdateCamareroSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    await kv.set(id, parsed.data);
    return c.json({ success: true, data: parsed.data });
  } catch (error) {
    console.error('Error al actualizar camarero:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.delete('/make-server-25b11ac0/camareros/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar camarero:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

// ============== COORDINADORES ==============
app.get('/make-server-25b11ac0/coordinadores', requireAuth, async (c) => {
  try {
    const coordinadores = await kv.getByPrefix('coordinador:');
    return c.json({ success: true, data: coordinadores });
  } catch (error) {
    console.error('Error al obtener coordinadores:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.post('/make-server-25b11ac0/coordinadores', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateCoordinadorSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    const contadorData = await kv.get('contador:coordinadores');
    const contador = contadorData ? contadorData.valor + 1 : 1;
    await kv.set('contador:coordinadores', { valor: contador });

    const id = `coordinador:${Date.now()}`;
    const coordinador = { id, numero: contador, ...parsed.data };
    await kv.set(id, coordinador);
    return c.json({ success: true, data: coordinador });
  } catch (error) {
    console.error('Error al crear coordinador:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.put('/make-server-25b11ac0/coordinadores/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = validate(UpdateCoordinadorSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    await kv.set(id, parsed.data);
    return c.json({ success: true, data: parsed.data });
  } catch (error) {
    console.error('Error al actualizar coordinador:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.delete('/make-server-25b11ac0/coordinadores/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar coordinador:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

// ============== PEDIDOS/EVENTOS ==============
app.get('/make-server-25b11ac0/pedidos', requireAuth, async (c) => {
  try {
    const pedidos = await kv.getByPrefix('pedido:');
    return c.json({ success: true, data: pedidos });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.post('/make-server-25b11ac0/pedidos', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreatePedidoSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    const id = `pedido:${Date.now()}`;
    const pedido = { id, ...parsed.data, createdAt: new Date().toISOString() };
    await kv.set(id, pedido);
    return c.json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.put('/make-server-25b11ac0/pedidos/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = validate(UpdatePedidoSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    console.log('📝 Actualizando pedido:', id);
    console.log('   Estado asignaciones:', parsed.data.asignaciones?.map(a => ({ num: a.camareroNumero, estado: a.estado })));

    await kv.set(id, parsed.data);
    return c.json({ success: true, data: parsed.data });
  } catch (error) {
    console.error('❌ Error al actualizar pedido:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.delete('/make-server-25b11ac0/pedidos/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`🗑️ Intentando eliminar pedido con ID: ${id}`);
    await kv.del(id);
    console.log(`✅ Pedido ${id} eliminado correctamente`);
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error al eliminar pedido:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

// ============== INFORMES ==============
app.get('/make-server-25b11ac0/informes/cliente', requireAuth, async (c) => {
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
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.get('/make-server-25b11ac0/informes/camarero', requireAuth, async (c) => {
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
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

// ============== CONFIRMACIONES ==============
app.post('/make-server-25b11ac0/guardar-token', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const TokenSchema = z.object({
      token: z.string().min(1).max(256),
      pedidoId: z.string().min(1),
      camareroId: z.string().min(1),
      coordinadorId: z.string().min(1),
    });
    const parsed = validate(TokenSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);

    await kv.set(`confirmacion:${parsed.data.token}`, {
      pedidoId: parsed.data.pedidoId,
      camareroId: parsed.data.camareroId,
      coordinadorId: parsed.data.coordinadorId,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Error al guardar token:', error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
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
      console.log(
        `⚠️ WhatsApp no disponible para notificar coordinador. ` +
        `WHATSAPP_API_KEY: ${whatsappApiKey ? 'configurada' : '❌ NO CONFIGURADA'}, ` +
        `WHATSAPP_PHONE_ID: ${whatsappPhoneId ? 'configurado' : '❌ NO CONFIGURADO'}. ` +
        `Mensaje que se enviaría: ${mensaje}`
      );
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
    console.error('Error al notificar coordinador:', error);
  }
}