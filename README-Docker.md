# ふたりの家計 - Docker環境セットアップ

## 概要
このプロジェクトはDocker Composeを使用してフロントエンド（Next.js）、バックエンド（Laravel）、データベース（MySQL）を統合した開発環境を提供します。

## 前提条件
- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること

## 起動手順

### 1. プロジェクトのクローン
```bash
git clone <repository-url>
cd futarino-kakei
```

### 2. Docker環境の起動
```bash
# すべてのサービスを起動
docker-compose up -d

# ログを確認する場合
docker-compose up
```

### 3. アクセス確認
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost/api
- **Nginx（リバースプロキシ）**: http://localhost
- **MySQL**: localhost:3306

## サービス構成

### フロントエンド (Next.js)
- **ポート**: 3000
- **コンテナ名**: futarino-kakei-frontend-1
- **開発サーバー**: `pnpm dev`

### バックエンド (Laravel)
- **ポート**: 8000
- **コンテナ名**: futarino-kakei-backend-1
- **開発サーバー**: `php artisan serve`
- **自動実行**:
  - データベースマイグレーション
  - テストユーザーの作成

### データベース (MySQL)
- **ポート**: 3306
- **データベース名**: futarino_kakei
- **ユーザー**: user
- **パスワード**: password
- **ルートパスワード**: root_password

### Nginx (リバースプロキシ)
- **ポート**: 80
- **機能**:
  - フロントエンドへのプロキシ（/）
  - バックエンドAPIへのプロキシ（/api/）
  - CORS設定

## テストユーザー
初回起動時に以下のテストユーザーが自動作成されます：

1. **ユーザー1**
   - メール: taro@example.com
   - パスワード: password123
   - 名前: 田中太郎

2. **ユーザー2**
   - メール: hanako@example.com
   - パスワード: password123
   - 名前: 田中花子

## 開発用コマンド

### ログの確認
```bash
# すべてのサービスのログ
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mysql
```

### コンテナ内でのコマンド実行
```bash
# バックエンドコンテナ内でLaravelコマンド実行
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan tinker

# フロントエンドコンテナ内でコマンド実行
docker-compose exec frontend pnpm install
docker-compose exec frontend pnpm build
```

### データベース操作
```bash
# MySQLコンテナに接続
docker-compose exec mysql mysql -u user -p futarino_kakei

# データベースのリセット
docker-compose exec backend php artisan migrate:fresh --seed
```

## 環境の停止・削除

### サービスの停止
```bash
docker-compose down
```

### データも含めて完全削除
```bash
docker-compose down -v
docker system prune -a
```

## トラブルシューティング

### ポートが既に使用されている場合
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :8000
lsof -i :80
lsof -i :3306

# プロセスを停止してから再起動
docker-compose down
docker-compose up -d
```

### データベース接続エラー
```bash
# MySQLコンテナの状態確認
docker-compose ps mysql
docker-compose logs mysql

# バックエンドコンテナでデータベース接続テスト
docker-compose exec backend php artisan migrate:status
```

### フロントエンドのビルドエラー
```bash
# node_modulesを再インストール
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend pnpm install

# コンテナを再ビルド
docker-compose build frontend
docker-compose up -d frontend
```

## 開発時の注意事項

1. **ホットリロード**: フロントエンドはファイル変更時に自動でリロードされます
2. **データベース**: データはDockerボリュームに永続化されます
3. **ログ**: 各サービスのログは`docker-compose logs`で確認できます
4. **環境変数**: バックエンドの環境設定は`.env.docker`ファイルで管理されます

## API仕様

### 認証エンドポイント
- `POST /api/login` - ログイン
- `POST /api/register` - ユーザー登録
- `POST /api/logout` - ログアウト
- `GET /api/user` - 認証済みユーザー情報取得

### レスポンス形式
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // レスポンスデータ
  }
}
```

## 本番環境への移行
本番環境では以下の変更が必要です：
1. 環境変数の設定（APP_ENV=production）
2. HTTPSの設定
3. データベースの設定変更
4. セキュリティ設定の強化 




