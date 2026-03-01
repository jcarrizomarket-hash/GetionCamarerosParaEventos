import { useState } from 'react';
import { Shield, Users, UserCheck, RefreshCw } from 'lucide-react';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: any[];
  pedidos: any[];
}

export function Admin({ coordinadores, setCoordinadores, baseUrl, publicAnonKey, cargarDatos, camareros, pedidos }: AdminProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await cargarDatos();
      setMessage('Datos actualizados correctamente');
    } catch (error) {
      setMessage('Error al actualizar datos');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <Users className="w-10 h-10 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Camareros</p>
            <p className="text-2xl font-bold text-gray-800">{camareros.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <UserCheck className="w-10 h-10 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Coordinadores</p>
            <p className="text-2xl font-bold text-gray-800">{coordinadores.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <Shield className="w-10 h-10 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Pedidos</p>
            <p className="text-2xl font-bold text-gray-800">{pedidos.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Acciones Rápidas</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>
    </div>
  );
}
