import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
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
  if (error) {
    console.error('clientes GET error:', JSON.stringify(error));
    return c.json({ success: false, error: error.message }, 500);
  }
  return c.json({ success: true, data: (data ?? []).map(mapClienteToFrontend) });
});

app.post('/make-server-25b11ac0/clientes', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateClienteSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('clientes').insert({
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
    }).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapClienteToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/clientes/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id').replace('cliente:', ''));
    const body = await c.req.json();
    const parsed = validate(UpdateClienteSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('clientes').update({
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
    }).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapClienteToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/clientes/:id', requireAuth, async (c) => {
  const id = parseInt(c.req.param('id').replace('cliente:', ''));
  const { error } = await db.from('clientes').delete().eq('id', id);
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// ============== CAMAREROS ==============
app.get('/make-server-25b11ac0/camareros', requireAuth, async (c) => {
  const { data, error } = await db.from('camareros').select('*').order('numero');
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: (data ?? []).map(mapCamareroToFrontend) });
});

app.post('/make-server-25b11ac0/camareros', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateCamareroSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { count } = await db.from('camareros').select('*', { count: 'exact', head: true });
    const numero = (count ?? 0) + 1;
    const d = parsed.data as any;
    const { data, error } = await db.from('camareros').insert({
      numero,
      codigo: d.codigo,
      tipo_perfil: d.tipoPerfil || 'CAM',
      nombre: d.nombre,
      apellido: d.apellido || '',
      telefono: d.telefono,
      email: d.email,
      estado: d.estado || 'activo',
      especialidades: d.especialidades || [],
      experiencia: d.experiencia,
      comentarios: d.comentarios,
      idiomas: d.idiomas || [],
      otros_idiomas: d.otrosIdiomas,
      certificaciones: d.certificaciones || [],
      otras_certificaciones: d.otrasCertificaciones,
      disponibilidad: d.disponibilidad || [],
    }).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapCamareroToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/camareros/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id').replace('camarero:', ''));
    const body = await c.req.json();
    const parsed = validate(UpdateCamareroSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const d = parsed.data as any;
    const update: any = {};
    if (d.codigo !== undefined) update.codigo = d.codigo;
    if (d.tipoPerfil !== undefined) update.tipo_perfil = d.tipoPerfil;
    if (d.nombre !== undefined) update.nombre = d.nombre;
    if (d.apellido !== undefined) update.apellido = d.apellido;
    if (d.telefono !== undefined) update.telefono = d.telefono;
    if (d.email !== undefined) update.email = d.email;
    if (d.estado !== undefined) update.estado = d.estado;
    if (d.activo !== undefined) update.estado = d.activo ? 'activo' : 'inactivo';
    if (d.especialidades !== undefined) update.especialidades = d.especialidades;
    if (d.experiencia !== undefined) update.experiencia = d.experiencia;
    if (d.comentarios !== undefined) update.comentarios = d.comentarios;
    if (d.idiomas !== undefined) update.idiomas = d.idiomas;
    if (d.otrosIdiomas !== undefined) update.otros_idiomas = d.otrosIdiomas;
    if (d.certificaciones !== undefined) update.certificaciones = d.certificaciones;
    if (d.otrasCertificaciones !== undefined) update.otras_certificaciones = d.otrasCertificaciones;
    if (d.disponibilidad !== undefined) update.disponibilidad = d.disponibilidad;
    const { data, error } = await db.from('camareros').update(update).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapCamareroToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/camareros/:id', requireAuth, async (c) => {
  const id = parseInt(c.req.param('id').replace('camarero:', ''));
  const { error } = await db.from('camareros').delete().eq('id', id);
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// ============== COORDINADORES ==============
app.get('/make-server-25b11ac0/coordinadores', requireAuth, async (c) => {
  const { data, error } = await db.from('coordinadores').select('*').order('nombre');
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: (data ?? []).map(mapCoordinadorToFrontend) });
});

