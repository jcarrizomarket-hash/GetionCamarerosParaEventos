// Shim: re-exports the actual server from the src directory.
// The Supabase CLI requires the entrypoint to live inside supabase/functions/.
export { default } from '../../../src/supabase/functions/server/index.tsx';