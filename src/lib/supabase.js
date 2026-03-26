import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cliente Supabase conectado às chaves do .env
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== '...') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Função utilitária para decidir se usa dados reais ou mock.
 */
export const hasRealConnection = () => !!supabase && supabaseUrl.includes('supabase.co');
