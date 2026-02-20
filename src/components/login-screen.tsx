import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)'
        }} />
      </div>

      <div className="relative w-full max-w-md px-8">
        {/* Logo / Marca */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'system-ui, sans-serif' }}>
            Gestión de Eventos
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
            Accede a tu panel de control
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30,41,59,0.8)',
          border: '1px solid rgba(148,163,184,0.1)',
          borderRadius: 16,
          padding: '2rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coordinador@empresa.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(148,163,184,0.15)',
                  borderRadius: 10, color: '#f1f5f9',
                  fontSize: '0.9375rem', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(148,163,184,0.15)',
                  borderRadius: 10, color: '#f1f5f9',
                  fontSize: '0.9375rem', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '0.625rem 0.875rem',
                color: '#fca5a5', fontSize: '0.875rem',
                marginBottom: '1.25rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.8125rem',
                background: loading
                  ? 'rgba(99,102,241,0.4)'
                  : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', borderRadius: 10,
                color: 'white', fontSize: '0.9375rem',
                fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s, transform 0.1s',
                letterSpacing: '0.01em'
              }}
              onMouseDown={(e) => { if (!loading) (e.target as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8125rem', marginTop: '1.5rem' }}>
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  );
}
