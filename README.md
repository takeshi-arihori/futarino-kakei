# カップル・夫婦専用家計アプリ「ふたりの家計」

## 概要
カップル・夫婦が共同で家計管理を行うためのWebアプリケーションです。日々の支出の記録から、面倒な精算までをスマートに解決することを目指します。

## 技術スタック
このプロジェクトは、以下の技術スタックで構築されています。

- **フロントエンド**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **バックエンド**: Go (net/http), PostgreSQL
- **開発環境**: Docker, Docker Compose

## 開発環境セットアップ

#### 前提条件
- Docker Desktopがインストールされ、実行中であること
- Gitがインストールされていること

#### 手順
1.  **リポジトリをクローン**
    ```bash
    git clone https://github.com/takeshi-arihori/futarino-kakei.git
    cd futarino-kakei
    ```

2.  **Dockerコンテナのビルドと起動**
    ```bash
    docker-compose up --build
    ```
    初回起動時は、Dockerイメージのダウンロードとビルドに時間がかかる場合があります。

3.  **アプリケーションへのアクセス**
    - **フロントエンド**: [http://localhost:3000](http://localhost:3000)
    - **バックエンドAPI**: [http://localhost:8080](http://localhost:8080)

## プロジェクト構造
```
futarino-kakei/
├── backend/              # Go バックエンド
│   ├── cmd/server/main.go
│   ├── go.mod
│   └── Dockerfile
├── frontend/             # Next.js フロントエンド
│   ├── src/
│   │   └── app/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── devlog/               # 開発資料・ログ
│   ├── ai_project_guidelines.md
│   ├── db_schema.pu
│   └── daily/
├── docker-compose.yml    # Docker環境設定
├── DEVELOPMENT_PLAN.md   # 開発計画書
└── README.md             # このファイル
```

## 開発計画
詳細な開発フェーズやタスクについては、[`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) を参照してください。

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。
