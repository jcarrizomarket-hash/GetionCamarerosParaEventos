import React, { useState, useEffect } from 'react';
import { usePasswordReset } from '../hooks/usePasswordReset';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const { isLoading, error, success, countdown, requestReset, reset } = usePasswordReset();

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestReset(email);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>

        {!success ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">¿Olvidaste tu contraseña?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Enviar enlace de restablecimiento
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Revisa tu correo electrónico</h2>
            <p className="text-sm text-gray-500 mb-4">
              Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>.
            </p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-400">
                Reenviar en <span className="font-medium text-blue-600">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={() => requestReset(email)}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                Reenviar correo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
