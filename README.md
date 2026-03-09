# Premium Real Estate Website

This is a code bundle for Premium Real Estate Website. The original project is available at https://www.figma.com/design/HMtH6uiKpYIQhBmQjPs7nz/Premium-Real-Estate-Website.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Vercel にデプロイする

1. **Vercel にログイン**  
   [vercel.com](https://vercel.com) で GitHub アカウントを使ってログインする。

2. **プロジェクトをインポート**  
   - **Add New…** → **Project** をクリック  
   - GitHub の **ryukikudo2000/Realestate** リポジトリを選ぶ（または「Import」で接続）  
   - **Framework Preset** は **Vite** のまま（`vercel.json` で設定済み）

3. **環境変数を設定**  
   **Environment Variables** で次の2つを追加する（本番用に **Production** にチェック）:

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | Supabase の Project URL（例: `https://xxxxx.supabase.co`） |
   | `VITE_SUPABASE_ANON_KEY` | Supabase の anon public key |

   値は [Supabase Dashboard](https://supabase.com/dashboard) → 対象プロジェクト → **Settings** → **API** で確認できる。

4. **Deploy** をクリックしてデプロイする。

5. 完了後、表示された URL（例: `https://xxxx.vercel.app`）でサイトが表示される。  
   メール送信を使う場合は、Supabase の **Edge Functions** のシークレット（`RESEND_API_KEY` / `OWNER_EMAIL`）も設定する（`supabase/README.md` 参照）。
