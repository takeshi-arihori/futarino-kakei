package main

import (
	"database/sql"
	"futarino-kakei/backend/internal/handler"
	"futarino-kakei/backend/internal/repository"
	"futarino-kakei/backend/internal/service"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found or could not be loaded")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://root:password@db:5432/futarino_kakei_db?sslmode=disable"
	}
	log.Printf("DATABASE_URL: %s\n", dbURL)

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	jwtKey := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtKey) == 0 {
		jwtKey = []byte("your-secret-key")
	}

	// リポジトリの初期化
	userRepo := repository.NewUserPostgresRepository(db)
	expenseRepo := repository.NewExpensePostgresRepository(db)
	settlementRepo := repository.NewSettlementPostgres(db)

	// サービスの初期化
	authService := service.NewAuthService(userRepo, jwtKey)
	expenseService := service.NewExpenseService(expenseRepo)
	settlementService := service.NewSettlementService(settlementRepo)

	// ハンドラーの初期化
	authHandler := handler.NewAuthHandler(authService)
	expenseHandler := handler.NewExpenseHandler(expenseService)
	settlementHandler := handler.NewSettlementHandler(settlementService)

	r := gin.Default()

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Auth routes
	r.POST("/api/register", authHandler.Register)
	r.POST("/api/login", authHandler.Login)

	// 認証が必要なルートグループ
	authorized := r.Group("/api")
	authorized.Use(authHandler.AuthMiddleware())
	{
		// 支出のルート
		authorized.POST("/expenses", expenseHandler.CreateExpense)
		authorized.GET("/expenses", expenseHandler.GetUserExpenses)
		authorized.GET("/expenses/:id", expenseHandler.GetExpense)
		authorized.PUT("/expenses/:id", expenseHandler.UpdateExpense)
		authorized.DELETE("/expenses/:id", expenseHandler.DeleteExpense)

		// 精算のルート
		settlementHandler.RegisterRoutes(authorized)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting server on :%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
