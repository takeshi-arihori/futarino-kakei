#!/bin/bash
set -e

# データベース接続を待機
echo "Waiting for MySQL to be ready..."
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; do
    sleep 1
done

echo "MySQL is ready!"

# マイグレーションを実行
echo "Running migrations..."
php artisan migrate --force

# シーダーを実行（初回のみ）
if [ ! -f /var/www/html/storage/seeded ]; then
    echo "Running seeders..."
    php artisan db:seed --class=UserSeeder --force
    touch /var/www/html/storage/seeded
fi

# キャッシュをクリア
php artisan config:cache
php artisan route:cache

echo "Starting Laravel development server..."
exec "$@" 
