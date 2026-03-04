# Supabase

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
