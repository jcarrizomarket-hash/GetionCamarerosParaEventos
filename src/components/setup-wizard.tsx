import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

interface Props {
  onSetupComplete: () => void;
}

export function SetupWizard({ onSetupComplete }: Props) {
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) { setError('Completa todos los campos'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${baseUrl}/auth/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Error al crear el administrador');
        setLoading(false);
        return;
      }

      setStep(2);
    } catch {
      setError('Error de conexión con el servidor');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="relative w-full max-w-lg px-8">

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h1 style={{ color: '#f1f5f9', fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Configuración inicial
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 6, lineHeight: 1.5 }}>
                Crea el primer administrador del sistema.<br />
                Este paso solo ocurre una vez.
              </p>
            </div>

            {/* Indicador de pasos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '2rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>1</div>
              <div style={{ width: 40, height: 2, background: 'rgba(148,163,184,0.2)', borderRadius: 2 }} />
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(148,163,184,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>2</div>
            </div>

            <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: '2rem', backdropFilter: 'blur(12px)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '1.125rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Nombre completo
                  </label>
                  <input
                    type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan García"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>

                <div style={{ marginBottom: '1.125rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Email
                  </label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>

                <div style={{ marginBottom: '1.125rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Contraseña
                  </label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Confirmar contraseña
                  </label>
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.625rem 0.875rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8125rem', background: loading ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Creando administrador...' : 'Crear administrador'}
                </button>
              </form>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              {/* Check animado */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 style={{ color: '#f1f5f9', fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                ¡Sistema configurado!
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 6 }}>
                El administrador fue creado correctamente.
              </p>
            </div>

            <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: '2rem', backdropFilter: 'blur(12px)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Próximos pasos:</h3>
                {[
                  'Inicia sesión con tu email y contraseña',
                  'Ve a Configuración → Usuarios para crear coordinadores',
                  'Asigna clientes a cada coordinador',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>

              <button onClick={onSetupComplete} style={{ width: '100%', padding: '0.8125rem', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}>
                Ir al login →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
