import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Obtener todos los registros del KV store por prefijo
async function getKVByPrefix(prefix: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('kv_store_25b11ac0')
    .select('key, value')
    .like('key', `${prefix}%`);
  if (error) throw error;
  return data?.map(d => d.value) ?? [];
}

// Migrar camareros
async function migrarCamareros(): Promise<{ migrados: number; errores: number }> {
  const kvCamareros = await getKVByPrefix('camarero:');
  let migrados = 0;
  let errores = 0;

  for (const cam of kvCamareros) {
    try {
      const { error } = await supabase
        .from('camareros')
        .upsert({
          // Generar un UUID determinista basado en el id del KV para idempotencia
          // O usar ON CONFLICT con el numero
          numero: cam.numero,
          codigo: cam.codigo,
          tipo_perfil: cam.tipoPerfil ?? 'CAM',
          nombre: cam.nombre,
          apellido: cam.apellido ?? '',
          telefono: cam.telefono,
          email: cam.email,
          estado: cam.estado ?? 'activo',
          especialidades: cam.especialidades ?? [],
          experiencia: cam.experiencia,
          comentarios: cam.comentarios,
          idiomas: cam.idiomas ?? [],
          otros_idiomas: cam.otrosIdiomas,
          certificaciones: cam.certificaciones ?? [],
          otras_certificaciones: cam.otrasCertificaciones,
          disponibilidad: cam.disponibilidad ?? [],
          apercibimientos: cam.apercibimientos ?? 0,
        }, {
          onConflict: 'numero',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error migrando camarero ${cam.id}:`, error);
        errores++;
      } else {
        migrados++;
      }
    } catch (e) {
      console.error(`Excepción migrando camarero ${cam.id}:`, e);
      errores++;
    }
  }

  return { migrados, errores };
}

// Migrar coordinadores
async function migrarCoordinadores(): Promise<{ migrados: number; errores: number }> {
  const kvCoordinadores = await getKVByPrefix('coordinador:');
  let migrados = 0;
  let errores = 0;

  for (const coord of kvCoordinadores) {
    try {
      const { error } = await supabase
        .from('coordinadores')
        .upsert({
          nombre: coord.nombre,
          telefono: coord.telefono,
          email: coord.email,
          activo: coord.activo ?? true,
        }, {
          onConflict: 'nombre',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error migrando coordinador ${coord.id}:`, error);
        errores++;
      } else {
        migrados++;
      }
    } catch (e) {
      console.error(`Excepción migrando coordinador ${coord.id}:`, e);
      errores++;
    }
  }

  return { migrados, errores };
}

// Migrar clientes
async function migrarClientes(): Promise<{ migrados: number; errores: number }> {
  const kvClientes = await getKVByPrefix('cliente:');
  let migrados = 0;
  let errores = 0;

  for (const cli of kvClientes) {
    try {
      const { error } = await supabase
        .from('clientes')
        .upsert({
          nombre: cli.nombre,
          telefono: cli.telefono,
          email: cli.email,
        }, {
          onConflict: 'nombre',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error migrando cliente ${cli.id}:`, error);
        errores++;
      } else {
        migrados++;
      }
    } catch (e) {
      console.error(`Excepción migrando cliente ${cli.id}:`, e);
      errores++;
    }
  }

  return { migrados, errores };
}

// Migrar pedidos
async function migrarPedidos(): Promise<{ migrados: number; errores: number }> {
  const kvPedidos = await getKVByPrefix('pedido:');
  let migrados = 0;
  let errores = 0;

  for (const ped of kvPedidos) {
    try {
      const { error } = await supabase
        .from('pedidos')
        .upsert({
          numero: ped.numero,
          cliente: ped.cliente,
          lugar: ped.lugar,
          ubicacion: ped.ubicacion,
          dia_evento: ped.diaEvento,
          cantidad_camareros: ped.cantidadCamareros ?? 1,
          hora_entrada: ped.horaEntrada,
          hora_salida: ped.horaSalida,
          total_horas: ped.totalHoras,
          cantidad_camareros2: ped.cantidadCamareros2,
          hora_entrada2: ped.horaEntrada2,
          hora_salida2: ped.horaSalida2,
          total_horas2: ped.totalHoras2,
          catering: ped.catering ?? 'no',
          tiempo_viaje: ped.tiempoViaje,
          camisa: ped.camisa ?? 'negra',
          notas: ped.notas,
          coordinador_nombre: ped.coordinadorNombre,
          asignaciones: ped.asignaciones ?? [],
        }, {
          onConflict: 'numero',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error migrando pedido ${ped.id}:`, error);
        errores++;
      } else {
        migrados++;
      }
    } catch (e) {
      console.error(`Excepción migrando pedido ${ped.id}:`, e);
      errores++;
    }
  }

  return { migrados, errores };
}

// Handler principal
Deno.serve(async (req) => {
  // Solo permitir POST con service role
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Verificar autorización (solo service role)
  const authHeader = req.headers.get('Authorization');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const results = {
      camareros: await migrarCamareros(),
      coordinadores: await migrarCoordinadores(),
      clientes: await migrarClientes(),
      pedidos: await migrarPedidos(),
    };

    const totalMigrados = Object.values(results).reduce((sum, r) => sum + r.migrados, 0);
    const totalErrores = Object.values(results).reduce((sum, r) => sum + r.errores, 0);

    return new Response(JSON.stringify({
      success: true,
      message: `Migración completada: ${totalMigrados} registros migrados, ${totalErrores} errores`,
      details: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
