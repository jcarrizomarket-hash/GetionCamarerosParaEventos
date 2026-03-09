import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { z } from 'npm:zod@3';
import { createClient } from 'npm:@supabase/supabase-js@2.98.0';
import { requireAuth } from './middleware.ts';
import { validate, validationError } from './validate.ts';
import {
  CreateClienteSchema, UpdateClienteSchema,
  CreateCamareroSchema, UpdateCamareroSchema,
  CreateCoordinadorSchema, UpdateCoordinadorSchema,
  CreatePedidoSchema, UpdatePedidoSchema,
} from '../schemas/index.ts';

const app = new Hono();

const allowedOrigins = [
  'https://www.eukosgestion.com',
  'https://eukosgestion.com',
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

const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============== CLIENTES ==============
app.get('/make-server-25b11ac0/clientes', requireAuth, async (c) => {
  const { data, error } = await db.from('clientes').select('*').order('nombre');
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

app.post('/make-server-25b11ac0/clientes', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateClienteSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const id = `cliente:${Date.now()}`;
    const { data, error } = await db.from('clientes').insert({ id, ...parsed.data }).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/clientes/:id', requireAuth, async (c) => {
  try {
    const id = decodeURIComponent(c.req.param('id'));
    const body = await c.req.json();
    const parsed = validate(UpdateClienteSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('clientes').update(parsed.data).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/clientes/:id', requireAuth, async (c) => {
  const id = decodeURIComponent(c.req.param('id'));
  const { error } = await db.from('clientes').delete().eq('id', id);
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// ============== CAMAREROS ==============
app.get('/make-server-25b11ac0/camareros', requireAuth, async (c) => {
  const { data, error } = await db.from('camareros').select('*').order('numero');
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

app.post('/make-server-25b11ac0/camareros', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateCamareroSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { count } = await db.from('camareros').select('*', { count: 'exact', head: true });
    const numero = (count ?? 0) + 1;
    const id = `camarero:${Date.now()}`;
    const { data, error } = await db.from('camareros').insert({ id, numero, ...parsed.data }).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/camareros/:id', requireAuth, async (c) => {
  try {
    const id = decodeURIComponent(c.req.param('id'));
    const body = await c.req.json();
    const parsed = validate(UpdateCamareroSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('camareros').update(parsed.data).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/camareros/:id', requireAuth, async (c) => {
  const id = decodeURIComponent(c.req.param('id'));
  const { error } = await db.from('camareros').delete().eq('id', id);
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// ============== COORDINADORES ==============
app.get('/make-server-25b11ac0/coordinadores', requireAuth, async (c) => {
  const { data, error } = await db.from('coordinadores').select('*').order('numero');
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

app.post('/make-server-25b11ac0/coordinadores', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateCoordinadorSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { count } = await db.from('coordinadores').select('*', { count: 'exact', head: true });
    const numero = (count ?? 0) + 1;
    const id = `coordinador:${Date.now()}`;
    const { data, error } = await db.from('coordinadores').insert({ id, numero, ...parsed.data }).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/coordinadores/:id', requireAuth, async (c) => {
  try {
    const id = decodeURIComponent(c.req.param('id'));
    const body = await c.req.json();
    const parsed = validate(UpdateCoordinadorSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('coordinadores').update(parsed.data).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/coordinadores/:id', requireAuth, async (c) => {
  const id = decodeURIComponent(c.req.param('id'));
  const { error } = await db.from('coordinadores').delete().eq('id', id);
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// ============== PEDIDOS ==============
app.get('/make-server-25b11ac0/pedidos', requireAuth, async (c) => {
  const { data, error } = await db.from('pedidos').select('*').order('dia_evento', { ascending: false });
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: (data ?? []).map(mapPedidoToFrontend) });
});

app.post('/make-server-25b11ac0/pedidos', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreatePedidoSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const id = `pedido:${Date.now()}`;
    const row = mapPedidoToDb({ id, ...parsed.data });
    const { data, error } = await db.from('pedidos').insert(row).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapPedidoToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/pedidos/:id', requireAuth, async (c) => {
  try {
    const id = decodeURIComponent(c.req.param('id'));
    const body = await c.req.json();
    const parsed = validate(UpdatePedidoSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const row = mapPedidoToDb(parsed.data);
    const { data, error } = await db.from('pedidos').update(row).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapPedidoToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/pedidos/:id', requireAuth, async (c) => {
  const id = decodeURIComponent(c.req.param('id'));
  const { error } = await db.from('pedidos').delete().eq('id', id);
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// ============== INFORMES ==============
app.get('/make-server-25b11ac0/informes/cliente', requireAuth, async (c) => {
  try {
    const { cliente, desde, hasta } = c.req.query();
    let query = db.from('pedidos').select('*');
    if (cliente) query = query.eq('cliente', cliente);
    if (desde) query = query.gte('dia_evento', desde);
    if (hasta) query = query.lte('dia_evento', hasta);
    const { data, error } = await query.order('dia_evento');
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: (data ?? []).map(mapPedidoToFrontend) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.get('/make-server-25b11ac0/informes/camarero', requireAuth, async (c) => {
  try {
    const { camareroId, desde, hasta } = c.req.query();
    let query = db.from('pedidos').select('*');
    if (desde) query = query.gte('dia_evento', desde);
    if (hasta) query = query.lte('dia_evento', hasta);
    const { data, error } = await query.order('dia_evento');
    if (error) return c.json({ success: false, error: error.message }, 500);
    const eventos = [];
    for (const pedido of data ?? []) {
      const p = mapPedidoToFrontend(pedido);
      if (Array.isArray(p.asignaciones)) {
        const asignacion = p.asignaciones.find((a: any) => a.camareroId === camareroId);
        if (asignacion) {
          eventos.push({
            diaEvento: p.diaEvento,
            cliente: p.cliente,
            lugar: p.lugar,
            horaEntrada: p.horaEntrada,
            horaSalida: p.horaSalida,
            totalHoras: p.totalHoras,
            estado: asignacion.estado,
          });
        }
      }
    }
    return c.json({ success: true, data: eventos });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ============== USUARIOS (Admin) ==============
app.get('/make-server-25b11ac0/usuarios', requireAuth, async (c) => {
  try {
    const { data, error } = await db.auth.admin.listUsers();
    if (error) throw error;
    const usuarios = data.users.map(u => ({
      id: u.id,
      email: u.email,
      nombre: u.user_metadata?.nombre || '',
      role: u.user_metadata?.role || 'coordinador',
      camareroId: u.user_metadata?.camareroId || '',
      clienteNombre: u.user_metadata?.clienteNombre || '',
      createdAt: u.created_at,
    }));
    return c.json({ success: true, data: usuarios });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/usuarios/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { error } = await db.auth.admin.deleteUser(id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.put('/make-server-25b11ac0/usuarios/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { error } = await db.auth.admin.updateUserById(id, {
      user_metadata: body.user_metadata,
    });
    if (error) throw error;
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============== HELPERS ==============
function mapPedidoToDb(p: any) {
  return {
    id: p.id,
    cliente: p.cliente,
    lugar: p.lugar,
    dia_evento: p.diaEvento,
    hora_entrada: p.horaEntrada,
    hora_salida: p.horaSalida,
    hora_entrada2: p.horaEntrada2,
    hora_salida2: p.horaSalida2,
    cantidad_camareros: p.cantidadCamareros,
    cantidad_camareros2: p.cantidadCamareros2,
    total_horas: p.totalHoras,
    catering: p.catering,
    camisa: p.camisa,
    notas: p.notas,
    coordinador_id: p.coordinadorId,
    coordinador_nombre: p.coordinadorNombre,
    asignaciones: p.asignaciones ?? [],
  };
}

function mapPedidoToFrontend(p: any) {
  return {
    id: p.id,
    cliente: p.cliente,
    lugar: p.lugar,
    diaEvento: p.dia_evento,
    horaEntrada: p.hora_entrada,
    horaSalida: p.hora_salida,
    horaEntrada2: p.hora_entrada2,
    horaSalida2: p.hora_salida2,
    cantidadCamareros: p.cantidad_camareros,
    cantidadCamareros2: p.cantidad_camareros2,
    totalHoras: p.total_horas,
    catering: p.catering,
    camisa: p.camisa,
    notas: p.notas,
    coordinadorId: p.coordinador_id,
    coordinadorNombre: p.coordinador_nombre,
    asignaciones: p.asignaciones ?? [],
    createdAt: p.created_at,
  };
}

// Router raíz — maneja tanto /server/make-server-* como /make-server-*
const root = new Hono();
root.route('/server', app);
root.route('/', app);

Deno.serve(root.fetch);
