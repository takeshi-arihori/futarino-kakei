# Backend

## データベースマイグレーション

### 前提条件
- `.env`ファイルに以下の環境変数が設定されていること
  ```
  DATABASE_URL=postgres://root:password@localhost:5432/futarino_kakei_db?sslmode=disable
  PORT=8080
  ENV=development
  ```

### マイグレーションコマンド

1. マイグレーションの実行（全て）
```bash
make migrate-up
```

2. 特定のステップ数だけマイグレーションを実行
```bash
make migrate-up steps=1
```

3. マイグレーションのロールバック（全て）
```bash
make migrate-down
```

4. 特定のステップ数だけロールバック
```bash
make migrate-down steps=1
```

5. マイグレーションバージョンの強制設定（エラー時の復旧用）
```bash
make migrate-force version=1
```

### マイグレーションファイル

- `migrations/000001_create_initial_tables.up.sql`: テーブル作成
  - `couples`: カップル情報
  - `users`: ユーザー情報
  - `categories`: カテゴリ情報
  - `expenses`: 支出情報
  - `budgets`: 予算情報
  - `settlements`: 精算情報
  - `settlement_expenses`: 精算と支出の関連情報

- `migrations/000001_create_initial_tables.down.sql`: テーブル削除

### 注意事項
- マイグレーションを実行する前に、必ずデータベースが起動していることを確認してください。
- 本番環境でのロールバックは慎重に行ってください。
- スキーマの変更は、必ず新しいマイグレーションファイルを作成して対応してください。 
