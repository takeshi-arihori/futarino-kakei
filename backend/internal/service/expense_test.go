package service

import (
	"context"
	"database/sql"
	"futarino-kakei/backend/internal/model"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockExpenseRepository はExpenseRepositoryのモック
type MockExpenseRepository struct {
	mock.Mock
}

func (m *MockExpenseRepository) Create(ctx context.Context, expense *model.Expense) error {
	args := m.Called(ctx, expense)
	return args.Error(0)
}

func (m *MockExpenseRepository) FindByID(ctx context.Context, id uint) (*model.Expense, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Expense), args.Error(1)
}

func (m *MockExpenseRepository) FindByUserID(ctx context.Context, userID uint) ([]*model.Expense, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Expense), args.Error(1)
}

func (m *MockExpenseRepository) Update(ctx context.Context, expense *model.Expense) error {
	args := m.Called(ctx, expense)
	return args.Error(0)
}

func (m *MockExpenseRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestExpenseService_CreateExpense(t *testing.T) {
	mockRepo := new(MockExpenseRepository)
	service := NewExpenseService(mockRepo)

	req := &model.ExpenseCreate{
		Amount:      1000,
		Category:    "食費",
		Description: "昼食",
		Date:        time.Now(),
	}

	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.Expense")).Return(nil).Run(func(args mock.Arguments) {
		expense := args.Get(1).(*model.Expense)
		expense.ID = 1
		expense.CreatedAt = time.Now()
		expense.UpdatedAt = time.Now()
	})

	result, err := service.CreateExpense(context.Background(), 1, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, uint(1), result.UserID)
	assert.Equal(t, req.Amount, result.Amount)
	assert.Equal(t, req.Category, result.Category)
	assert.Equal(t, req.Description, result.Description)
	mockRepo.AssertExpectations(t)
}

func TestExpenseService_GetExpense(t *testing.T) {
	mockRepo := new(MockExpenseRepository)
	service := NewExpenseService(mockRepo)

	expectedExpense := &model.Expense{
		ID:          1,
		UserID:      1,
		Amount:      1000,
		Category:    "食費",
		Description: "昼食",
		Date:        time.Now(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(expectedExpense, nil)

	result, err := service.GetExpense(context.Background(), 1)

	assert.NoError(t, err)
	assert.Equal(t, expectedExpense, result)
	mockRepo.AssertExpectations(t)
}

func TestExpenseService_GetExpense_NotFound(t *testing.T) {
	mockRepo := new(MockExpenseRepository)
	service := NewExpenseService(mockRepo)

	mockRepo.On("FindByID", mock.Anything, uint(999)).Return(nil, sql.ErrNoRows)

	result, err := service.GetExpense(context.Background(), 999)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, sql.ErrNoRows, err)
	mockRepo.AssertExpectations(t)
}

func TestExpenseService_GetUserExpenses(t *testing.T) {
	mockRepo := new(MockExpenseRepository)
	service := NewExpenseService(mockRepo)

	expectedExpenses := []*model.Expense{
		{
			ID:          1,
			UserID:      1,
			Amount:      1000,
			Category:    "食費",
			Description: "昼食",
			Date:        time.Now(),
		},
		{
			ID:          2,
			UserID:      1,
			Amount:      500,
			Category:    "交通費",
			Description: "電車代",
			Date:        time.Now(),
		},
	}

	mockRepo.On("FindByUserID", mock.Anything, uint(1)).Return(expectedExpenses, nil)

	result, err := service.GetUserExpenses(context.Background(), 1)

	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, expectedExpenses, result)
	mockRepo.AssertExpectations(t)
}

func TestExpenseService_UpdateExpense(t *testing.T) {
	mockRepo := new(MockExpenseRepository)
	service := NewExpenseService(mockRepo)

	existingExpense := &model.Expense{
		ID:          1,
		UserID:      1,
		Amount:      1000,
		Category:    "食費",
		Description: "昼食",
		Date:        time.Now(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	updateReq := &model.ExpenseUpdate{
		Amount:      1500,
		Category:    "食費",
		Description: "夕食",
		Date:        time.Now(),
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingExpense, nil)
	mockRepo.On("Update", mock.Anything, mock.AnythingOfType("*model.Expense")).Return(nil)

	result, err := service.UpdateExpense(context.Background(), 1, updateReq)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, updateReq.Amount, result.Amount)
	assert.Equal(t, updateReq.Category, result.Category)
	assert.Equal(t, updateReq.Description, result.Description)
	mockRepo.AssertExpectations(t)
}

func TestExpenseService_UpdateExpense_PartialUpdate(t *testing.T) {
	mockRepo := new(MockExpenseRepository)
	service := NewExpenseService(mockRepo)

	existingExpense := &model.Expense{
		ID:          1,
		UserID:      1,
		Amount:      1000,
		Category:    "食費",
		Description: "昼食",
		Date:        time.Now(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	updateReq := &model.ExpenseUpdate{
		Amount: 1500, // 金額のみ更新
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingExpense, nil)
	mockRepo.On("Update", mock.Anything, mock.AnythingOfType("*model.Expense")).Return(nil)

	result, err := service.UpdateExpense(context.Background(), 1, updateReq)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, updateReq.Amount, result.Amount)
	// 他のフィールドは変更されない
	assert.Equal(t, existingExpense.Category, result.Category)
	assert.Equal(t, existingExpense.Description, result.Description)
	mockRepo.AssertExpectations(t)
}

func TestExpenseService_DeleteExpense(t *testing.T) {
	mockRepo := new(MockExpenseRepository)
	service := NewExpenseService(mockRepo)

	mockRepo.On("Delete", mock.Anything, uint(1)).Return(nil)

	err := service.DeleteExpense(context.Background(), 1)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}
