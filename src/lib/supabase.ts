import { createClient } from '@supabase/supabase-js';
import { supabaseUrl as configUrl, supabaseAnonKey as configKey } from './supabase-config';

// 1. .env の VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を優先
// 2. なければ supabase-config.ts を使う
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();
const supabaseUrl = (envUrl || configUrl || '').trim();
const supabaseAnonKey = (envKey || configKey || '').trim();

const envMissing = !supabaseUrl || !supabaseAnonKey;
const source = envUrl ? '.env' : configUrl ? 'supabase-config.ts' : 'なし';
if (import.meta.env.DEV) {
  console.log('[Supabase] 読み込み', { あり: !envMissing, 参照: source });
}
if (envMissing) {
  console.warn(
    'Supabase の設定がありません。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を入れるか、src/lib/supabase-config.ts に値を入れてください。'
  );
}

/** 環境変数がないとき用のダミー（アプリは落ちず、空データになる） */
const dummySupabase = {
  from: () => ({
    select: () => ({
      eq: () =>
        Promise.resolve({
          data: [],
          error: { message: 'Supabase の設定が未設定です。.env に VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を入れてください。' },
        }),
    }),
  }),
};

export const supabase = envMissing
  ? (dummySupabase as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'tokyo-expat-housing-auth',
      },
    });
