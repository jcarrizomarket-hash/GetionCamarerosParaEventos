import { useState } from 'react';
import { Shield, UserPlus, Trash2, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

interface Coordinador {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

interface Camarero {
  id: string;
  numero: number;
  nombre: string;
  telefono?: string;
  activo: boolean;
}

interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  diaEvento: string;
}

interface AdminProps {
  coordinadores: Coordinador[];
  setCoordinadores: (c: Coordinador[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: Camarero[];
  pedidos: Pedido[];
}

export function Admin({
  coordinadores,
  setCoordinadores,
  baseUrl,
  publicAnonKey,
  cargarDatos,
  camareros,
  pedidos,
}: AdminProps) {
  const [activeSection, setActiveSection] = useState<'coordinadores' | 'resumen'>('resumen');
  const [nuevoCoordinador, setNuevoCoordinador] = useState({ nombre: '', telefono: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const agregarCoordinador = async () => {
    if (!nuevoCoordinador.nombre.trim()) {
      setMensaje('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/coordinadores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(nuevoCoordinador),
      });
      const data = await response.json();
      if (data.success) {
        setCoordinadores([...coordinadores, data.data]);
        setNuevoCoordinador({ nombre: '', telefono: '', email: '' });
        setMensaje('Coordinador agregado correctamente');
      } else {
        setMensaje(`Error: ${data.error}`);
      }
    } catch (error) {
      logger.error('Error al agregar coordinador', error);
      setMensaje('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const eliminarCoordinador = async (id: string) => {
    if (!confirm('¿Eliminar este coordinador?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/coordinadores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) {
        setCoordinadores(coordinadores.filter((c) => c.id !== id));
        setMensaje('Coordinador eliminado');
      } else {
        setMensaje(`Error: ${data.error}`);
      }
    } catch (error) {
      logger.error('Error al eliminar coordinador', error);
      setMensaje('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Panel de Administración</h2>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 border-b">
        {(['resumen', 'coordinadores'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 capitalize border-b-2 transition-colors ${
              activeSection === section
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {section === 'resumen' ? 'Resumen' : 'Coordinadores'}
          </button>
        ))}
      </div>

      {mensaje && (
        <div className="p-3 bg-blue-50 text-blue-800 rounded border border-blue-200">
          {mensaje}
          <button onClick={() => setMensaje('')} className="ml-2 text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {activeSection === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">{camareros.length}</div>
            <div className="text-gray-600">Camareros registrados</div>
            <div className="text-sm text-gray-400">{camareros.filter((c) => c.activo).length} activos</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">{pedidos.length}</div>
            <div className="text-gray-600">Pedidos totales</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-purple-600">{coordinadores.length}</div>
            <div className="text-gray-600">Coordinadores</div>
          </div>
        </div>
      )}

      {activeSection === 'coordinadores' && (
        <div className="space-y-4">
          {/* Add coordinator form */}
          <div className="bg-white rounded-lg border p-4 space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Agregar Coordinador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nombre *"
                value={nuevoCoordinador.nombre}
                onChange={(e) => setNuevoCoordinador({ ...nuevoCoordinador, nombre: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={nuevoCoordinador.telefono}
                onChange={(e) => setNuevoCoordinador({ ...nuevoCoordinador, telefono: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={nuevoCoordinador.email}
                onChange={(e) => setNuevoCoordinador({ ...nuevoCoordinador, email: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={agregarCoordinador}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Agregar Coordinador'}
            </button>
          </div>

          {/* Coordinadores list */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium text-gray-900">Coordinadores ({coordinadores.length})</h3>
              <button
                onClick={cargarDatos}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>
            {coordinadores.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay coordinadores registrados</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-600">Nombre</th>
                    <th className="text-left px-4 py-2 text-gray-600">Teléfono</th>
                    <th className="text-left px-4 py-2 text-gray-600">Email</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {coordinadores.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{c.nombre}</td>
                      <td className="px-4 py-2 text-gray-500">{c.telefono || '-'}</td>
                      <td className="px-4 py-2 text-gray-500">{c.email || '-'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => eliminarCoordinador(c.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}