import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

// Database types
export interface DbBDC {
  id: string;
  cik: string;
  name: string;
  ticker: string | null;
  created_at: string;
}

export interface DbHolding {
  id: string;
  bdc_cik: string;
  period_date: string;
  company_name: string;
  industry_raw: string | null;
  industry_sector: string;
  fair_value: number;
  created_at: string;
}
