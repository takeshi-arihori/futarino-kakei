# データベース接続問題の解決記録

## 発生した問題

バックエンドアプリケーションからPostgreSQLデータベースへの接続ができず、以下のようなエラーログが出力されていました。

```
2025/06/16 15:07:20 Running database migrations...
2025/06/16 15:07:20 Waiting for database to be ready... attempt 1/10, error: failed to open database: dial tcp 172.18.0.2:5432: connect: connection refused
2025/06/16 15:07:25 Waiting for database to be ready... attempt 2/10, error: failed to open database: pq: password authentication failed for user "root"
```

また、PostgreSQLコンテナのログには以下のようなエラーが繰り返し出力されていました。

```
FATAL: password authentication failed for user "root"
DETAIL: Connection matched file "/var/lib/postgresql/data/pg_hba.conf" line 128: "host all all all scram-sha-256"
```

## 原因

1. `compose.yaml`ファイル内の`DATABASE_URL`環境変数がクォーテーションで囲まれていたため、バックエンドアプリケーションがクォーテーションも含めた値を解釈しようとしていた

```yaml
# 問題のあった記述
environment:
  - DATABASE_URL="postgres://root:password@db:5432/futarino_kakei_db?sslmode=disable"
```

2. バックエンドアプリケーションが環境変数`DATABASE_URL`を直接使用せず、設定ファイルからのみデータベース接続情報を構築していた

## 解決策

1. `compose.yaml`ファイル内の`DATABASE_URL`環境変数からクォーテーションを削除

```yaml
# 修正後の記述
environment:
  - DATABASE_URL=postgres://root:password@db:5432/futarino_kakei_db?sslmode=disable
```

2. バックエンドアプリケーションで環境変数`DATABASE_URL`を直接使用するように`main.go`を修正

```go
// 環境変数からデータベースURLを取得
dbURL := os.Getenv("DATABASE_URL")
if dbURL == "" {
  // 環境変数が設定されていない場合は設定ファイルから構築
  dbURL = fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
    cfg.Database.User,
    cfg.Database.Password,
    "db",
    5432,
    cfg.Database.DBName,
  )
}
```

## 確認方法

1. 修正後、コンテナを再ビルド・再起動
2. バックエンドログの確認
   ```
   2025/06/16 15:09:31 Running database migrations...
   2025/06/16 15:09:31 Database migrations applied successfully.
   ```
3. ヘルスチェックエンドポイントへのアクセス確認
   ```
   $ curl localhost:8081/health
   {"status":"ok"}
   ```
4. データベースのテーブル確認
   ```
   $ docker exec -it futarino-kakei-db psql -U root -d futarino_kakei_db -c "\dt"
   ```

## 学んだこと

1. Docker Composeの環境変数設定ではクォーテーションを使用しない
2. 環境変数を優先的に使用し、フォールバックとして設定ファイルを使用する設計パターンの有用性
3. データベース接続問題のデバッグには、コンテナログとデータベースへの直接アクセスが効果的 
