/**
 * Supabase の接続情報
 * 下の '' の中に、Supabase の Project URL と anon key を貼り付けてください。
 *
 * 取得方法: Supabase ダッシュボード → Project Settings → API
 *   - Project URL → supabaseUrl
 *   - anon public → supabaseAnonKey
 *
 * .env が効かない場合は、このファイルに直接書けば動きます。
 * 本番でキーを出したくない場合は、このファイルを .gitignore に追加してください。
 */
export const supabaseUrl = 'https://mpvkdbfvaqrwayzntkdg.supabase.co'; // 例: 'https://xxxxxxxx.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdmtkYmZ2YXFyd2F5em50a2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODAxMjMsImV4cCI6MjA4NTE1NjEyM30.yUFrYkVpb6b1h1ckW7a7tGsaAKsdsO6YTneK9pf7aGM'; // 例: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
