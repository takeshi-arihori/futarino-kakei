package repository

import (
	"context"
	"futarino-kakei/backend/internal/model"
)

// ExpenseRepository は支出のリポジトリインターフェース
type ExpenseRepository interface {
	Create(ctx context.Context, expense *model.Expense) error
	FindByID(ctx context.Context, id uint) (*model.Expense, error)
	FindByUserID(ctx context.Context, userID uint) ([]*model.Expense, error)
	Update(ctx context.Context, expense *model.Expense) error
	Delete(ctx context.Context, id uint) error
}
