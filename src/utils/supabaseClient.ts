/**
 * Thin Supabase JS client for browser usage.
 *
 * Import this singleton instead of calling createClient() directly in
 * components or hooks so that only one connection pool is opened.
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../config/env';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
