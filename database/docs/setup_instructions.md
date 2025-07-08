# Supabaseセットアップ手順

## 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New project」をクリック
3. プロジェクト名を設定（例：futarino-kakei）
4. データベースパスワードを設定
5. リージョンを選択（Asia Pacific (Tokyo) 推奨）
6. 「Create new project」をクリック

## 2. 環境変数の設定

プロジェクト作成後、以下の情報を取得：

1. Settings > API から以下を取得：
   - `Project URL`
   - `anon public` キー
   - `service_role` キー

2. `.env.local` ファイルを作成：

```bash
cp .env.local.example .env.local
```

3. 取得した値を `.env.local` に設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## 3. データベーススキーマの適用

SQL Editorで以下のファイルを順番に実行：

### 3.1 認証テーブル

```sql
-- database/schema/01_auth_tables.sql の内容を実行
```

### 3.2 コアテーブル

```sql
-- database/schema/02_core_tables.sql の内容を実行
```

### 3.3 支出テーブル

```sql
-- database/schema/03_expense_tables.sql の内容を実行
```

### 3.4 RLSポリシー

```sql
-- database/schema/04_rls_policies.sql の内容を実行
```

### 3.5 デフォルトカテゴリ

```sql
-- database/seeds/default_categories.sql の内容を実行
```

## 4. Storage設定

1. Storage > Create a new bucket
2. Name: `receipts`
3. Public bucket: `false`
4. Create bucket

### RLSポリシーの設定（receipts bucket）

```sql
-- レシート画像のアップロード・閲覧ポリシー
CREATE POLICY "Users can upload receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own receipts" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own receipts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 5. OAuth設定

### Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs
3. Application type: Web application
4. Authorized redirect URIs に追加：
   - `http://localhost:3000/api/auth/callback/google` (開発用)
   - `https://your-domain.vercel.app/api/auth/callback/google` (本番用)

### GitHub OAuth設定

1. GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Homepage URL: `http://localhost:3000` (開発用)
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## 6. 動作確認

```bash
npm run dev
```

1. http://localhost:3000 にアクセス
2. 認証フローの確認
3. データベース接続の確認

## 7. トラブルシューティング

### RLS関連エラー

- `auth.uid()` が認識されない場合は、Supabaseのバージョンを確認
- ポリシーが適用されない場合は、テーブルの順序を確認

### NextAuth関連エラー

- `NEXTAUTH_SECRET` が設定されていることを確認
- OAuth providerの設定を確認

### 型エラー

- `npm run type-check` で型チェック実行
- Supabaseの型定義を最新化：`npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts`

## 8. 本番環境設定

### Vercel環境変数

- `NEXTAUTH_URL`: https://your-domain.vercel.app
- `NEXTAUTH_SECRET`: 本番用のシークレット
- `NEXT_PUBLIC_SUPABASE_URL`: 本番Supabaseプロジェクト URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 本番anon key
- `SUPABASE_SERVICE_ROLE_KEY`: 本番service role key
- `GOOGLE_CLIENT_ID`: 本番Google OAuth ID
- `GOOGLE_CLIENT_SECRET`: 本番Google OAuth Secret
