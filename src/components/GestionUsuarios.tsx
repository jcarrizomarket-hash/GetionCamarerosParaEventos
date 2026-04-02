import { useState, useEffect } from 'react';
import { UserPlus, Trash2, RefreshCw, Shield, Users, User, Building2 } from 'lucide-react';
import { supabase } from '../hooks/useAuth';
import { ROLES as ROLES, employeeLabel as genericLabel } from '../config/env';
import type { UserRole } from '../hooks/useAuth';


const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador',
  camarero: 'Camarero',
  cliente: 'Cliente',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  coordinador: 'bg-blue-100 text-blue-700',
  camarero: 'bg-purple-100 text-purple-700',
  cliente: 'bg-green-100 text-green-700',
};

const ROLE_ICONS: Record<UserRole, any> = {
  admin: Shield,
  coordinador: Users,
  camarero: User,
  cliente: Building2,
};

interface GestionUsuariosProps {
  camareros: any[];
  clientes: any[];
  baseUrl: string;
  publicAnonKey: string;
}

export function GestionUsuarios({ camareros, clientes, baseUrl, publicAnonKey }: GestionUsuariosProps) {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'coordinador' as UserRole,
    camareroId: '',
    clienteNombre: '',
  });
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => { cargarUsuarios(); }, []);

  async function cargarUsuarios() {
    setCargando(true);
    try {
      console.log('🔍 Cargando usuarios desde:', `${baseUrl}/usuarios`);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || publicAnonKey;
      const response = await fetch(`${baseUrl}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📡 Status:', response.status);
      const text = await response.text();
      console.log('📦 Response:', text);
      const result = JSON.parse(text);
      if (result.success && result.data) {
        setUsuarios(result.data);
      } else {
        setError(result.error || 'Error al cargar usuarios');
        setUsuarios([]);
      }
    } catch (e: any) {
      console.error('❌ Error:', e);
      setError(e.message);
      setUsuarios([]);
    }
    setCargando(false);
  }

  async function eliminarUsuario(id: string) {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || publicAnonKey;
      const response = await fetch(`${baseUrl}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario');
    } finally {
      setCreando(false);
    }
  }

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setExito('');
    setCreando(true);

    try {
      // Crear usuario via Supabase Auth (requiere confirmación de email deshabilitada)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nombre: form.nombre,
            role: form.role,
            ...(form.role === ROLES.CAMARERO && form.camareroId ? { camareroId: form.camareroId } : {}),
            ...(form.role === ROLES.CLIENTE && form.clienteNombre ? { clienteNombre: form.clienteNombre } : {}),
          },
        },
      });

      if (signUpError) throw new Error(signUpError.message);
      if (!data.user) throw new Error('No se pudo crear el usuario');

      setExito(`Usuario ${form.email} creado correctamente como ${ROLE_LABELS[form.role]}.`);
      setForm({ nombre: '', email: '', password: '', role: ROLES.COORDINADOR as UserRole, camareroId: '', clienteNombre: '' });
      cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setCreando(false);
    }
  }

  const RoleIcon = ({ role }: { role: UserRole }) => {
    const Icon = ROLE_ICONS[role] || User;
    return <Icon className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      {/* Crear usuario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          Crear nuevo usuario
        </h3>

        <form onSubmit={crearUsuario} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole, camareroId: '', clienteNombre: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>

            {/* Campo extra según rol */}
            {form.role === ROLES.CAMARERO && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vincular con camarero del sistema
                </label>
                <select
                  value={form.camareroId}
                  onChange={e => setForm(f => ({ ...f, camareroId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">— Seleccionar {genericLabel} —</option>
                  {camareros.map(c => (
                    <option key={c.id} value={c.id}>#{c.numero} {c.nombre} {c.apellido}</option>
                  ))}
                </select>
              </div>
            )}

            {form.role === ROLES.CLIENTE && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vincular con cliente del sistema
                </label>
                <select
                  value={form.clienteNombre}
                  onChange={e => setForm(f => ({ ...f, clienteNombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">— Seleccionar cliente —</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
          {exito && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">{exito}</div>}

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
            ⚠️ El usuario recibirá un email de confirmación de Supabase. Para saltear esto, deshabilitar "Confirm email" en Supabase → Authentication → Settings.
          </div>

          <button
            type="submit"
            disabled={creando}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
          >
            {creando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {creando ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Usuarios del sistema
          </h3>
          <button onClick={cargarUsuarios} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {cargando ? (
          <div className="text-center py-8 text-gray-400">Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-sm">No hay usuarios registrados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {usuarios.map(u => {
              const role = (u.user_metadata?.role ?? 'coordinador') as UserRole;
              return (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{u.nombre || u.email}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    {u.camareroId && <p className="text-xs text-purple-600">${genericLabel} vinculado</p>}
                    {u.clienteNombre && <p className="text-xs text-green-600">Cliente: {u.clienteNombre}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                      <RoleIcon role={role} />
                      {ROLE_LABELS[role]}
                    </span>
                    <button
                      onClick={() => eliminarUsuario(u.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Para gestión completa de usuarios (eliminar, cambiar contraseña) usá:
          <a href="https://supabase.com/dashboard/project/gkfpsyclglyradzeyuwz/auth/users" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
            Supabase → Authentication → Users ↗
          </a>
        </p>
      </div>
    </div>
  );
}
