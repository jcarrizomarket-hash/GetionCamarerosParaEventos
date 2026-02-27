/**
 * Procesador de tareas programadas (Background Job Processor)
 *
 * Alternativa a setTimeout de larga duración en memoria.
 * Las tareas se persisten en la tabla `scheduled_tasks` de Supabase
 * y son procesadas periódicamente por este módulo.
 *
 * TABLA REQUERIDA (ejecutar en Supabase SQL Editor):
 * ```sql
 * CREATE TABLE scheduled_tasks (
 *   id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
 *   type        TEXT NOT NULL,
 *   payload     JSONB NOT NULL DEFAULT '{}',
 *   run_after   TIMESTAMPTZ NOT NULL,
 *   status      TEXT NOT NULL DEFAULT 'pending',
 *   attempts    INT NOT NULL DEFAULT 0,
 *   max_attempts INT NOT NULL DEFAULT 3,
 *   created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 * ```
 */

import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { serverLogger } from './logger.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RETRY_DELAY_BASE_MS = 60_000;
  id: string;
  type: string;
  payload: Record<string, unknown>;
  run_after: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
}

/**
 * Encola una tarea para ejecución diferida.
 *
 * @param type     Identificador del tipo de tarea (ej: 'delete-rejected-pedido')
 * @param payload  Datos necesarios para ejecutar la tarea
 * @param delayMs  Milisegundos de espera antes de ejecutar (por defecto 0 = inmediato)
 */
export async function enqueueTask(
  type: string,
  payload: Record<string, unknown>,
  delayMs = 0
): Promise<void> {
  const runAfter = new Date(Date.now() + delayMs).toISOString();
  const { error } = await supabase.from('scheduled_tasks').insert({
    type,
    payload,
    run_after: runAfter,
    status: 'pending',
  });
  if (error) {
    serverLogger.error('Failed to enqueue task', { type, error: error.message });
    throw error;
  }
  serverLogger.info('Task enqueued', { type, runAfter });
}

/**
 * Procesa todas las tareas pendientes cuya fecha de ejecución ya llegó.
 * Llamar desde un endpoint tipo `/job-processor/run` invocado por un cron externo.
 */
export async function processPendingTasks(
  handlers: Record<string, (payload: Record<string, unknown>) => Promise<void>>
): Promise<{ processed: number; failed: number }> {
  const now = new Date().toISOString();

  const { data: tasks, error } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .lte('run_after', now)
    .eq('status', 'pending')
    .order('run_after', { ascending: true })
    .limit(50);

  if (error) {
    serverLogger.error('Failed to fetch pending tasks', { error: error.message });
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const task of (tasks ?? []) as ScheduledTask[]) {
    const handler = handlers[task.type];
    if (!handler) {
      serverLogger.warn('No handler for task type', { type: task.type, taskId: task.id });
      continue;
    }

    // Mark as processing
    await supabase
      .from('scheduled_tasks')
      .update({ status: 'processing', attempts: task.attempts + 1, updated_at: now })
      .eq('id', task.id);

    try {
      await handler(task.payload);
      await supabase
        .from('scheduled_tasks')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', task.id);
      processed++;
      serverLogger.info('Task completed', { type: task.type, taskId: task.id });
    } catch (err) {
      const nextStatus = task.attempts + 1 >= task.max_attempts ? 'failed' : 'pending';
      const retryAfter = nextStatus === 'pending'
        ? new Date(Date.now() + RETRY_DELAY_BASE_MS * (task.attempts + 1)).toISOString()
        : undefined;

      await supabase
        .from('scheduled_tasks')
        .update({
          status: nextStatus,
          ...(retryAfter ? { run_after: retryAfter } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      failed++;
      serverLogger.error('Task failed', {
        type: task.type,
        taskId: task.id,
        error: err instanceof Error ? err.message : String(err),
        nextStatus,
      });
    }
  }

  return { processed, failed };
}
