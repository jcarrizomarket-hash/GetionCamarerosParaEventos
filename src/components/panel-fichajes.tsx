import { useState, useEffect } from 'react';
import { Clock, Edit2, Save, X, QrCode, CheckCircle2, Minus, AlertCircle, ScanLine } from 'lucide-react';

interface Fichaje {
  pedidoId: string;
  camareroId: string;
  camareroNombre: string;
  entrada: string | null;
  salida: string | null;
  editadoManualmente?: boolean;
  nota?: string;
}

interface Props {
  pedido: any;
  camareros: any[];
  baseUrl: string;
  publicAnonKey: string;
  soloLectura?: boolean;
}

const isoToLocal = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fechaConHora = (diaEvento: string, hora: string): string => {
  if (!diaEvento) return '';
  const base = diaEvento.substring(0, 10);
  const [h, m] = (hora || '00:00').split(':');
  return `${base}T${(h || '00').padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
};

const formatHora = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const calcularHoras = (entrada: string | null, salida: string | null): string | null => {
  if (!entrada || !salida) return null;
  const diff = (new Date(salida).getTime() - new Date(entrada).getTime()) / (1000 * 60 * 60);
  if (diff < 0) return '⚠ Horario inválido';
  const h = Math.floor(diff);
  const m = Math.round((diff - h) * 60);
  return `${h}h${m > 0 ? ` ${m}min` : ''}`;
};

export function PanelFichajes({ pedido, camareros, baseUrl, publicAnonKey, soloLectura = false }: Props) {
  const [fichajes, setFichajes] = useState<Record<string, Fichaje>>({});
  const [qrLinks, setQrLinks] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState<Record<string, { entrada: string; salida: string; nota: string }>>({});
  const [guardando, setGuardando] = useState<Record<string, boolean>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState('');

  const asignaciones: any[] = pedido?.asignaciones || [];

  useEffect(() => {
    if (!pedido?.id) return;
    cargarFichajes();
    asignaciones.forEach((a: any) => cargarQrLink(a.camareroId));
  }, [pedido?.id]);

  const cargarFichajes = async () => {
    setLoading(true);
    setErrorGlobal('');
    try {
      const res = await fetch(`${baseUrl}/fichajes/${pedido.id}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        const map: Record<string, Fichaje> = {};
        (data.data || []).forEach((f: any) => { if (f?.camareroId) map[f.camareroId] = f; });
        setFichajes(map);
      }
    } catch { setErrorGlobal('No se pudieron cargar los fichajes'); }
    setLoading(false);
  };

  const cargarQrLink = async (camareroId: string) => {
    try {
      const res = await fetch(`${baseUrl}/qr-tokens/${pedido.id}/${camareroId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) setQrLinks(prev => ({ ...prev, [camareroId]: data.qrUrl }));
    } catch { /* QR no generado aún */ }
  };

  const iniciarEdicion = (camareroId: string) => {
    const f = fichajes[camareroId];
    // Pre-poblar SOLO con datos reales del QR — no con horarios orientativos del pedido
    setEditando(prev => ({
      ...prev,
      [camareroId]: {
        entrada: f?.entrada ? isoToLocal(f.entrada) : '',
        salida:  f?.salida  ? isoToLocal(f.salida)  : '',
        nota:    f?.nota    || '',
      }
    }));
    setErrores(prev => ({ ...prev, [camareroId]: '' }));
  };

  const cancelarEdicion = (camareroId: string) => {
    setEditando(prev => { const n = { ...prev }; delete n[camareroId]; return n; });
    setErrores(prev => ({ ...prev, [camareroId]: '' }));
  };

  const actualizarCampo = (camareroId: string, campo: 'entrada' | 'salida' | 'nota', valor: string) => {
    setEditando(prev => ({
      ...prev,
      [camareroId]: { ...prev[camareroId], [campo]: valor }
    }));
  };

  const guardarFichaje = async (camareroId: string) => {
    const form = editando[camareroId];
    if (!form) return;
    setGuardando(prev => ({ ...prev, [camareroId]: true }));
    setErrores(prev => ({ ...prev, [camareroId]: '' }));
    try {
      const res = await fetch(`${baseUrl}/fichajes/${pedido.id}/${camareroId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({
          entrada: form.entrada ? new Date(form.entrada).toISOString() : null,
          salida:  form.salida  ? new Date(form.salida).toISOString()  : null,
          nota:    form.nota,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFichajes(prev => ({ ...prev, [camareroId]: data.data }));
        cancelarEdicion(camareroId);
      } else {
        setErrores(prev => ({ ...prev, [camareroId]: data.error || 'Error al guardar' }));
      }
    } catch {
      setErrores(prev => ({ ...prev, [camareroId]: 'Error de conexión' }));
    }
    setGuardando(prev => ({ ...prev, [camareroId]: false }));
  };

  if (asignaciones.length === 0) {
    return <div className="text-center py-6 text-gray-400 text-sm">No hay camareros asignados a este evento</div>;
  }

  const totalCompletos = asignaciones.filter((a: any) => {
    const f = fichajes[a.camareroId];
    return f?.entrada && f?.salida;
  }).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-indigo-500" />
          Fichajes del evento
          {totalCompletos > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {totalCompletos}/{asignaciones.length} completados
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <ScanLine className="w-3 h-3" /> Horas registradas por QR · edición manual disponible
          </span>
          <button onClick={cargarFichajes} className="text-xs text-gray-400 hover:text-indigo-500 transition-colors">
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Horarios orientativos del pedido */}
      {(pedido?.horaEntrada || pedido?.horaSalida) && (
        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700">
            <span className="font-semibold">Horario orientativo:</span>
            {pedido.horaEntrada && ` Entrada ${pedido.horaEntrada}`}
            {pedido.horaEntrada && pedido.horaSalida && ' ·'}
            {pedido.horaSalida && ` Salida ${pedido.horaSalida}`}
            {' — Las horas definitivas se registran por escaneo QR'}
          </span>
        </div>
      )}

      {errorGlobal && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errorGlobal}
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm animate-pulse">Cargando fichajes...</div>
      ) : (
        <>
          {/* Filas por camarero — cada una completamente independiente */}
          <div className="space-y-2">
            {asignaciones.map((asig: any) => {
              const f = fichajes[asig.camareroId];
              const isEditando = !!editando[asig.camareroId];
              const form = editando[asig.camareroId];
              const qrUrl = qrLinks[asig.camareroId];
              const tieneEntrada = !!f?.entrada;
              const tieneSalida = !!f?.salida;
              const horas = calcularHoras(f?.entrada ?? null, f?.salida ?? null);
              const esInvalido = horas?.includes('⚠');
              const estaGuardando = !!guardando[asig.camareroId];
              const errorFila = errores[asig.camareroId];

              const previewHoras = isEditando && form?.entrada && form?.salida
                ? calcularHoras(new Date(form.entrada).toISOString(), new Date(form.salida).toISOString())
                : null;

              const bgFila = tieneEntrada && tieneSalida
                ? 'bg-green-50/60 border-green-200'
                : tieneEntrada
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-white border-gray-200';

              return (
                <div key={asig.camareroId} className={`rounded-xl border overflow-hidden transition-all ${isEditando ? 'border-blue-300' : bgFila}`}>

                  {/* Fila visualización */}
                  <div className="grid items-center px-3 py-2.5 gap-2"
                    style={{ gridTemplateColumns: '1fr 90px 90px 80px auto' }}>

                    <div className="flex items-center gap-2 min-w-0">
                      {tieneEntrada && tieneSalida
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : tieneEntrada
                        ? <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
                        : <Minus className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                      <span className="text-sm font-semibold text-gray-800 truncate">{asig.camareroNombre}</span>
                      {f?.editadoManualmente && (
                        <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">✏ manual</span>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-gray-400 mb-0.5">Entrada</div>
                      <span className={`text-sm font-mono font-bold ${tieneEntrada ? 'text-green-700' : 'text-gray-300'}`}>
                        {formatHora(f?.entrada)}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-gray-400 mb-0.5">Salida</div>
                      <span className={`text-sm font-mono font-bold ${tieneSalida ? 'text-red-600' : 'text-gray-300'}`}>
                        {formatHora(f?.salida)}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-gray-400 mb-0.5">Horas</div>
                      {horas && !esInvalido
                        ? <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{horas}</span>
                        : esInvalido
                        ? <span className="text-red-400 text-xs">⚠</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      {qrUrl && (
                        <a href={qrUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver página de fichaje QR">
                          <QrCode className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {!soloLectura && !isEditando && (
                        <button onClick={() => iniciarEdicion(asig.camareroId)}
                          className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar horario manualmente">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isEditando && (
                        <button onClick={() => cancelarEdicion(asig.camareroId)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Panel edición manual inline — solo para esta fila */}
                  {isEditando && form && (
                    <div className="px-3 pb-3 border-t border-blue-200 pt-3 bg-blue-50/50">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Entrada <span className="text-gray-400 font-normal">(manual)</span>
                          </label>
                          <input type="datetime-local" value={form.entrada}
                            onChange={e => actualizarCampo(asig.camareroId, 'entrada', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Salida <span className="text-gray-400 font-normal">(manual)</span>
                          </label>
                          <input type="datetime-local" value={form.salida}
                            onChange={e => actualizarCampo(asig.camareroId, 'salida', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </div>
                      </div>

                      {previewHoras && (
                        <div className={`mb-2 text-xs px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
                          previewHoras.includes('⚠') ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {previewHoras.includes('⚠') ? 'Salida anterior a la entrada' : `Total: ${previewHoras}`}
                        </div>
                      )}

                      <input type="text" value={form.nota}
                        onChange={e => actualizarCampo(asig.camareroId, 'nota', e.target.value)}
                        placeholder="Nota (ej: ajuste acordado con coordinador)"
                        maxLength={150}
                        className="w-full mb-2.5 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />

                      {errorFila && (
                        <div className="mb-2 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{errorFila}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => guardarFichaje(asig.camareroId)} disabled={estaGuardando}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                          <Save className="w-3.5 h-3.5" />
                          {estaGuardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button onClick={() => cancelarEdicion(asig.camareroId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs rounded-lg text-gray-600 hover:bg-white transition-colors">
                          <X className="w-3.5 h-3.5" />Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumen de horas — solo si hay al menos uno completo */}
          {totalCompletos > 0 && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <p className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Resumen de horas trabajadas
              </p>
              <div className="space-y-1.5">
                {asignaciones.map((asig: any) => {
                  const f = fichajes[asig.camareroId];
                  const h = calcularHoras(f?.entrada ?? null, f?.salida ?? null);
                  if (!h) return null;
                  return (
                    <div key={asig.camareroId} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{asig.camareroNombre}</span>
                        {f?.editadoManualmente && <span className="text-[10px] text-amber-500">✏ editado</span>}
                      </div>
                      <span className={`font-mono font-bold ${h.includes('⚠') ? 'text-red-500' : 'text-indigo-700'}`}>{h}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total acumulado si hay más de uno */}
              {totalCompletos > 1 && (() => {
                let totalMin = 0;
                asignaciones.forEach((asig: any) => {
                  const f = fichajes[asig.camareroId];
                  if (f?.entrada && f?.salida) {
                    const diff = (new Date(f.salida).getTime() - new Date(f.entrada).getTime()) / (1000 * 60);
                    if (diff > 0) totalMin += diff;
                  }
                });
                const th = Math.floor(totalMin / 60);
                const tm = Math.round(totalMin % 60);
                return (
                  <div className="mt-2 pt-2 border-t border-indigo-200 flex justify-between text-xs font-bold text-indigo-800">
                    <span>Total equipo</span>
                    <span className="font-mono">{th}h{tm > 0 ? ` ${tm}min` : ''}</span>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
