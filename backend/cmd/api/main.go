package main

import (
	"database/sql"
	"fmt"
	"futarino-kakei/backend/internal/config"
	"futarino-kakei/backend/internal/handler"
	"futarino-kakei/backend/internal/repository"
	"futarino-kakei/backend/internal/service"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	// 設定の読み込み
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// データベース接続
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
			cfg.Database.User,
			cfg.Database.Password,
			"db",
			5432,
			cfg.Database.DBName,
		)
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// リポジトリの初期化
	userRepo := repository.NewUserPostgresRepository(db)

	// JWT秘密鍵の設定
	jwtKey := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtKey) == 0 {
		jwtKey = []byte("your-secret-key") // 開発環境用のデフォルト値
	}

	// サービスの初期化
	authService := service.NewAuthService(userRepo, jwtKey)

	// ハンドラーの初期化
	authHandler := handler.NewAuthHandler(authService)

	// Ginルーターの設定
	r := gin.Default()

	// 認証不要のエンドポイント
	r.POST("/api/auth/register", authHandler.Register)
	r.POST("/api/auth/login", authHandler.Login)

	// 認証が必要なエンドポイントグループ
	auth := r.Group("/api")
	auth.Use(authHandler.AuthMiddleware())
	{
		// 認証が必要なエンドポイントをここに追加
		auth.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status": "ok",
				"user": gin.H{
					"id":    c.GetInt64("user_id"),
					"email": c.GetString("email"),
				},
			})
		})
	}

	// サーバーの起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
