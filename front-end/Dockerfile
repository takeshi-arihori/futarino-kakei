# Node.js 18のベースイメージを使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# システムの依存関係をインストール
RUN apk add --no-cache libc6-compat

# pnpmを有効化
RUN corepack enable pnpm

# パッケージファイルをコピー
COPY package.json pnpm-lock.yaml* ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# アプリケーションファイルをコピー
COPY . .

# ポートを公開
EXPOSE 3000

# 環境変数を設定
ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH

# 開発サーバーを起動
CMD ["npx", "next", "dev", "--turbopack", "--hostname", "0.0.0.0"] 
