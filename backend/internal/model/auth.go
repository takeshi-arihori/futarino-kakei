package model

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// RegisterRequest ユーザー登録リクエストの構造体
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required"`
}

// LoginRequest ログインリクエストの構造体
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse ログインレスポンスの構造体
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// AuthResponse 認証レスポンスの構造体
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// User ユーザー情報の構造体
type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	PasswordHash string    `json:"-"` // レスポンスには含めない
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Claims JWTクレームの構造体
type Claims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}
