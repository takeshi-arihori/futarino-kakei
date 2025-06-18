package handler

import (
	"net/http"
	"strconv"

	"futarino-kakei/backend/internal/model"
	"futarino-kakei/backend/internal/service"

	"github.com/gin-gonic/gin"
)

// ExpenseHandler は支出のハンドラー
type ExpenseHandler struct {
	expenseService service.ExpenseServiceInterface
}

// NewExpenseHandler は新しいExpenseHandlerを作成
func NewExpenseHandler(expenseService service.ExpenseServiceInterface) *ExpenseHandler {
	return &ExpenseHandler{expenseService: expenseService}
}

// CreateExpense は新しい支出を作成
func (h *ExpenseHandler) CreateExpense(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req model.ExpenseCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	expense, err := h.expenseService.CreateExpense(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, expense)
}

// GetExpense は支出を取得
func (h *ExpenseHandler) GetExpense(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expense ID"})
		return
	}

	expense, err := h.expenseService.GetExpense(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	c.JSON(http.StatusOK, expense)
}

// GetUserExpenses はユーザーの支出一覧を取得
func (h *ExpenseHandler) GetUserExpenses(c *gin.Context) {
	userID := c.GetUint("user_id")
	expenses, err := h.expenseService.GetUserExpenses(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, expenses)
}

// UpdateExpense は支出を更新
func (h *ExpenseHandler) UpdateExpense(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expense ID"})
		return
	}

	var req model.ExpenseUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	expense, err := h.expenseService.UpdateExpense(c.Request.Context(), uint(id), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, expense)
}

// DeleteExpense は支出を削除
func (h *ExpenseHandler) DeleteExpense(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expense ID"})
		return
	}

	if err := h.expenseService.DeleteExpense(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
