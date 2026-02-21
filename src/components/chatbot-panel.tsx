import { useState, useEffect } from 'react';
import { MessageSquare, ClipboardList, Star, CheckCircle2, Clock, Phone, Calendar, MapPin, Users, ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react';

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

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resSol, resCom] = await Promise.all([
        fetch(`${baseUrl}/chatbot-solicitudes`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
        fetch(`${baseUrl}/chatbot-comentarios`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
      ]);
      const [dataSol, dataCom] = await Promise.all([resSol.json(), resCom.json()]);
      if (dataSol.success) setSolicitudes(dataSol.data);
      if (dataCom.success) setComentarios(dataCom.data);
    } catch (e) { console.error('Error cargando datos chatbot:', e); }
    setLoading(false);
  };

  const marcarGestionada = async (id: string) => {
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
      }
    } catch (e) { console.error(e); }
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

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Chatbot WhatsApp</h1>
              <p className="text-xs text-gray-500">Solicitudes y comentarios de clientes</p>
            </div>
          </div>
          <button onClick={cargarDatos}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setTab('solicitudes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'solicitudes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <ClipboardList className="w-4 h-4" />
            Solicitudes de pedido
            {pendientes > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'solicitudes' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
              }`}>
                {pendientes}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('comentarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'comentarios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <Star className="w-4 h-4" />
            Comentarios
            {noLeidos > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'comentarios' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                {noLeidos}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm animate-pulse">Cargando...</div>
        ) : tab === 'solicitudes' ? (
          /* ── SOLICITUDES ── */
          <div className="space-y-3 max-w-2xl mx-auto">
            {solicitudes.length === 0 ? (
              <div className="text-center py-16">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No hay solicitudes aún</p>
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
                      ? 'border-blue-200 bg-blue-50/40 shadow-sm'
                      : 'border-gray-200 bg-white'
                  }`}>
                  {/* Cabecera de la tarjeta */}
                  <div
                    className="flex items-start justify-between p-4 cursor-pointer"
                    onClick={() => setExpandido(esExpandido ? null : sol.id)}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        esPendiente ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {esPendiente
                          ? <Clock className="w-4 h-4 text-blue-500" />
                          : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{sol.tipoEvento}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            esPendiente ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {esPendiente ? 'Pendiente' : 'Gestionada'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          📱 +{sol.telefonoCliente} · {formatFecha(sol.creadoEn)}
                        </p>
                      </div>
                    </div>
                    {esExpandido
                      ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
                  </div>

                  {/* Detalle expandido */}
                  {esExpandido && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fecha evento</p>
                            <p className="text-xs font-medium text-gray-700">{sol.fechaEvento}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                          <Users className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Camareros</p>
                            <p className="text-xs font-medium text-gray-700">{sol.cantidadCamareros}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lugar</p>
                            <p className="text-xs font-medium text-gray-700">{sol.lugarEvento}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                          <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Horario</p>
                            <p className="text-xs font-medium text-gray-700">{sol.horario}</p>
                          </div>
                        </div>
                      </div>

                      {sol.contacto && (
                        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl mb-3">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Contacto</p>
                            <p className="text-xs font-medium text-gray-700">{sol.contacto}</p>
                          </div>
                        </div>
                      )}

                      {sol.nota && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-3 text-xs text-amber-800">
                          📝 {sol.nota}
                        </div>
                      )}

                      {/* Acción gestionar */}
                      {esPendiente && !esGestionando && (
                        <button
                          onClick={() => setGestionando(sol.id)}
                          className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
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
                            <button onClick={() => marcarGestionada(sol.id)}
                              className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors">
                              Confirmar
                            </button>
                            <button onClick={() => { setGestionando(null); setNotaGestion(''); }}
                              className="px-4 py-2 border border-gray-300 text-xs rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
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
          /* ── COMENTARIOS ── */
          <div className="space-y-3 max-w-2xl mx-auto">
            {comentarios.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No hay comentarios aún</p>
                <p className="text-gray-300 text-xs mt-1">Los comentarios del chatbot aparecerán aquí</p>
              </div>
            ) : comentarios.map(com => (
              <div key={com.id}
                className={`rounded-2xl border p-4 transition-all ${
                  !com.leido
                    ? 'border-amber-200 bg-amber-50/50 shadow-sm'
                    : 'border-gray-200 bg-white'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !com.leido ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      <Star className={`w-4 h-4 ${!com.leido ? 'text-amber-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{com.nombreEvento}</span>
                        {!com.leido && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        📱 +{com.telefonoCliente} · {formatFecha(com.creadoEn)}
                      </p>
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        "{com.comentario}"
                      </p>
                    </div>
                  </div>
                  {!com.leido && (
                    <button onClick={() => marcarLeido(com.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Marcar como leído">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
