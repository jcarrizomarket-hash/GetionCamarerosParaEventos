import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';



export type UserRole = 'admin' | 'coordinador' | 'camarero' | 'cliente';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
  // Para camareros: id del camarero en kv_store
  camareroId?: string;
  // Para clientes: nombre del cliente en pedidos
  clienteNombre?: string;
}



export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(parseUser(session.user));
      setLoading(false);
    });

    // Cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(parseUser(session.user));
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<{ error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) setUser(parseUser(data.user));
    return { error: null };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return { user, loading, login, logout, supabase };
}

function parseUser(supabaseUser: any): AuthUser {
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    role: (meta.role as UserRole) ?? 'coordinador',
    nombre: meta.nombre ?? supabaseUser.email ?? '',
    camareroId: meta.camareroId,
    clienteNombre: meta.clienteNombre,
  };
}

export { supabase };
