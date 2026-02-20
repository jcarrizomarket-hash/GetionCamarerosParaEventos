import { useState, useEffect } from 'react';
import { UserPlus, Trash2, RefreshCw, Shield, User, Eye, EyeOff } from 'lucide-react';

interface UsuarioSistema {
  id: string;
  email: string;
  nombre: string;
  role: 'admin' | 'coordinador';
  coordinadorId?: string;
  creadoEn: string;
}

interface Props {
  coordinadores: any[];
  baseUrl: string;
  publicAnonKey: string;
}

export function GestionUsuarios({ coordinadores, baseUrl, publicAnonKey }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'coordinador'>('coordinador');
  const [coordinadorId, setCoordinadorId] = useState('');
  const [saving, setSaving] = useState(false);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/usuarios`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      const data = await res.json();
      if (data.success) setUsuarios(data.data);
    } catch {
      setError('Error al cargar usuarios');
    }
    setLoading(false);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) { setError('Completa todos los campos'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (role === 'coordinador' && !coordinadorId) { setError('Selecciona el coordinador vinculado'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${baseUrl}/auth/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ nombre, email, password, role, coordinadorId: role === 'coordinador' ? coordinadorId : undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Error al crear usuario');
      } else {
        setExito(`Usuario ${nombre} creado correctamente`);
        setNombre(''); setEmail(''); setPassword(''); setRole('coordinador'); setCoordinadorId('');
        setMostrarForm(false);
        cargarUsuarios();
        setTimeout(() => setExito(''), 3000);
      }
    } catch {
      setError('Error de conexión');
    }
    setSaving(false);
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`${baseUrl}/auth/usuarios/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setExito('Usuario eliminado');
        cargarUsuarios();
        setTimeout(() => setExito(''), 3000);
      }
    } catch {
      setError('Error al eliminar usuario');
    }
  };

  const getCoordinadorNombre = (id?: string) => {
    if (!id) return '—';
    const c = coordinadores.find(c => c.id === id);
    return c ? c.nombre : id;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Usuarios del sistema</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona los accesos al panel de control</p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargarUsuarios} className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
          <button onClick={() => { setMostrarForm(!mostrarForm); setError(''); }} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-4 h-4" /> Nuevo usuario
          </button>
        </div>
      </div>

      {exito && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ {exito}
        </div>
      )}

      {/* Formulario nuevo usuario */}
      {mostrarForm && (
        <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-4">Crear nuevo usuario</h3>
          <form onSubmit={handleCrear}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ana Martínez"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ana@empresa.com"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña inicial</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <select value={role} onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                  <option value="coordinador">Coordinador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {role === 'coordinador' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vincular con coordinador</label>
                  <select value={coordinadorId} onChange={e => setCoordinadorId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    <option value="">— Seleccionar coordinador —</option>
                    {coordinadores.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">El usuario solo podrá operar sobre los pedidos de este coordinador</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Creando...' : 'Crear usuario'}
              </button>
              <button type="button" onClick={() => { setMostrarForm(false); setError(''); }} className="px-4 py-2 border text-sm rounded-lg text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de usuarios */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando usuarios...</div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hay usuarios registrados</div>
      ) : (
        <div className="overflow-hidden border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Coordinador vinculado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Creado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={u.id} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{u.nombre}</div>
                    <div className="text-gray-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role === 'admin' ? 'Administrador' : 'Coordinador'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getCoordinadorNombre(u.coordinadorId)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.creadoEn).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEliminar(u.id, u.nombre)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
