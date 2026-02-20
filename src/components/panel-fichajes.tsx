import { useState, useEffect } from 'react';
import { Clock, Edit2, Save, X, QrCode, CheckCircle2, Minus, AlertCircle } from 'lucide-react';

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
  const [editando, setEditando] = useState<string | null>(null);
  const [formEntrada, setFormEntrada] = useState('');
  const [formSalida, setFormSalida] = useState('');
  const [formNota, setFormNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const asignaciones: any[] = pedido?.asignaciones || [];

  useEffect(() => {
    if (!pedido?.id) return;
    cargarFichajes();
    asignaciones.forEach((a: any) => cargarQrLink(a.camareroId));
  }, [pedido?.id]);

  const cargarFichajes = async () => {
    setLoading(true);
    setErrorMsg('');
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
    } catch { setErrorMsg('No se pudieron cargar los fichajes'); }
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
    setEditando(camareroId);
    // Pre-poblar con datos QR si existen, sino con horario previsto del pedido
    setFormEntrada(f?.entrada ? isoToLocal(f.entrada) : fechaConHora(pedido.diaEvento, pedido.horaEntrada));
    setFormSalida(f?.salida ? isoToLocal(f.salida) : fechaConHora(pedido.diaEvento, pedido.horaSalida));
    setFormNota(f?.nota || '');
  };

  const cancelarEdicion = () => { setEditando(null); setFormEntrada(''); setFormSalida(''); setFormNota(''); };

  const guardarFichaje = async (camareroId: string) => {
    setGuardando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${baseUrl}/fichajes/${pedido.id}/${camareroId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({
          entrada: formEntrada ? new Date(formEntrada).toISOString() : null,
          salida:  formSalida  ? new Date(formSalida).toISOString()  : null,
          nota: formNota,
        }),
      });
      const data = await res.json();
      if (data.success) { setFichajes(prev => ({ ...prev, [camareroId]: data.data })); cancelarEdicion(); }
      else setErrorMsg(data.error || 'Error al guardar');
    } catch { setErrorMsg('Error de conexión al guardar'); }
    setGuardando(false);
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
        <button onClick={cargarFichajes} className="text-xs text-gray-400 hover:text-indigo-500 transition-colors">
          ↻ Actualizar
        </button>
      </div>

      {errorMsg && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm animate-pulse">Cargando fichajes...</div>
      ) : (
        <>
          {/* Tabla */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {/* Cabecera */}
            <div className="grid gap-2 bg-gray-50 border-b border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 80px 80px 70px 56px' }}>
              <span>Camarero</span>
              <span className="text-center">Entrada</span>
              <span className="text-center">Salida</span>
              <span className="text-center">Horas</span>
              <span className="text-center">Accs.</span>
            </div>

            <div className="divide-y divide-gray-100">
              {asignaciones.map((asig: any) => {
                const f = fichajes[asig.camareroId];
                const isEditando = editando === asig.camareroId;
                const qrUrl = qrLinks[asig.camareroId];
                const tieneEntrada = !!f?.entrada;
                const tieneSalida = !!f?.salida;
                const horas = calcularHoras(f?.entrada ?? null, f?.salida ?? null);
                const esInvalido = horas?.includes('⚠');

                // Preview en tiempo real durante edición
                const previewHoras = isEditando && formEntrada && formSalida
                  ? calcularHoras(new Date(formEntrada).toISOString(), new Date(formSalida).toISOString())
                  : null;

                return (
                  <div key={asig.camareroId}>
                    {/* Fila visualización */}
                    {!isEditando && (
                      <div
                        className={`grid gap-2 items-center px-3 py-2.5 ${
                          tieneEntrada && tieneSalida ? 'bg-green-50/50' :
                          tieneEntrada ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50'
                        }`}
                        style={{ gridTemplateColumns: '1fr 80px 80px 70px 56px' }}
                      >
                        {/* Nombre + estado */}
                        <div className="flex items-center gap-2 min-w-0">
                          {tieneEntrada && tieneSalida
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            : tieneEntrada
                            ? <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 animate-pulse" />
                            : <Minus className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                          <span className="text-sm font-medium text-gray-800 truncate">{asig.camareroNombre}</span>
                          {f?.editadoManualmente && (
                            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full">✏</span>
                          )}
                        </div>

                        {/* Entrada */}
                        <div className="text-center">
                          <span className={`text-sm font-mono font-bold ${tieneEntrada ? 'text-green-700' : 'text-gray-200'}`}>
                            {formatHora(f?.entrada)}
                          </span>
                        </div>

                        {/* Salida */}
                        <div className="text-center">
                          <span className={`text-sm font-mono font-bold ${tieneSalida ? 'text-red-600' : 'text-gray-200'}`}>
                            {formatHora(f?.salida)}
                          </span>
                        </div>

                        {/* Horas calculadas */}
                        <div className="text-center">
                          {horas && !esInvalido && (
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {horas}
                            </span>
                          )}
                          {esInvalido && <span className="text-red-400 text-xs" title="Salida anterior a entrada">⚠</span>}
                          {!horas && <span className="text-gray-200 text-xs">—</span>}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center justify-center gap-0.5">
                          {qrUrl && (
                            <a href={qrUrl} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Ver página de fichaje QR">
                              <QrCode className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {!soloLectura && (
                            <button onClick={() => iniciarEdicion(asig.camareroId)}
                              className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar horario manualmente">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fila edición */}
                    {isEditando && (
                      <div className="px-3 py-3 bg-blue-50/70 border-l-3 border-blue-400">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-blue-800">{asig.camareroNombre}</span>
                          <span className="text-xs text-blue-400">— edición manual</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hora de entrada</label>
                            <input type="datetime-local" value={formEntrada}
                              onChange={e => setFormEntrada(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hora de salida</label>
                            <input type="datetime-local" value={formSalida}
                              onChange={e => setFormSalida(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                          </div>
                        </div>

                        {/* Preview horas en tiempo real */}
                        {previewHoras && (
                          <div className={`mb-2 text-xs px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
                            previewHoras.includes('⚠')
                              ? 'bg-red-100 text-red-600 border border-red-200'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {previewHoras.includes('⚠')
                              ? 'La hora de salida es anterior a la entrada'
                              : `Total: ${previewHoras}`}
                          </div>
                        )}

                        <input type="text" value={formNota} onChange={e => setFormNota(e.target.value)}
                          placeholder="Nota (ej: ajuste acordado con coordinador)"
                          maxLength={150}
                          className="w-full mb-2.5 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />

                        <div className="flex gap-2">
                          <button onClick={() => guardarFichaje(asig.camareroId)} disabled={guardando}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            <Save className="w-3.5 h-3.5" />
                            {guardando ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button onClick={cancelarEdicion}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs rounded-lg text-gray-600 hover:bg-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
