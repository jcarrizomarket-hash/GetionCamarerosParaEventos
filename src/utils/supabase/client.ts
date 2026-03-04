import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../../config/env';

let _client: SupabaseClient | null = null;

/**
 * Returns a shared Supabase client for frontend PostgREST queries.
 * Returns null when the required env vars are not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}
