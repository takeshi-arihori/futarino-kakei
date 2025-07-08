# カップル・夫婦専用家計アプリ「ふたりの家計」

## プロジェクト概要

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

## データベーススキーマ

### NextAuthユーザー情報

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### カップル関係

```sql
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id TEXT REFERENCES users(id),
  user2_id TEXT REFERENCES users(id),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 支出記録

```sql
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
```

### 精算記録

```sql
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
```

## プロジェクト構造

```
futarino-kakei/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── expenses/          # 支出管理
│   │   ├── settlements/       # 精算管理
│   │   └── settings/          # 設定
│   ├── components/            # Reactコンポーネント
│   │   ├── ui/               # 基本UIコンポーネント
│   │   ├── auth/             # 認証関連
│   │   ├── expense/          # 支出関連
│   │   └── settlement/       # 精算関連
│   ├── lib/                  # ユーティリティ
│   │   ├── auth.ts           # NextAuth設定
│   │   ├── supabase.ts       # Supabaseクライアント
│   │   └── utils.ts          # 汎用ユーティリティ
│   ├── hooks/                # カスタムHooks
│   └── types/                # TypeScript型定義
├── public/                   # 静的ファイル
├── .env.local.example        # 環境変数テンプレート
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── eslint.config.mjs
```

## 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# アクセス
http://localhost:3000
```

## 環境変数

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
```

## 開発ワークフロー

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

## コミット規約

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

## 開発状況

🚧 開発中（v0.1.0）

## 現在の実装状況

- ✅ Next.js 15プロジェクトの基本構造完成
- ✅ TypeScript、Tailwind CSS、ESLint・Prettier設定完了
- ✅ 基本的なフォルダ構造とユーティリティ関数作成
- ✅ 環境変数テンプレート作成
- ✅ 開発サーバーの動作確認完了
- 🚧 Supabaseの設定とデータベース作成（次のタスク）
- 🚧 NextAuth.js v5の設定（次のタスク）
- 🚧 認証システムの実装（次のタスク）

## 次の開発タスク

1. ✅ Next.js 15プロジェクトの初期化（完了）
2. Supabaseプロジェクト作成とデータベーススキーマ構築
3. NextAuth.js v5とSupabase認証の設定
4. カップル招待システムの実装
5. レイアウトコンポーネントとUIシステムの実装
6. 支出管理機能の実装
7. 精算機能の実装
8. リアルタイム同期の実装
