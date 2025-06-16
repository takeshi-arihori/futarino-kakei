package main

import (
	"log"
	"net/http"

	"futarino-kakei/backend/internal/config"
	"github.com/gin-gonic/gin"
)

func main() {
	if _, err := config.LoadConfig(); err != nil {
		log.Fatalf("failed to load config: %v", err)
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
