# カップル・夫婦専用家計アプリ「ふたりの家計」

## 概要
カップル・夫婦が共同で家計管理を行うためのWebアプリケーションです。日々の支出の記録から、面倒な精算までをスマートに解決することを目指します。

## 技術スタック
- **フロントエンド**: Next.js 15+ (App Router), TypeScript, Tailwind CSS
- **認証**: NextAuth.js v5 (Auth.js)
- **データベース**: Supabase (PostgreSQL, Realtime)
- **デプロイ**: Vercel
- **開発環境**: Node.js 20+

## 主要機能
- **認証システム**: NextAuth.js v5による安全なユーザー認証（OAuth、Magic Link対応）
- **支出管理**: 支出の登録・編集・削除、カテゴリ分類
- **精算機能**: 自動的な支出分担計算と精算履歴
- **リアルタイム同期**: Supabase Realtimeによるパートナー間でのデータ同期
- **レスポンシブデザイン**: モバイル・デスクトップ対応

## 開発環境セットアップ

### 前提条件
- Node.js 20以上
- npm または yarn
- Supabaseアカウント
- Vercelアカウント（デプロイ用）

### セットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/takeshi-arihori/futarino-kakei.git
   cd futarino-kakei
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   ```bash
   cp .env.local.example .env.local
   ```
   
   `.env.local`に以下の値を設定：
   ```env
   # NextAuth設定
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Supabase設定
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OAuth Provider設定（例：Google）
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # GitHub OAuth（オプション）
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

5. **アプリケーションへのアクセス**
   http://localhost:3000 でアプリケーションにアクセスできます。

## Supabaseセットアップ

### データベーススキーマ

```sql
-- NextAuthユーザー情報（NextAuth用カスタムテーブル）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NextAuth用アカウントテーブル
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- NextAuth用セッションテーブル
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- カップル関係
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id TEXT REFERENCES users(id),
  user2_id TEXT REFERENCES users(id),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支出記録
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id),
  user_id TEXT REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  category TEXT,
  date DATE NOT NULL,
  is_settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 精算記録
CREATE TABLE settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id),
  from_user_id TEXT REFERENCES users(id),
  to_user_id TEXT REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE,
  period_end DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX accounts_user_id_idx ON accounts(user_id);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_session_token_idx ON sessions(session_token);
```

### Row Level Security (RLS) 設定

```sql
-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Couples
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own couple data" ON couples FOR SELECT USING (
  user1_id = current_setting('request.jwt.claims', true)::json->>'sub' OR 
  user2_id = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view couple expenses" ON expenses FOR SELECT USING (
  couple_id IN (
    SELECT id FROM couples 
    WHERE user1_id = current_setting('request.jwt.claims', true)::json->>'sub' 
       OR user2_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);
```

## プロジェクト構造

```
futarino-kakei/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # ダッシュボード
│   ├── expenses/          # 支出管理
│   ├── settlements/       # 精算管理
│   └── settings/          # 設定
├── components/            # Reactコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── auth/             # 認証関連
│   ├── expense/          # 支出関連
│   └── settlement/       # 精算関連
├── lib/                  # ユーティリティ
│   ├── auth.ts           # NextAuth設定
│   ├── supabase.ts       # Supabaseクライアント
│   └── utils.ts          # 汎用ユーティリティ
├── hooks/                # カスタムHooks
├── types/                # TypeScript型定義
└── public/               # 静的ファイル
```

## 開発ワークフロー

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

### コミット規約
Conventional Commitsに従ってください：
```
feat: 新機能
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他の作業
```

## デプロイ

### Vercelへのデプロイ
1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. 自動デプロイが実行されます

### Vercel環境変数設定
本番環境では以下の環境変数をVercelダッシュボードで設定：

```env
# NextAuth設定
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_nextauth_secret

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# OAuth Provider設定
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
```

## 機能要件

### 認証機能
- ユーザー登録・ログイン
- パスワードリセット
- ソーシャルログイン（Google, GitHub）

### 支出管理機能
- 支出の登録・編集・削除
- カテゴリ別分類
- 日付・金額・メモの記録
- 画像添付（レシート等）

### 精算機能
- 期間指定での精算計算
- 分担比率設定（50:50, 60:40等）
- 精算履歴管理
- 精算状況の可視化

### リアルタイム機能
- パートナー間でのデータ同期
- 新しい支出の即座な反映
- 精算通知

## テスト

```bash
# 単体テスト実行
npm run test

# E2Eテスト実行
npm run test:e2e

# テストカバレッジ確認
npm run test:coverage
```

## 貢献
プルリクエストを歓迎します。大きな変更を行う場合は、まずIssueを作成して議論してください。

---

**開発状況**: 🚧 開発中  
**バージョン**: v0.1.0  
**最終更新**: 2025年1月
