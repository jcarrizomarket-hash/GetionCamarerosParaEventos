export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!projectId || !publicAnonKey) {
  console.error('❌ Variables de entorno VITE_SUPABASE_* no configuradas');
}