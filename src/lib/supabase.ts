import { createClient } from '@supabase/supabase-js';

// Vite は .env の VITE_* を import.meta.env に注入する。直接参照する
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const envMissing = !supabaseUrl || !supabaseAnonKey;
if (import.meta.env.DEV) {
  console.log('[Supabase] 環境変数', { VITE_SUPABASE_URL: !!supabaseUrl, VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey });
}
if (envMissing) {
  console.warn(
    'Supabase の環境変数が設定されていません。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を追加してください。'
  );
}

/** 環境変数がないとき用のダミー（アプリは落ちず、空データになる） */
const dummySupabase = {
  from: () => ({
    select: () => ({
      eq: () =>
        Promise.resolve({
          data: [],
          error: { message: 'Supabase の環境変数が未設定です。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を追加してください。' },
        }),
    }),
  }),
};

export const supabase = envMissing
  ? (dummySupabase as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl!, supabaseAnonKey!);
