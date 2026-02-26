import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useRequireRole } from '../hooks/useRequireRole';
import type { SignUpCredentials } from '../types/auth';
import { validatePasswordRequirements } from '../utils/authValidators';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

interface NewUserForm extends SignUpCredentials {
  confirmPassword: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'camarero', label: 'Camarero' },
] as const;

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  coordinador: 'bg-blue-100 text-blue-800',
  camarero: 'bg-green-100 text-green-800',
};

export default function UserManagementPage() {
  const { signup, isLoading } = useAuthContext();
  const { hasRole } = useRequireRole('admin');

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState<NewUserForm>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'camarero',
  });

  const passwordRequirements = validatePasswordRequirements(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!passwordRequirements.valid) {
      setError('La contraseña no cumple los requisitos mínimos de seguridad');
      return;
    }

    setFormLoading(true);
    try {
      const { confirmPassword: _, ...credentials } = form;
      const result = await signup(credentials);
      if (result.success) {
        setSuccessMessage(`Usuario ${form.email} creado con éxito`);
        setForm({ nombre: '', apellido: '', email: '', password: '', confirmPassword: '', role: 'camarero' });
        setShowForm(false);
      } else {
        setError(result.error ?? 'Error al crear el usuario');
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (!hasRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="text-6xl font-bold text-gray-300">403</div>
        <h1 className="text-xl font-semibold text-gray-700">Acceso denegado</h1>
        <p className="text-sm text-gray-500">Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Gestión de usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Solo administradores</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError(''); setSuccessMessage(''); }}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Crear nuevo usuario</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  name="apellido"
                  type="text"
                  value={form.apellido}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="García"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {form.role && (
                <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[form.role]}`}>
                  {ROLE_OPTIONS.find(o => o.value === form.role)?.label}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mínimo 8 caracteres"
              />
              <PasswordStrengthMeter password={form.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading || isLoading}
                className="bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {formLoading || isLoading ? 'Creando...' : 'Crear usuario'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                className="bg-gray-100 text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <p className="text-sm text-gray-500">
          Usa el formulario de arriba para crear nuevos usuarios con el rol adecuado.
          Los roles disponibles son: <strong>Administrador</strong>, <strong>Coordinador</strong> y <strong>Camarero</strong>.
        </p>
      </div>
    </div>
  );
}
