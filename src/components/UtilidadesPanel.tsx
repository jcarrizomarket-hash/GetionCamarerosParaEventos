import { useState } from 'react';
import { Trash2, Bell, BellOff, Volume2, Play, Settings } from 'lucide-react';
import {
  loadNotifConfig,
  saveNotifConfig,
  playNotificationSound,
  type NotificacionConfig,
  type NotificacionId,
} from '../hooks/useNotificationSounds';

interface UtilidadesPanelProps {
  pedidos: any[];
  eliminarPedidoPorNumero: (numero: string) => void;
  categoriasSeleccionadas: string[];
  toggleCategoria: (cat: string) => void;
  limpiarDatos: () => void;
  limpiandoDatos: boolean;
}

export function UtilidadesPanel({
  pedidos,
  eliminarPedidoPorNumero,
  categoriasSeleccionadas,
  toggleCategoria,
  limpiarDatos,
  limpiandoDatos,
}: UtilidadesPanelProps) {
  const [activeInnerTab, setActiveInnerTab] = useState<'sistema' | 'notificaciones'>('sistema');
  const [notifConfig, setNotifConfig] = useState<NotificacionConfig[]>(loadNotifConfig);

  function handleToggle(id: NotificacionId) {
    const updated = notifConfig.map(n =>
      n.id === id ? { ...n, habilitada: !n.habilitada } : n
    );
    setNotifConfig(updated);
    saveNotifConfig(updated);
  }

  function handleVolumen(id: NotificacionId, vol: number) {
    const updated = notifConfig.map(n =>
      n.id === id ? { ...n, volumen: vol } : n
    );
    setNotifConfig(updated);
    saveNotifConfig(updated);
  }

  function handleTest(n: NotificacionConfig) {
    if (n.habilitada) playNotificationSound(n.id, n.volumen);
  }

  function handleToggleAll(habilitada: boolean) {
    const updated = notifConfig.map(n => ({ ...n, habilitada }));
    setNotifConfig(updated);
    saveNotifConfig(updated);
  }

  const todasHabilitadas = notifConfig.every(n => n.habilitada);
  const ningunaHabilitada = notifConfig.every(n => !n.habilitada);

  return (
    <div className="space-y-4">
      {/* Inner tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveInnerTab('sistema')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeInnerTab === 'sistema'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          Configuración del sistema
        </button>
        <button
          onClick={() => setActiveInnerTab('notificaciones')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeInnerTab === 'notificaciones'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notificaciones
        </button>
      </div>

      {/* ── Configuración del sistema ── */}
      {activeInnerTab === 'sistema' && (
        <div className="space-y-6 pt-2">
          {/* Eliminar Pedido */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Eliminar Pedido Específico
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Esta herramienta permite eliminar pedidos que no se pueden eliminar desde la interfaz normal.
            </p>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-gray-900 mb-3">Pedidos Actuales:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pedidos.map(pedido => (
                  <div key={pedido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex-1">
                      <span className="font-mono font-bold text-blue-600">{pedido.numero}</span>
                      <span className="text-gray-600 ml-3">{pedido.cliente}</span>
                      <span className="text-gray-500 ml-3 text-sm">{pedido.lugar}</span>
                      <span className="text-gray-400 ml-3 text-sm">{pedido.diaEvento}</span>
                    </div>
                    <button
                      onClick={() => eliminarPedidoPorNumero(pedido.numero)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                ))}
                {pedidos.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hay pedidos en el sistema</p>
                )}
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">⚠️ Precaución:</p>
              <p className="text-sm text-amber-700 mt-1">
                La eliminación es permanente y no se puede deshacer.
              </p>
            </div>
          </div>

          {/* Limpieza Masiva */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Limpieza Masiva de Datos
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Esta herramienta permite eliminar datos de manera masiva del sistema.
            </p>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-gray-900 mb-3">Categorías Disponibles:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {[
                  { id: 'pedidos', label: 'Pedidos', desc: 'Todos los Pedidos (entrada, asignación, gestión)' },
                  { id: 'chats', label: 'Chats', desc: 'Chats Grupales de Eventos' },
                  { id: 'mensajes', label: 'Mensajes', desc: 'Mensajes de Chats' },
                  { id: 'conversaciones', label: 'Conversaciones', desc: 'Conversaciones del Chatbot' },
                ].map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex-1">
                      <span className="font-mono font-bold text-blue-600">{cat.label}</span>
                      <span className="text-gray-600 ml-3">{cat.desc}</span>
                    </div>
                    <button
                      onClick={() => toggleCategoria(cat.id)}
                      className={`px-4 py-2 ${
                        categoriasSeleccionadas.includes(cat.id)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      } rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {categoriasSeleccionadas.includes(cat.id) ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">⚠️ Precaución:</p>
              <p className="text-sm text-amber-700 mt-1">
                La eliminación es permanente y no se puede deshacer.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={limpiarDatos}
                disabled={limpiandoDatos}
                className={`px-4 py-2 ${
                  limpiandoDatos ? 'bg-gray-500 text-gray-300' : 'bg-red-600 text-white'
                } rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium`}
              >
                <Trash2 className="w-4 h-4" />
                {limpiandoDatos ? 'Limpiando...' : 'Limpiar Datos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notificaciones ── */}
      {activeInnerTab === 'notificaciones' && (
        <div className="space-y-5 pt-2">
          {/* Header info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Notificaciones sonoras para coordinadores</p>
              <p className="text-sm text-blue-700 mt-0.5">
                Configura qué eventos generan una alerta de sonido mientras usas la aplicación.
                Los cambios se guardan automáticamente.
              </p>
            </div>
          </div>

          {/* Acciones globales */}
          <div className="flex gap-3">
            <button
              onClick={() => handleToggleAll(true)}
              disabled={todasHabilitadas}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Bell className="w-4 h-4" /> Activar todas
            </button>
            <button
              onClick={() => handleToggleAll(false)}
              disabled={ningunaHabilitada}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <BellOff className="w-4 h-4" /> Silenciar todas
            </button>
          </div>

          {/* Lista de notificaciones */}
          <div className="space-y-3">
            {notifConfig.map(notif => (
              <div
                key={notif.id}
                className={`rounded-xl border p-5 transition-colors ${
                  notif.habilitada
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{notif.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{notif.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{notif.descripcion}</p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(notif.id)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      notif.habilitada ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={notif.habilitada}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${
                        notif.habilitada ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Volumen + Test (solo si habilitada) */}
                {notif.habilitada && (
                  <div className="mt-4 flex items-center gap-4">
                    <Volume2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={notif.volumen}
                        onChange={e => handleVolumen(notif.id, Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
                      {notif.volumen}%
                    </span>
                    <button
                      onClick={() => handleTest(notif)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex-shrink-0"
                      title="Escuchar sonido"
                    >
                      <Play className="w-3 h-3" /> Probar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center pb-2">
            Los sonidos se reproducen en tu dispositivo. Asegúrate de tener el volumen del sistema activado.
          </p>
        </div>
      )}
    </div>
  );
}
