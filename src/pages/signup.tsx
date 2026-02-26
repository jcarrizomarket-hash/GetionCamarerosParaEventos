import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { validatePasswordRequirements, validatePasswordMatch } from '../utils/authValidators';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function SignupPage() {
  const { signup, isLoading } = useAuthContext();

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordRequirements = validatePasswordRequirements(password);
  const passwordsMatch = validatePasswordMatch(password, confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!passwordRequirements.valid) {
      setError('La contraseña no cumple los requisitos mínimos de seguridad');
      return;
    }

    setFormLoading(true);
    try {
      const result = await signup({ email, password, nombre, apellido });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? 'Error al crear la cuenta');
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Cuenta creada con éxito!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Tu cuenta ha sido creada. Ya puedes iniciar sesión.
          </p>
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Ir al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">GC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión Camareros</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="García"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Mínimo 8 caracteres"
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Repite tu contraseña"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={formLoading || isLoading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {formLoading || isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <a href="/" className="text-indigo-600 hover:underline font-medium">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
