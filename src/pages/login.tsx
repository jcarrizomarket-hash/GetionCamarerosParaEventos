import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SocialLoginButtons from '../components/SocialLoginButtons';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useAuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const { login, socialLogin, isLoading } = useAuthContext();
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [socialMessage, setSocialMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    setError('');
    setFormLoading(true);
    try {
      const result = await login({ email, password, rememberMe });
      if (result.success) {
        window.location.href = '/';
      } else {
        setError(result.error ?? 'Error al iniciar sesión');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialMessage('OAuth configurado externamente');
    // Actual OAuth requires provider setup; show informational message
    const result = await socialLogin(provider, '');
    if (result.success) {
      window.location.href = '/';
    } else {
      setSocialMessage(`OAuth configurado externamente (${provider})`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">GC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión Camareros</h1>
          <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta</p>
        </div>

        {/* Login Form */}
        <LoginForm
          onSubmit={handleLogin}
          onForgotPassword={() => setForgotOpen(true)}
          isLoading={formLoading || isLoading}
          error={error}
        />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-400">o continúa con</span>
          </div>
        </div>

        {/* Social Login */}
        <SocialLoginButtons
          onSocialLogin={handleSocialLogin}
          isLoading={formLoading || isLoading}
        />

        {socialMessage && (
          <p className="mt-3 text-center text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            {socialMessage}
          </p>
        )}
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </div>
  );
}
