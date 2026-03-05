# Supabase

## デプロイの流れ

### フロント（サイト本体）

1. リポジトリを Vercel / Netlify などに接続
2. **Build command:** `npm run build`（または `node scripts/generate-blog-posts.js && vite build`）
3. **Output directory:** `dist`
4. 環境変数に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定（本番の Supabase プロジェクトの値）

### Edge Function（メール送信）

**初回だけ:** Supabase CLI でプロジェクトをリンクします。

```bash
# CLI 未インストールの場合: npm i -g supabase
supabase login
supabase link --project-ref <プロジェクトID>
```

プロジェクト ID は [Supabase Dashboard](https://supabase.com/dashboard) → 対象プロジェクト → **Settings** → **General** の **Reference ID** です。

**デプロイ:**

```bash
supabase functions deploy send-request-emails --no-verify-jwt
```

**シークレット:** Dashboard → **Project Settings** → **Edge Functions** → **Secrets** で `RESEND_API_KEY` と `OWNER_EMAIL` を追加して Save。

---

## ⚠️ 物件が一切取得されない場合（毎回ここを実行）

**Featured・賃貸・売却・詳細が 0 件になる**ときは、ほぼ **Row Level Security (RLS)** で `properties` の SELECT がブロックされています。

**対処（Supabase クラウド）:**

1. [Supabase Dashboard](https://supabase.com/dashboard) を開く
2. 左メニュー **SQL Editor** → **New query**
3. 以下をそのまま貼り付けて **Run** する

```sql
-- 物件テーブルを誰でも読めるようにする（RLS を無効化）
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
```

4. ブラウザでサイトを再読み込みする

**注意:** 別のマイグレーションやダッシュボード操作で RLS が再度有効になった場合は、上記をもう一度実行してください。

---

## メール確認を無効にする（サインアップ後すぐログイン可能にする）

Supabase のダッシュボードで以下を設定してください。

1. プロジェクトを開く → **Authentication** → **Providers** → **Email**
2. **Confirm email** をオフにする

これでユーザーはメール確認なしでサインインできます。

## お気に入り（Favorites）機能

物件詳細のハートボタンで追加した物件は、Supabase の `user_favorites` テーブルに保存され、Favorites ページで一覧表示されます。

**いいねを押しても Favorites に反映されない場合:** まだ `user_favorites` テーブルが作成されていません。Supabase Dashboard → **SQL Editor** で **New query** を開き、`supabase/migrations/add_user_favorites.sql` の**ファイルの中身をすべて**コピーして貼り付け、**Run** してください。実行後、物件ページでもう一度ハートを押すと Favorites に追加されます。

## Check Availability and Request Property Details（物件詳細のメール送信）

物件詳細の「Check Availability and Request Property Details」で入力された**名前・メール・どの物件か**は `property_inquiries` テーブルに保存されます。

**まだテーブルがない場合:** Supabase Dashboard → **SQL Editor** → **New query** を開き、下の SQL を**すべて**コピーして貼り付け、**Run** してください。

```sql
-- property_inquiries テーブルを作成（名前・メール・物件を保存）
CREATE TABLE IF NOT EXISTS public.property_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  property_id bigint NOT NULL,
  property_title text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_inquiries_property_id_idx ON public.property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS property_inquiries_email_idx ON public.property_inquiries(email);

ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert property inquiries" ON public.property_inquiries;
CREATE POLICY "Allow insert property inquiries"
  ON public.property_inquiries FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read property inquiries for authenticated" ON public.property_inquiries;
CREATE POLICY "Allow read property inquiries for authenticated"
  ON public.property_inquiries FOR SELECT TO authenticated USING (true);
```

実行後、Table Editor に **property_inquiries** が表示され、Check Availability で送信したデータが保存されます。

---

## Room tour・資料請求時のメール送信（客と管理者に送る）

**Request a Tour** または **Check Availability and Request Property Details** 送信時に、**お客様**（確認メール）と**管理者（あなた）**（通知メール）にメールを送るには、Supabase Edge Function と Resend を設定します。

---

### Supabase でメールを送る方法（手順まとめ）

**流れ:** お客様がフォーム送信 → サイトが Supabase の Edge Function を呼ぶ → Function が Resend API でメール送信 → お客様と管理者に届く。

| 順番 | やること | どこで |
|------|----------|--------|
| 1 | Resend でアカウント作成・API キー発行 | [resend.com](https://resend.com) |
| 2 | Supabase に「Edge Function」をデプロイ | 自分のPCのターミナル |
| 3 | Supabase に「シークレット」を登録 | Supabase Dashboard |

**1. Resend の準備**

- [Resend](https://resend.com) にアクセス → サインアップ
- 左メニュー **API Keys** → **Create API Key** でキーを発行し、**コピー**（あとで使う）
- 送信元ドメインは未検証でも可（その場合は `onboarding@resend.dev` から送信）

**2. Edge Function のデプロイ（ターミナルで）**

プロジェクトのフォルダで以下を実行。初回だけ「ログイン」と「リンク」が必要。

```bash
cd "c:\Users\user\Dropbox\My PC (DESKTOP-Q5M3N18)\Desktop\Premium Real Estate Website"

# 初回のみ: ログイン（ブラウザが開く）またはトークンを使う
# トークンを使う場合: https://supabase.com/dashboard/account/tokens で発行し、
set SUPABASE_ACCESS_TOKEN=あなたのトークン

# 初回のみ: プロジェクトをリンク（プロジェクトIDは Dashboard → Settings → General の Reference ID）
npx supabase link --project-ref プロジェクトID

# デプロイ（毎回この1行でOK）
npx supabase functions deploy send-request-emails --no-verify-jwt
```

**3. シークレットの設定（Supabase Dashboard で）**

1. [Supabase Dashboard](https://supabase.com/dashboard) を開く
2. 対象プロジェクトをクリック
3. 左メニュー **Project Settings**（歯車アイコン）
4. 左の **Edge Functions** をクリック
5. **Secrets** タブを開く
6. **Add new secret** で次の2つを追加して **Save**:
   - **Name:** `RESEND_API_KEY` → **Value:** Resend でコピーした API キー
   - **Name:** `OWNER_EMAIL` → **Value:** 通知を受け取りたいメールアドレス（あなたのアドレス）

ここまでできれば、フォーム送信時にメールが送られます。届かない場合は「4. メールが送られないときの確認」を参照。

---

### 1. Resend の準備（詳細）

1. [Resend](https://resend.com) でアカウント作成
2. **API Keys** で API キーを発行
3. 送信元ドメインを検証（未検証の場合は `onboarding@resend.dev` が送信元になります）

### 2. Edge Function のデプロイとシークレット設定

Supabase CLI でプロジェクトをリンクしたうえで:

```bash
# 未ログインのフォーム（資料請求・Free Consultation）からも呼べるようにする
supabase functions deploy send-request-emails --no-verify-jwt
```

※ `--no-verify-jwt` を付けると、ログインしていないお客様が送るフォームからもメール送信が動きます。付けないと 401 で失敗することがあります。

**Supabase Dashboard** → **Project Settings** → **Edge Functions** で、次のシークレットを設定します。

| シークレット名      | 説明 |
|---------------------|------|
| `RESEND_API_KEY`    | Resend の API キー（必須） |
| `OWNER_EMAIL`       | 管理者（あなた）のメールアドレス。ここに通知が届きます |
| `FROM_EMAIL`        | （任意）送信元。例: `Tokyo Housing <noreply@yourdomain.com>`。未設定時は Resend のデフォルト |

### 3. 動作

- **Room tour** を送信 → お客様のメールに「内見予約を受け付けました」、管理者に「新しい内見予約」が届きます。
- **資料請求** を送信 → お客様に「資料請求を受け付けました」、管理者に「新しい資料請求」が届きます。

メール送信に失敗しても、Room tour / 資料請求の保存はそのまま成功します（送信は非同期で実行されます）。

### 4. メールが送られないときの確認

1. **Edge Function をデプロイしたか**  
   `supabase functions deploy send-request-emails --no-verify-jwt` を実行しているか確認。

2. **シークレットが設定されているか**  
   Dashboard → **Project Settings** → **Edge Functions** → **Secrets** で `RESEND_API_KEY` と `OWNER_EMAIL` が入っているか確認。

3. **ブラウザのコンソール**  
   送信後に F12 → **Console** を開き、`[send-request-emails]` のエラーが出ていないか確認。  
   例: `401` なら JWT 検証で弾かれている → 上記のとおり `--no-verify-jwt` で再デプロイ。

4. **Supabase のログ**  
   Dashboard → **Edge Functions** → **send-request-emails** → **Logs** で、実行エラーや Resend API のエラーが出ていないか確認。

5. **Resend の送信元**  
   ドメイン未検証の場合は送信元が `onboarding@resend.dev` になり、Resend のテスト用アドレスにしか送れない場合があります。本番では Resend でドメインを検証し、`FROM_EMAIL` シークレットでそのドメインのアドレスを指定してください。
