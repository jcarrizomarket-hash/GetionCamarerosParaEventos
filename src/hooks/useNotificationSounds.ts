/**
 * useNotificationSounds
 * Genera sonidos de notificación usando Web Audio API (sin archivos externos).
 * La configuración se persiste en localStorage.
 */

export type NotificacionId =
  | 'pedido_nuevo'
  | 'perfil_acepta'
  | 'evento_completo'
  | 'perfil_rechaza'
  | 'alerta_24h';

export interface NotificacionConfig {
  id: NotificacionId;
  label: string;
  descripcion: string;
  emoji: string;
  habilitada: boolean;
  volumen: number; // 0-100
}

const STORAGE_KEY = 'eukosgestion_notif_config';

export const NOTIFICACIONES_DEFAULT: NotificacionConfig[] = [
  {
    id: 'pedido_nuevo',
    label: 'Pedido nuevo',
    descripcion: 'Suena cuando entra un pedido nuevo al sistema',
    emoji: '🛒',
    habilitada: true,
    volumen: 80,
  },
  {
    id: 'perfil_acepta',
    label: 'Perfil acepta servicio',
    descripcion: 'Suena cuando un perfil confirma su asistencia a un evento',
    emoji: '✅',
    habilitada: true,
    volumen: 80,
  },
  {
    id: 'evento_completo',
    label: 'Evento completo',
    descripcion: 'Suena cuando todos los perfiles de un evento están confirmados',
    emoji: '🎉',
    habilitada: true,
    volumen: 80,
  },
  {
    id: 'perfil_rechaza',
    label: 'Perfil rechaza servicio',
    descripcion: 'Suena cuando un perfil rechaza su asignación a un evento',
    emoji: '❌',
    habilitada: true,
    volumen: 80,
  },
  {
    id: 'alerta_24h',
    label: 'Alerta 24h antes del evento',
    descripcion: 'Suena cuando faltan 24h para un evento y quedan perfiles sin confirmar',
    emoji: '⚠️',
    habilitada: true,
    volumen: 80,
  },
];

/** Carga config desde localStorage, completando con defaults si faltan campos */
export function loadNotifConfig(): NotificacionConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return NOTIFICACIONES_DEFAULT;
    const saved: NotificacionConfig[] = JSON.parse(raw);
    // Merge: si el default tiene ids nuevos que no estaban guardados, los añade
    return NOTIFICACIONES_DEFAULT.map(def => {
      const found = saved.find(s => s.id === def.id);
      return found ? { ...def, ...found } : def;
    });
  } catch {
    return NOTIFICACIONES_DEFAULT;
  }
}

/** Guarda config en localStorage */
export function saveNotifConfig(config: NotificacionConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Silencioso — localStorage puede estar bloqueado
  }
}

/** Sintetiza un sonido distinto para cada tipo de notificación usando Web Audio API */
export function playNotificationSound(id: NotificacionId, volumen: number = 80): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const vol = Math.max(0, Math.min(1, volumen / 100));

    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol, ctx.currentTime);

    switch (id) {
      case 'pedido_nuevo': {
        // Ascendente alegre: do-mi-sol
        playTone(ctx, gain, 523, 0,    0.12);
        playTone(ctx, gain, 659, 0.13, 0.12);
        playTone(ctx, gain, 784, 0.26, 0.18);
        break;
      }
      case 'perfil_acepta': {
        // Dos notas positivas cortas
        playTone(ctx, gain, 660, 0,    0.10, 'sine');
        playTone(ctx, gain, 880, 0.12, 0.15, 'sine');
        break;
      }
      case 'evento_completo': {
        // Fanfarria: cuatro notas ascendentes
        playTone(ctx, gain, 523, 0,    0.10);
        playTone(ctx, gain, 659, 0.11, 0.10);
        playTone(ctx, gain, 784, 0.22, 0.10);
        playTone(ctx, gain, 1047,0.33, 0.22);
        break;
      }
      case 'perfil_rechaza': {
        // Descendente suave: dos notas graves
        playTone(ctx, gain, 440, 0,    0.12, 'triangle');
        playTone(ctx, gain, 330, 0.14, 0.18, 'triangle');
        break;
      }
      case 'alerta_24h': {
        // Pulso de alerta: tres notas repetitivas
        playTone(ctx, gain, 600, 0,    0.08, 'square');
        playTone(ctx, gain, 600, 0.12, 0.08, 'square');
        playTone(ctx, gain, 600, 0.24, 0.12, 'square');
        break;
      }
    }

    // Cierra el contexto tras reproducir
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Sin Audio API — silencioso
  }
}

function playTone(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine'
): void {
  const osc = ctx.createOscillator();
  const envGain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
  envGain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
  envGain.gain.linearRampToValueAtTime(1, ctx.currentTime + startOffset + 0.01);
  envGain.gain.linearRampToValueAtTime(0, ctx.currentTime + startOffset + duration);
  osc.connect(envGain);
  envGain.connect(destination);
  osc.start(ctx.currentTime + startOffset);
  osc.stop(ctx.currentTime + startOffset + duration + 0.01);
}
