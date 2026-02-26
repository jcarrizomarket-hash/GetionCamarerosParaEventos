import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { validatePasswordRequirements, validatePasswordMatch } from '../utils/authValidators';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador',
  camarero: 'Camarero',
  Admin: 'Administrador',
  User: 'Usuario',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  coordinador: 'bg-blue-100 text-blue-800',
  camarero: 'bg-green-100 text-green-800',
  Admin: 'bg-red-100 text-red-800',
  User: 'bg-gray-100 text-gray-800',
};

export default function ProfilePage() {
  const { user, changePassword, isLoading } = useAuthContext();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordRequirements = validatePasswordRequirements(newPassword);
  const passwordsMatch = validatePasswordMatch(newPassword, confirmPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!passwordsMatch) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (!passwordRequirements.valid) {
      setError('La nueva contraseña no cumple los requisitos mínimos de seguridad');
      return;
    }

    setFormLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setSuccessMessage('Contraseña actualizada con éxito');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error ?? 'Error al cambiar la contraseña');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '';
  const roleColor = user?.role ? (ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-800') : '';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Profile info card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil de usuario</h2>
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user.nombre}{user.apellido ? ` ${user.apellido}` : ''}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="pt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor}`}>
                {roleLabel}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No has iniciado sesión</p>
        )}
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar contraseña</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña *</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={formLoading || isLoading}
            className="bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {formLoading || isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
