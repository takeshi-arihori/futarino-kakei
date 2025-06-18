package model

import (
	"time"
)

// Expense は支出を表すモデル
type Expense struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"not null"`
	Amount      int       `json:"amount" gorm:"not null"`
	Category    string    `json:"category" gorm:"not null"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ExpenseCreate は支出作成時のリクエストボディ
type ExpenseCreate struct {
	Amount      int       `json:"amount" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" binding:"required"`
}

// ExpenseUpdate は支出更新時のリクエストボディ
type ExpenseUpdate struct {
	Amount      int       `json:"amount"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
}
