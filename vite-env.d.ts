/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_FUNCTION_ENDPOINT: string;
  readonly VITE_SUPABASE_FN_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
