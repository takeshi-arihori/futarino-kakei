package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"futarino-kakei/backend/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// 環境変数からデータベースURLを取得
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// 環境変数が設定されていない場合は設定ファイルから構築
		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
			cfg.Database.User,
			cfg.Database.Password,
			"db", // ホスト名を明示的に "db" に設定
			5432, // ポートを明示的に 5432 に設定
			cfg.Database.DBName,
		)
	}

	// マイグレーションの実行
	if err := runMigrations(dbURL); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	log.Println("Starting server on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("could not start server: %v", err)
	}
}

func runMigrations(dbURL string) error {
	log.Println("Running database migrations...")

	// データベースが利用可能になるまで待機
	// Docker ComposeなどでDBが起動するまでに時間がかかる場合があるため
	maxAttempts := 10
	for i := 0; i < maxAttempts; i++ {
		m, err := migrate.New(
			"file://backend/migrations", // マイグレーションファイルのパス
			dbURL,
		)
		if err == nil {
			// データベースに接続できた場合
			defer m.Close()
			if err := m.Up(); err != nil && err != migrate.ErrNoChange {
				return fmt.Errorf("failed to apply migrations: %w", err)
			}
			log.Println("Database migrations applied successfully.")
			return nil
		}
		log.Printf("Waiting for database to be ready... attempt %d/%d, error: %v", i+1, maxAttempts, err)
		time.Sleep(5 * time.Second) // 5秒待機
	}
	return fmt.Errorf("database not ready after %d attempts", maxAttempts)
}
