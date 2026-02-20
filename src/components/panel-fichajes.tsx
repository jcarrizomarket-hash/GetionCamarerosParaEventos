import { useState, useEffect } from 'react';
import { Clock, Edit2, Save, X, QrCode, ExternalLink, CheckCircle2, AlertCircle, Minus } from 'lucide-react';

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

export function PanelFichajes({ pedido, camareros, baseUrl, publicAnonKey, soloLectura = false }: Props) {
  const [fichajes, setFichajes] = useState<Record<string, Fichaje>>({});
  const [qrLinks, setQrLinks] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [formEntrada, setFormEntrada] = useState('');
  const [formSalida, setFormSalida] = useState('');
  const [formNota, setFormNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);

  const asignaciones = pedido?.asignaciones || [];

  useEffect(() => {
    if (!pedido?.id) return;
    cargarFichajes();
    // Cargar QR links para cada camarero asignado
    asignaciones.forEach((a: any) => cargarQrLink(a.camareroId));
  }, [pedido?.id]);

  const cargarFichajes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/fichajes/${pedido.id}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      const data = await res.json();
      if (data.success) {
        const map: Record<string, Fichaje> = {};
        data.data.forEach((f: Fichaje) => { map[f.camareroId] = f; });
        setFichajes(map);
      }
    } catch (e) {
      console.error('Error cargando fichajes:', e);
    }
    setLoading(false);
  };

  const cargarQrLink = async (camareroId: string) => {
    try {
      const res = await fetch(`${baseUrl}/qr-tokens/${pedido.id}/${camareroId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      const data = await res.json();
      if (data.success) {
        setQrLinks(prev => ({ ...prev, [camareroId]: data.qrUrl }));
      }
    } catch (e) { /* silencioso — QR no generado aún */ }
  };

  const iniciarEdicion = (camareroId: string) => {
    const f = fichajes[camareroId];
    setEditando(camareroId);
    // Formatear para input datetime-local
    setFormEntrada(f?.entrada ? isoToLocal(f.entrada) : '');
    setFormSalida(f?.salida ? isoToLocal(f.salida) : '');
    setFormNota(f?.nota || '');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setFormEntrada('');
    setFormSalida('');
    setFormNota('');
  };

  const guardarFichaje = async (camareroId: string) => {
    setGuardando(true);
    try {
      const body: any = { nota: formNota };
      if (formEntrada) body.entrada = new Date(formEntrada).toISOString();
      else body.entrada = null;
      if (formSalida) body.salida = new Date(formSalida).toISOString();
      else body.salida = null;

      const res = await fetch(`${baseUrl}/fichajes/${pedido.id}/${camareroId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setFichajes(prev => ({ ...prev, [camareroId]: data.data }));
        cancelarEdicion();
      }
    } catch (e) {
      console.error('Error guardando fichaje:', e);
    }
    setGuardando(false);
  };

  // datetime-local value format: "2024-03-15T18:00"
  const isoToLocal = (iso: string): string => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatHora = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const calcularHoras = (entrada: string | null, salida: string | null): string => {
    if (!entrada || !salida) return '—';
    const diff = (new Date(salida).getTime() - new Date(entrada).getTime()) / (1000 * 60 * 60);
    const h = Math.floor(diff);
    const m = Math.round((diff - h) * 60);
    return `${h}h ${m}min`;
  };

  const getEstadoFichaje = (f?: Fichaje) => {
    if (!f) return 'pendiente';
    if (f.entrada && f.salida) return 'completo';
    if (f.entrada) return 'en-curso';
    return 'pendiente';
  };

  if (asignaciones.filter((a: any) => a.estado === 'confirmado').length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        No hay camareros confirmados aún
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Fichajes del evento
        </h3>
        <button onClick={cargarFichajes} className="text-xs text-gray-400 hover:text-gray-600 underline">
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {asignaciones
            .filter((a: any) => a.estado === 'confirmado')
            .map((asig: any) => {
              const f = fichajes[asig.camareroId];
              const estado = getEstadoFichaje(f);
              const isEditando = editando === asig.camareroId;
              const qrUrl = qrLinks[asig.camareroId];

              return (
                <div key={asig.camareroId}
                  className={`rounded-xl border p-3 transition-all ${
                    estado === 'completo' ? 'bg-green-50 border-green-200' :
                    estado === 'en-curso' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                  {/* Fila principal */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Estado badge */}
                      {estado === 'completo' && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {estado === 'en-curso' && <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 animate-pulse" />}
                      {estado === 'pendiente' && <Minus className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      <span className="font-medium text-gray-900 text-sm truncate">{asig.camareroNombre}</span>
                      {f?.editadoManualmente && (
                        <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full flex-shrink-0">✏️ editado</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Link QR */}
                      {qrUrl && (
                        <a href={qrUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Abrir página de fichaje (link para compartir)">
                          <QrCode className="w-4 h-4" />
                        </a>
                      )}
                      {/* Editar — solo si no es solo lectura */}
                      {!soloLectura && !isEditando && (
                        <button onClick={() => iniciarEdicion(asig.camareroId)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar horario manualmente">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Horarios (modo visualización) */}
                  {!isEditando && (
                    <div className="flex items-center gap-4 mt-2 ml-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Entrada:</span>
                        <span className={`text-sm font-mono font-semibold ${f?.entrada ? 'text-green-700' : 'text-gray-300'}`}>
                          {formatHora(f?.entrada)}
                        </span>
                      </div>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Salida:</span>
                        <span className={`text-sm font-mono font-semibold ${f?.salida ? 'text-red-600' : 'text-gray-300'}`}>
                          {formatHora(f?.salida)}
                        </span>
                      </div>
                      {f?.entrada && f?.salida && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {calcularHoras(f.entrada, f.salida)}
                          </span>
                        </>
                      )}
                      {f?.nota && (
                        <span className="text-xs text-amber-600 italic truncate max-w-[120px]" title={f.nota}>
                          📝 {f.nota}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Modo edición */}
                  {isEditando && (
                    <div className="mt-3 ml-6 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Entrada</label>
                          <input type="datetime-local" value={formEntrada} onChange={e => setFormEntrada(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Salida</label>
                          <input type="datetime-local" value={formSalida} onChange={e => setFormSalida(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </div>
                      </div>
                      <input type="text" value={formNota} onChange={e => setFormNota(e.target.value)}
                        placeholder="Nota (opcional)" maxLength={100}
                        className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <div className="flex gap-2">
                        <button onClick={() => guardarFichaje(asig.camareroId)} disabled={guardando}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50">
                          <Save className="w-3.5 h-3.5" />
                          {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button onClick={cancelarEdicion}
                          className="flex items-center gap-1 px-3 py-1.5 border text-xs rounded-lg text-gray-600 hover:bg-gray-50">
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
      )}

      {/* Resumen de horas */}
      {Object.values(fichajes).some(f => f.entrada && f.salida) && (
        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-xs font-semibold text-indigo-700 mb-2">Resumen de horas trabajadas</p>
          <div className="space-y-1">
            {Object.values(fichajes)
              .filter(f => f.entrada && f.salida)
              .map(f => (
                <div key={f.camareroId} className="flex justify-between text-xs">
                  <span className="text-gray-600">{f.camareroNombre}</span>
                  <span className="font-mono font-semibold text-indigo-700">{calcularHoras(f.entrada!, f.salida!)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
