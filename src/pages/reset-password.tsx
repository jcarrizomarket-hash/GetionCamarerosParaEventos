import React, { useState, useEffect } from 'react';
import { Copy, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import * as authService from '../utils/authService';
import { useAuthContext } from '../context/AuthContext';

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expirado');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

export default function ResetPasswordPage() {
  const { changePassword } = useAuthContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [tempPassword, setTempPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const countdown = useCountdown(expiresAt);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('No se encontró el token de restablecimiento.');
      return;
    }
    authService.verifyResetToken(token).then((res) => {
      if (res.success && res.tempPassword) {
        setTempPassword(res.tempPassword);
        setExpiresAt(res.expiresAt ?? null);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('El enlace de restablecimiento es inválido o ha expirado.');
      }
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const result = await changePassword(currentPassword, newPassword);
    if (!result.success) throw new Error(result.error ?? 'Error al cambiar contraseña');
    window.location.href = '/';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Verificando enlace…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Contraseña temporal</h2>
        </div>

        {/* Temp password display */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Tu contraseña temporal</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-gray-900 flex-1 break-all">{tempPassword}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm shrink-0"
            >
              <Copy size={14} />
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">Contraseña temporal válida por 24 horas</p>
        </div>

        {/* Countdown */}
        {countdown && countdown !== 'Expirado' && (
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <Clock size={16} />
            <span className="font-mono text-lg font-semibold">{countdown}</span>
            <span className="text-sm">restante</span>
          </div>
        )}
        {countdown === 'Expirado' && (
          <p className="text-center text-red-600 font-semibold mb-6">Esta contraseña ha expirado</p>
        )}

        {/* CTA */}
        <button
          onClick={() => setChangeOpen(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Cambiar contraseña ahora
        </button>
      </div>

      <ChangePasswordModal
        isOpen={changeOpen}
        onClose={() => setChangeOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}
