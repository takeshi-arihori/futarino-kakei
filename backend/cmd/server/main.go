package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// プロジェクトルートの .env を読み込む
	if err := godotenv.Load("../.env"); err != nil {
		log.Println(".env file not found or could not be loaded")
	}

	// 例: 環境変数の利用
	dbURL := os.Getenv("DATABASE_URL")
	log.Println("DATABASE_URL:", dbURL)

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	log.Println("Starting server on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("could not start server: %v", err)
	}
}
