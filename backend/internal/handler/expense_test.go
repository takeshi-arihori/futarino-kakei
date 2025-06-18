package handler

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"futarino-kakei/backend/internal/model"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockExpenseService はExpenseServiceのモック
type MockExpenseService struct {
	mock.Mock
}

func (m *MockExpenseService) CreateExpense(ctx context.Context, userID uint, req *model.ExpenseCreate) (*model.Expense, error) {
	args := m.Called(ctx, userID, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Expense), args.Error(1)
}

func (m *MockExpenseService) GetExpense(ctx context.Context, id uint) (*model.Expense, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Expense), args.Error(1)
}

func (m *MockExpenseService) GetUserExpenses(ctx context.Context, userID uint) ([]*model.Expense, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Expense), args.Error(1)
}

func (m *MockExpenseService) UpdateExpense(ctx context.Context, id uint, req *model.ExpenseUpdate) (*model.Expense, error) {
	args := m.Called(ctx, id, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Expense), args.Error(1)
}

func (m *MockExpenseService) DeleteExpense(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	return router
}

func TestExpenseHandler_CreateExpense(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	// 固定の時刻を使用
	fixedTime := time.Date(2025, 6, 18, 12, 0, 0, 0, time.UTC)

	req := &model.ExpenseCreate{
		Amount:      1000,
		Category:    "食費",
		Description: "昼食",
		Date:        fixedTime,
	}

	expectedExpense := &model.Expense{
		ID:          1,
		UserID:      1,
		Amount:      req.Amount,
		Category:    req.Category,
		Description: req.Description,
		Date:        req.Date,
		CreatedAt:   fixedTime,
		UpdatedAt:   fixedTime,
	}

	// mock.MatchedByを使用して柔軟なマッチングを実装
	mockService.On("CreateExpense", mock.Anything, uint(1), mock.MatchedBy(func(r *model.ExpenseCreate) bool {
		return r.Amount == 1000 && r.Category == "食費" && r.Description == "昼食"
	})).Return(expectedExpense, nil)

	router.POST("/expenses", func(c *gin.Context) {
		c.Set("user_id", uint(1))
		handler.CreateExpense(c)
	})

	jsonData, _ := json.Marshal(req)
	w := httptest.NewRecorder()
	request, _ := http.NewRequest("POST", "/expenses", bytes.NewBuffer(jsonData))
	request.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusCreated, w.Code)
	var response model.Expense
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedExpense.ID, response.ID)
	assert.Equal(t, expectedExpense.Amount, response.Amount)
	mockService.AssertExpectations(t)
}

func TestExpenseHandler_CreateExpense_BadRequest(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	router.POST("/expenses", func(c *gin.Context) {
		c.Set("user_id", uint(1))
		handler.CreateExpense(c)
	})

	// 不正なJSONを送信
	w := httptest.NewRecorder()
	request, _ := http.NewRequest("POST", "/expenses", bytes.NewBufferString("invalid json"))
	request.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestExpenseHandler_GetExpense(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	fixedTime := time.Date(2025, 6, 18, 12, 0, 0, 0, time.UTC)

	expectedExpense := &model.Expense{
		ID:          1,
		UserID:      1,
		Amount:      1000,
		Category:    "食費",
		Description: "昼食",
		Date:        fixedTime,
	}

	mockService.On("GetExpense", mock.Anything, uint(1)).Return(expectedExpense, nil)

	router.GET("/expenses/:id", handler.GetExpense)

	w := httptest.NewRecorder()
	request, _ := http.NewRequest("GET", "/expenses/1", nil)

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusOK, w.Code)
	var response model.Expense
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedExpense.ID, response.ID)
	mockService.AssertExpectations(t)
}

func TestExpenseHandler_GetExpense_NotFound(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	mockService.On("GetExpense", mock.Anything, uint(999)).Return(nil, sql.ErrNoRows)

	router.GET("/expenses/:id", handler.GetExpense)

	w := httptest.NewRecorder()
	request, _ := http.NewRequest("GET", "/expenses/999", nil)

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockService.AssertExpectations(t)
}

func TestExpenseHandler_GetExpense_InvalidID(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	router.GET("/expenses/:id", handler.GetExpense)

	w := httptest.NewRecorder()
	request, _ := http.NewRequest("GET", "/expenses/invalid", nil)

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestExpenseHandler_GetUserExpenses(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	fixedTime := time.Date(2025, 6, 18, 12, 0, 0, 0, time.UTC)

	expectedExpenses := []*model.Expense{
		{
			ID:          1,
			UserID:      1,
			Amount:      1000,
			Category:    "食費",
			Description: "昼食",
			Date:        fixedTime,
		},
		{
			ID:          2,
			UserID:      1,
			Amount:      500,
			Category:    "交通費",
			Description: "電車代",
			Date:        fixedTime,
		},
	}

	mockService.On("GetUserExpenses", mock.Anything, uint(1)).Return(expectedExpenses, nil)

	router.GET("/expenses", func(c *gin.Context) {
		c.Set("user_id", uint(1))
		handler.GetUserExpenses(c)
	})

	w := httptest.NewRecorder()
	request, _ := http.NewRequest("GET", "/expenses", nil)

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusOK, w.Code)
	var response []*model.Expense
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response, 2)
	assert.Equal(t, expectedExpenses[0].ID, response[0].ID)
	mockService.AssertExpectations(t)
}

func TestExpenseHandler_UpdateExpense(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	fixedTime := time.Date(2025, 6, 18, 12, 0, 0, 0, time.UTC)

	updateReq := &model.ExpenseUpdate{
		Amount:      1500,
		Category:    "食費",
		Description: "夕食",
		Date:        fixedTime,
	}

	expectedExpense := &model.Expense{
		ID:          1,
		UserID:      1,
		Amount:      updateReq.Amount,
		Category:    updateReq.Category,
		Description: updateReq.Description,
		Date:        updateReq.Date,
	}

	mockService.On("UpdateExpense", mock.Anything, uint(1), mock.MatchedBy(func(r *model.ExpenseUpdate) bool {
		return r.Amount == 1500 && r.Category == "食費" && r.Description == "夕食"
	})).Return(expectedExpense, nil)

	router.PUT("/expenses/:id", handler.UpdateExpense)

	jsonData, _ := json.Marshal(updateReq)
	w := httptest.NewRecorder()
	request, _ := http.NewRequest("PUT", "/expenses/1", bytes.NewBuffer(jsonData))
	request.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusOK, w.Code)
	var response model.Expense
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedExpense.Amount, response.Amount)
	mockService.AssertExpectations(t)
}

func TestExpenseHandler_DeleteExpense(t *testing.T) {
	mockService := new(MockExpenseService)
	handler := NewExpenseHandler(mockService)
	router := setupTestRouter()

	mockService.On("DeleteExpense", mock.Anything, uint(1)).Return(nil)

	router.DELETE("/expenses/:id", handler.DeleteExpense)

	w := httptest.NewRecorder()
	request, _ := http.NewRequest("DELETE", "/expenses/1", nil)

	router.ServeHTTP(w, request)

	assert.Equal(t, http.StatusNoContent, w.Code)
	mockService.AssertExpectations(t)
}