app.post('/make-server-25b11ac0/coordinadores', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validate(CreateCoordinadorSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('coordinadores').insert({
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
      activo: parsed.data.activo !== false,
    }).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapCoordinadorToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/coordinadores/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id').replace('coordinador:', ''));
    const body = await c.req.json();
    const parsed = validate(UpdateCoordinadorSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('coordinadores').update({
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
      activo: parsed.data.activo,
    }).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapCoordinadorToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/coordinadores/:id', requireAuth, async (c) => {
  const id = parseInt(c.req.param('id').replace('coordinador:', ''));
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
    const { data, error } = await db.from('pedidos').insert(mapPedidoToDb(parsed.data)).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapPedidoToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.put('/make-server-25b11ac0/pedidos/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id').replace('pedido:', ''));
    const body = await c.req.json();
    const parsed = validate(UpdatePedidoSchema, body);
    if (!parsed.success) return validationError(c, parsed.error);
    const { data, error } = await db.from('pedidos').update(mapPedidoToDb(parsed.data)).eq('id', id).select().single();
    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data: mapPedidoToFrontend(data) });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/make-server-25b11ac0/pedidos/:id', requireAuth, async (c) => {
  const id = parseInt(c.req.param('id').replace('pedido:', ''));
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
function mapClienteToFrontend(r: any) {
  return {
    id: `cliente:${r.id}`,
    nombre: r.nombre,
    contacto1: r.contacto1,
    contacto2: r.contacto2,
    telefono1: r.telefono1,
    telefono2: r.telefono2,
    mail1: r.mail1,
    mail2: r.mail2,
    notas: r.notas,
    createdAt: r.created_at,
  };
}

function mapCamareroToFrontend(r: any) {
  return {
    id: `camarero:${r.id}`,
    numero: r.numero,
    codigo: r.codigo,
    tipoPerfil: r.tipo_perfil,
    nombre: r.nombre,
    apellido: r.apellido,
    telefono: r.telefono,
    email: r.email,
    estado: r.estado,
    activo: r.estado === 'activo',
    especialidades: r.especialidades ?? [],
    experiencia: r.experiencia,
    comentarios: r.comentarios,
    idiomas: r.idiomas ?? [],
    otrosIdiomas: r.otros_idiomas,
    certificaciones: r.certificaciones ?? [],
    otrasCertificaciones: r.otras_certificaciones,
    disponibilidad: r.disponibilidad ?? [],
    notas: r.comentarios,
    createdAt: r.created_at,
  };
}

function mapCoordinadorToFrontend(r: any) {
  return {
    id: `coordinador:${r.id}`,
    nombre: r.nombre,
    telefono: r.telefono,
    email: r.email,
    activo: r.activo,
    createdAt: r.created_at,
  };
}

function mapPedidoToDb(p: any) {
  return {
    numero: p.numero,
    cliente: p.cliente,
    lugar: p.lugar,
    ubicacion: p.ubicacion,
    dia_evento: p.diaEvento,
    cantidad_camareros: p.cantidadCamareros,
    hora_entrada: p.horaEntrada,
    hora_salida: p.horaSalida,
    total_horas: p.totalHoras,
    cantidad_camareros2: p.cantidadCamareros2,
    hora_entrada2: p.horaEntrada2,
    hora_salida2: p.horaSalida2,
    total_horas2: p.totalHoras2,
    catering: p.catering,
    tiempo_viaje: p.tiempoViaje,
    camisa: p.camisa,
    notas: p.notas,
    coordinador_nombre: p.coordinadorNombre,
    asignaciones: p.asignaciones ?? [],
  };
}

function mapPedidoToFrontend(r: any) {
  return {
    id: `pedido:${r.id}`,
    numero: r.numero,
    cliente: r.cliente,
    lugar: r.lugar,
    ubicacion: r.ubicacion,
    diaEvento: r.dia_evento,
    cantidadCamareros: r.cantidad_camareros,
    horaEntrada: r.hora_entrada,
    horaSalida: r.hora_salida,
    totalHoras: r.total_horas,
    cantidadCamareros2: r.cantidad_camareros2,
    horaEntrada2: r.hora_entrada2,
    horaSalida2: r.hora_salida2,
    totalHoras2: r.total_horas2,
    catering: r.catering,
    tiempoViaje: r.tiempo_viaje,
    camisa: r.camisa,
    notas: r.notas,
    coordinadorNombre: r.coordinador_nombre,
    asignaciones: r.asignaciones ?? [],
    createdAt: r.created_at,
  };
}

// Router raíz — maneja tanto /server/make-server-* como /make-server-*
const root = new Hono();
root.route('/server', app);
root.route('/', app);

Deno.serve(root.fetch);
