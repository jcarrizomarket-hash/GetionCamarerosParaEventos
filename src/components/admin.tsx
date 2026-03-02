import { useState } from 'react';
import { Shield, Users, RefreshCw, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => Promise<void>;
  camareros: any[];
  pedidos: any[];
}

export function Admin({ coordinadores, setCoordinadores, baseUrl, publicAnonKey, cargarDatos, camareros, pedidos }: AdminProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);

  const stats = {
    totalCamareros: camareros.length,
    totalPedidos: pedidos.length,
    totalCoordinadores: coordinadores.length,
    pedidosPendientes: pedidos.filter((p: any) => p.estado === 'pendiente').length,
    pedidosConfirmados: pedidos.filter((p: any) => p.estado === 'confirmado').length,
    camarerosDisponibles: camareros.filter((c: any) => c.estado === 'disponible').length,
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await cargarDatos();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Panel de Administración</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Camareros</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCamareros}</p>
          <p className="text-xs text-green-600 mt-1">{stats.camarerosDisponibles} disponibles</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Pedidos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPedidos}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs text-yellow-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />{stats.pedidosPendientes}
            </span>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />{stats.pedidosConfirmados}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Coordinadores</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCoordinadores}</p>
        </div>
      </div>

      {/* Coordinadores Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Coordinadores</h3>
        </div>
        <div className="p-4">
          {coordinadores.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay coordinadores registrados.</p>
          ) : (
            <ul className="space-y-2">
              {coordinadores.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-gray-800">{c.nombre || c.name || c.email}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Pedidos Summary */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Resumen de Pedidos Recientes</h3>
        </div>
        <div className="p-4">
          {pedidos.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay pedidos registrados.</p>
          ) : (
            <ul className="space-y-2">
              {pedidos.slice(0, 5).map((p: any) => (
                <li key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-gray-800 text-sm">{p.descripcion || p.nombre || `Pedido #${p.id}`}</span>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                    p.estado === 'confirmado' ? 'bg-green-100 text-green-700' :
                    p.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.estado === 'confirmado' ? <CheckCircle className="w-3 h-3" /> :
                     p.estado === 'rechazado' ? <XCircle className="w-3 h-3" /> :
                     <Clock className="w-3 h-3" />}
                    {p.estado}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}