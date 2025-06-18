package service

import (
	"context"
	"futarino-kakei/backend/internal/model"
	"futarino-kakei/backend/internal/repository"
)

// ExpenseServiceInterface は支出サービスのインターフェース
type ExpenseServiceInterface interface {
	CreateExpense(ctx context.Context, userID uint, req *model.ExpenseCreate) (*model.Expense, error)
	GetExpense(ctx context.Context, id uint) (*model.Expense, error)
	GetUserExpenses(ctx context.Context, userID uint) ([]*model.Expense, error)
	UpdateExpense(ctx context.Context, id uint, req *model.ExpenseUpdate) (*model.Expense, error)
	DeleteExpense(ctx context.Context, id uint) error
}

// ExpenseService は支出のサービス
type ExpenseService struct {
	expenseRepo repository.ExpenseRepository
}

// NewExpenseService は新しいExpenseServiceを作成
func NewExpenseService(expenseRepo repository.ExpenseRepository) *ExpenseService {
	return &ExpenseService{expenseRepo: expenseRepo}
}

// CreateExpense は新しい支出を作成
func (s *ExpenseService) CreateExpense(ctx context.Context, userID uint, req *model.ExpenseCreate) (*model.Expense, error) {
	expense := &model.Expense{
		UserID:      userID,
		Amount:      req.Amount,
		Category:    req.Category,
		Description: req.Description,
		Date:        req.Date,
	}

	if err := s.expenseRepo.Create(ctx, expense); err != nil {
		return nil, err
	}

	return expense, nil
}

// GetExpense は支出を取得
func (s *ExpenseService) GetExpense(ctx context.Context, id uint) (*model.Expense, error) {
	return s.expenseRepo.FindByID(ctx, id)
}

// GetUserExpenses はユーザーの支出一覧を取得
func (s *ExpenseService) GetUserExpenses(ctx context.Context, userID uint) ([]*model.Expense, error) {
	return s.expenseRepo.FindByUserID(ctx, userID)
}

// UpdateExpense は支出を更新
func (s *ExpenseService) UpdateExpense(ctx context.Context, id uint, req *model.ExpenseUpdate) (*model.Expense, error) {
	expense, err := s.expenseRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// 更新するフィールドのみ変更
	if req.Amount != 0 {
		expense.Amount = req.Amount
	}
	if req.Category != "" {
		expense.Category = req.Category
	}
	if req.Description != "" {
		expense.Description = req.Description
	}
	if !req.Date.IsZero() {
		expense.Date = req.Date
	}

	if err := s.expenseRepo.Update(ctx, expense); err != nil {
		return nil, err
	}

	return expense, nil
}

// DeleteExpense は支出を削除
func (s *ExpenseService) DeleteExpense(ctx context.Context, id uint) error {
	return s.expenseRepo.Delete(ctx, id)
}
