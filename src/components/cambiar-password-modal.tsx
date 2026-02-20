import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock } from 'lucide-react';

export function CambiarPasswordModal() {
  const { cambiarPassword, logout, user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    setError('');
    const result = await cambiarPassword(password);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 16, padding: '2rem',
        width: '100%', maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(245,158,11,0.15)',
            border: '2px solid rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <Lock size={22} color="#f59e0b" />
          </div>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px' }}>
            Cambia tu contraseña
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
            Ingresaste con una contraseña temporal.<br />
            Elige una contraseña definitiva para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.125rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Nueva contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoFocus
                style={{
                  width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(148,163,184,0.15)',
                  borderRadius: 10, color: '#f1f5f9',
                  fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Indicador de fuerza */}
            {password.length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4].map((level) => {
                  const fuerza = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
                    : password.length >= 10 ? 3
                    : password.length >= 8 ? 2 : 1;
                  return (
                    <div key={level} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: level <= fuerza
                        ? fuerza >= 4 ? '#10b981' : fuerza >= 3 ? '#3b82f6' : fuerza >= 2 ? '#f59e0b' : '#ef4444'
                        : 'rgba(148,163,184,0.15)',
                      transition: 'background 0.3s',
                    }} />
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repite la contraseña"
              style={{
                width: '100%', padding: '0.75rem 1rem',
                background: 'rgba(15,23,42,0.6)',
                border: `1px solid ${confirmar && confirmar !== password ? 'rgba(239,68,68,0.4)' : 'rgba(148,163,184,0.15)'}`,
                borderRadius: 10, color: '#f1f5f9',
                fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
              onBlur={(e) => e.target.style.borderColor = confirmar && confirmar !== password ? 'rgba(239,68,68,0.4)' : 'rgba(148,163,184,0.15)'}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.625rem 0.875rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.8125rem',
              background: loading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none', borderRadius: 10,
              color: 'white', fontSize: '0.9375rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '0.625rem',
            }}>
            {loading ? 'Guardando...' : 'Guardar contraseña definitiva'}
          </button>

          <button type="button" onClick={logout}
            style={{ width: '100%', padding: '0.625rem', background: 'transparent', border: 'none', color: '#475569', fontSize: '0.8125rem', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
