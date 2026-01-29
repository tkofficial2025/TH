import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase の環境変数が設定されていません。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を追加してください。'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
