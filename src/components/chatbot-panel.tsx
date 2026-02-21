import { useState, useEffect } from 'react';
import {
  MessageSquare, ClipboardList, Star, CheckCircle2, Clock,
  Phone, Calendar, MapPin, Users, ChevronDown, ChevronUp,
  RefreshCw, X, ExternalLink, Shirt, Building2, FileText, Send
} from 'lucide-react';

interface Props {
  baseUrl: string;
  publicAnonKey: string;
}

type Tab = 'solicitudes' | 'comentarios';

export function ChatbotPanel({ baseUrl, publicAnonKey }: Props) {
  const [tab, setTab] = useState<Tab>('solicitudes');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [gestionando, setGestionando] = useState<string | null>(null);
  const [notaGestion, setNotaGestion] = useState('');
  const [guardando, setGuardando] = useState(false);
  // Filtro comentarios
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todos' | 'pasado' | 'futuro'>('todos');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resSol, resCom] = await Promise.all([
        fetch(`${baseUrl}/chatbot-solicitudes`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
        fetch(`${baseUrl}/chatbot-comentarios`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
      ]);
      const [dataSol, dataCom] = await Promise.all([resSol.json(), resCom.json()]);
      if (dataSol.success) setSolicitudes(dataSol.data || []);
      if (dataCom.success) setComentarios(dataCom.data || []);
    } catch (e) { console.error('Error cargando datos chatbot:', e); }
    setLoading(false);
  };

  const marcarGestionada = async (id: string) => {
    setGuardando(true);
    try {
      const res = await fetch(`${baseUrl}/chatbot-solicitudes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ estado: 'gestionada', nota: notaGestion }),
      });
      const data = await res.json();
      if (data.success) {
        setSolicitudes(prev => prev.map(s => s.id === id ? data.data : s));
        setGestionando(null);
        setNotaGestion('');
        setExpandido(null);
      }
    } catch (e) { console.error(e); }
    setGuardando(false);
  };

  const marcarLeido = async (id: string) => {
    try {
      const res = await fetch(`${baseUrl}/chatbot-comentarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) setComentarios(prev => prev.map(c => c.id === id ? data.data : c));
    } catch (e) { console.error(e); }
  };

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const noLeidos   = comentarios.filter(c => !c.leido).length;

  const comentariosFiltrados = comentarios.filter(c =>
    filtroPeriodo === 'todos' ? true : (c.tipoPeriodo || 'pasado') === filtroPeriodo
  );

  const formatFecha = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const formatDia = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Chatbot WhatsApp</h1>
              <p className="text-xs text-gray-500">Solicitudes y comentarios recibidos de clientes</p>
            </div>
          </div>
          <button
            onClick={cargarDatos}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('solicitudes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'solicitudes' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Solicitudes de pedido
            {pendientes > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'solicitudes' ? 'bg-white/25 text-white' : 'bg-red-100 text-red-600'
              }`}>{pendientes}</span>
            )}
          </button>
          <button
            onClick={() => setTab('comentarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'comentarios' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star className="w-4 h-4" />
            Comentarios
            {noLeidos > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'comentarios' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'
              }`}>{noLeidos}</span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm animate-pulse">Cargando...</div>
        ) : tab === 'solicitudes' ? (

          /* ═══════════════════════════════════════
             SOLICITUDES DE PEDIDO
          ═══════════════════════════════════════ */
          <div className="space-y-3 max-w-2xl mx-auto">
            {solicitudes.length === 0 ? (
              <div className="text-center py-20">
                <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No hay solicitudes aún</p>
                <p className="text-gray-300 text-xs mt-1">Las solicitudes del chatbot aparecerán aquí</p>
              </div>
            ) : solicitudes.map(sol => {
              const esExpandido = expandido === sol.id;
              const esGestionando = gestionando === sol.id;
              const esPendiente = sol.estado === 'pendiente';

              return (
                <div key={sol.id}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    esPendiente
                      ? 'border-blue-200 bg-white shadow-sm shadow-blue-100'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Cabecera — siempre visible */}
                  <div
                    className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandido(esExpandido ? null : sol.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        esPendiente ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {esPendiente
                          ? <Clock className="w-4 h-4 text-blue-500" />
                          : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">
                            {sol.cliente || 'Cliente sin nombre'}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            esPendiente ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {esPendiente ? 'Pendiente' : 'Gestionada'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          📅 {sol.diaEvento} &nbsp;·&nbsp; 📱 +{sol.telefonoCliente}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatFecha(sol.creadoEn)}</p>
                      </div>
                    </div>
                    {esExpandido
                      ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
                  </div>

                  {/* Detalle expandido */}
                  {esExpandido && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                      {/* Grid de campos del pedido */}
                      <div className="grid grid-cols-2 gap-2">
                        <DataField icon={<Building2 className="w-3.5 h-3.5 text-gray-400" />} label="Cliente" value={sol.cliente} />
                        <DataField icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />} label="Lugar del evento" value={sol.lugarEvento} />
                        <DataField icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />} label="Día del evento" value={sol.diaEvento} />
                        <DataField icon={<Clock className="w-3.5 h-3.5 text-gray-400" />} label="Hora entrada 1" value={sol.horaEntrada1} />
                        {sol.horaEntrada2 && (
                          <DataField icon={<Clock className="w-3.5 h-3.5 text-gray-400" />} label="Hora entrada 2" value={sol.horaEntrada2} />
                        )}
                        <DataField icon={<Shirt className="w-3.5 h-3.5 text-gray-400" />} label="Color camisa" value={sol.camisa ? (sol.camisa.charAt(0).toUpperCase() + sol.camisa.slice(1)) : '—'} />
                        <DataField
                          icon={<Building2 className="w-3.5 h-3.5 text-gray-400" />}
                          label="En Barcelona ciudad"
                          value={sol.enBarcelona === true ? 'Sí' : sol.enBarcelona === false ? 'No' : '—'}
                        />
                        <DataField icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} label="WhatsApp" value={`+${sol.telefonoCliente}`} />
                      </div>

                      {/* Ubicación (link) */}
                      {sol.ubicacion && (
                        <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Ubicación (Google Maps)</p>
                            {sol.ubicacion.startsWith('http') ? (
                              <a href={sol.ubicacion} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:underline break-all">
                                {sol.ubicacion}
                              </a>
                            ) : (
                              <p className="text-xs text-gray-700 break-all">{sol.ubicacion}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      {sol.notas && (
                        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                          <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-amber-600 uppercase tracking-wide mb-0.5">Notas</p>
                            <p className="text-xs text-amber-800">{sol.notas}</p>
                          </div>
                        </div>
                      )}

                      {/* Nota de gestión (si ya fue gestionada) */}
                      {!esPendiente && sol.nota && (
                        <div className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-100 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-green-600 uppercase tracking-wide mb-0.5">Nota de gestión</p>
                            <p className="text-xs text-green-800">{sol.nota}</p>
                          </div>
                        </div>
                      )}

                      {/* Acción: marcar como gestionada */}
                      {esPendiente && !esGestionando && (
                        <button
                          onClick={() => setGestionando(sol.id)}
                          className="w-full py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Marcar como gestionada
                        </button>
                      )}
                      {esPendiente && esGestionando && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={notaGestion}
                            onChange={e => setNotaGestion(e.target.value)}
                            placeholder="Nota de gestión (opcional)"
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => marcarGestionada(sol.id)}
                              disabled={guardando}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {guardando ? 'Guardando...' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => { setGestionando(null); setNotaGestion(''); }}
                              className="px-4 py-2 border border-gray-300 text-xs rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        ) : (

          /* ═══════════════════════════════════════
             COMENTARIOS
          ═══════════════════════════════════════ */
          <div className="max-w-2xl mx-auto">
            {/* Filtro pasado / futuro */}
            <div className="flex gap-2 mb-4">
              {(['todos', 'pasado', 'futuro'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltroPeriodo(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filtroPeriodo === f
                      ? 'bg-gray-800 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'todos' ? 'Todos' : f === 'pasado' ? '📅 Eventos pasados' : '🗓 Eventos futuros'}
                  {f !== 'todos' && (
                    <span className="ml-1.5 text-[10px] opacity-70">
                      ({comentarios.filter(c => (c.tipoPeriodo || 'pasado') === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {comentariosFiltrados.length === 0 ? (
                <div className="text-center py-20">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium">No hay comentarios</p>
                  <p className="text-gray-300 text-xs mt-1">
                    {filtroPeriodo === 'todos'
                      ? 'Los comentarios del chatbot aparecerán aquí'
                      : `No hay comentarios de eventos ${filtroPeriodo === 'pasado' ? 'pasados' : 'futuros'}`}
                  </p>
                </div>
              ) : comentariosFiltrados.map(com => (
                <div
                  key={com.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    !com.leido
                      ? 'border-amber-200 bg-white shadow-sm shadow-amber-100'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        !com.leido ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        <Star className={`w-4 h-4 ${!com.leido ? 'text-amber-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* Evento */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{com.nombreEvento}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            (com.tipoPeriodo || 'pasado') === 'pasado'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {(com.tipoPeriodo || 'pasado') === 'pasado' ? 'Pasado' : 'Futuro'}
                          </span>
                          {!com.leido && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                              Nuevo
                            </span>
                          )}
                        </div>

                        {/* Meta del evento */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                          {com.diaEvento && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDia(com.diaEvento)}
                            </span>
                          )}
                          {com.lugarEvento && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {com.lugarEvento}
                            </span>
                          )}
                        </div>

                        {/* Comentario */}
                        <p className="text-sm text-gray-700 leading-relaxed italic bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                          "{com.comentario}"
                        </p>

                        {/* Footer */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            +{com.telefonoCliente}
                          </span>
                          <span>{formatFecha(com.creadoEn)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Marcar leído */}
                    {!com.leido && (
                      <button
                        onClick={() => marcarLeido(com.id)}
                        className="flex-shrink-0 p-2 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                        title="Marcar como leído"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para campos de datos
function DataField({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-xs font-medium text-gray-700 break-words">{value}</p>
      </div>
    </div>
  );
}
