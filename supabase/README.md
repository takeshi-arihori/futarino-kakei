# Supabaseセットアップガイド

## 概要

このディレクトリには、「ふたりの家計」アプリケーションのSupabaseデータベース設定ファイルが含まれています。

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト名: `futarino-kakei`
4. データベースパスワードを設定（安全なパスワードを使用）

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth設定（Google例）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. データベーススキーマの適用

SupabaseダッシュボードのSQL Editorで `schema.sql` ファイルの内容を実行：

1. Supabaseダッシュボードにログイン
2. 左サイドバーから「SQL Editor」を選択
3. `schema.sql` ファイルの内容をコピー&ペースト
4. 「Run」ボタンをクリックして実行

### 4. Row Level Security (RLS) の確認

スキーマ実行後、以下のテーブルでRLSが有効になっていることを確認：

- `users`
- `couples`
- `categories`
- `expenses`
- `settlements`
- `settlement_expenses`
- `notifications`
- `notification_settings`

### 5. リアルタイム機能の有効化

Database → Replication セクションで以下のテーブルのリアルタイム更新を有効化：

- `expenses`
- `settlements`
- `notifications`

### 6. 認証設定

Authentication → Settings で以下を設定：

#### Site URL設定
- Site URL: `http://localhost:3000` (開発時)
- Site URL: `https://your-domain.com` (本番時)

#### Redirect URLs設定
- `http://localhost:3000/api/auth/callback/google`
- `https://your-domain.com/api/auth/callback/google`

#### OAuth Providers設定
GoogleやGitHubなどのOAuthプロバイダーを設定：

1. Authentication → Providers
2. 使用したいプロバイダーを有効化
3. Client IDとClient Secretを設定

## データベース構造

### 主要テーブル

#### users
NextAuth.js用のユーザー情報

#### couples
カップル関係の管理

#### categories
支出カテゴリの管理（デフォルト7個 + カスタム）

#### expenses
支出記録

#### settlements
精算記録

#### settlement_expenses
精算と支出の関連テーブル

#### notifications
通知管理

#### notification_settings
ユーザーごとの通知設定

### 自動機能

#### トリガー
- カップル作成時にデフォルトカテゴリを自動作成
- ユーザー作成時にデフォルト通知設定を作成
- 精算完了時に関連する支出を精算済みに更新

#### RLS (Row Level Security)
- ユーザーは自分のカップル関係のデータのみアクセス可能
- 適切な権限チェックを自動実行

## 開発時の注意事項

### データベース接続の確認

```bash
npm run dev
```

アプリケーション起動時にSupabase接続エラーが出ないことを確認。

### 初期データの投入

開発時は以下のSQLでテストデータを投入できます：

```sql
-- テストユーザーの作成例（実際の認証後にNextAuth.jsが自動作成）
INSERT INTO users (id, name, email) VALUES 
  ('user1', 'テストユーザー1', 'user1@example.com'),
  ('user2', 'テストユーザー2', 'user2@example.com');

-- テストカップルの作成例
INSERT INTO couples (user1_id, user2_id, name) VALUES 
  ('user1', 'user2', 'テストカップル');
```

## 本番環境への移行

### 環境変数の更新
本番環境では `.env.local` の代わりに `.env.production` を使用し、本番用のSupabase URLとキーを設定。

### セキュリティ設定
- RLSポリシーの再確認
- Service Role Keyの適切な管理
- CORS設定の確認

### バックアップ設定
- 自動バックアップの有効化
- Point-in-time recoveryの設定

## トラブルシューティング

### よくあるエラー

#### 「認証が必要です」エラー
- NextAuth設定の確認
- Supabase認証設定の確認
- 環境変数の確認

#### 「カップル関係が見つかりません」エラー
- ユーザーがカップル関係に登録されているか確認
- couplesテーブルのデータを確認

#### 「アクセス権限がありません」エラー
- RLSポリシーの設定確認
- ユーザーのカップル関係の確認

### ログの確認方法

Supabaseダッシュボード → Logs で以下を確認：
- Database logs
- Auth logs
- API logs

## サポート

問題が発生した場合は以下をチェック：

1. [Supabase公式ドキュメント](https://supabase.com/docs)
2. [NextAuth.js公式ドキュメント](https://next-auth.js.org)
3. GitHubリポジトリのIssues