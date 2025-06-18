package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"futarino-kakei/backend/internal/model"
	"futarino-kakei/backend/internal/service"
)

// SettlementHandler は精算機能のハンドラー
type SettlementHandler struct {
	settlementService *service.SettlementService
}

// NewSettlementHandler は新しい SettlementHandler インスタンスを作成
func NewSettlementHandler(settlementService *service.SettlementService) *SettlementHandler {
	return &SettlementHandler{
		settlementService: settlementService,
	}
}

// RegisterRoutes は精算関連のルートを登録
func (h *SettlementHandler) RegisterRoutes(rg *gin.RouterGroup) {
	settlements := rg.Group("/settlements")
	{
		settlements.POST("/calculate", h.CalculateSettlement)
		settlements.POST("/confirm", h.ConfirmSettlement)
		settlements.GET("", h.GetSettlements)
		settlements.GET("/:id", h.GetSettlementByID)
	}
}

// CalculateSettlement は精算額の計算
// POST /api/settlements/calculate
func (h *SettlementHandler) CalculateSettlement(c *gin.Context) {
	var req model.SettlementCalculateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// 認証されたユーザーの情報を取得
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: userIDからcoupleIDを取得する実装が必要
	// 現在は簡略化のため固定値を使用
	coupleID := uint(1)

	// 期間の妥当性チェック
	if req.PeriodEnd.Before(req.PeriodStart) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End date must be after start date"})
		return
	}

	// 精算計算を実行
	result, err := h.settlementService.CalculateSettlement(coupleID, req.PeriodStart, req.PeriodEnd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate settlement", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// ConfirmSettlement は精算の確定
// POST /api/settlements/confirm
func (h *SettlementHandler) ConfirmSettlement(c *gin.Context) {
	var req model.SettlementConfirmRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// 認証されたユーザーの情報を取得
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: userIDからcoupleIDを取得する実装が必要
	coupleID := uint(1)

	// 入力値の妥当性チェック
	if req.PeriodEnd.Before(req.PeriodStart) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End date must be after start date"})
		return
	}

	if len(req.ExpenseIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No expenses specified for settlement"})
		return
	}

	// 精算確定を実行
	settlement, err := h.settlementService.ConfirmSettlement(coupleID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to confirm settlement", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, settlement)
}

// GetSettlements は精算履歴の取得
// GET /api/settlements?page=1&pageSize=10
func (h *SettlementHandler) GetSettlements(c *gin.Context) {
	// 認証されたユーザーの情報を取得
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: userIDからcoupleIDを取得する実装が必要
	coupleID := uint(1)

	// ページネーションパラメータの取得
	page := 1
	pageSize := 10

	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr := c.Query("pageSize"); pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	// 精算履歴を取得
	result, err := h.settlementService.GetSettlements(coupleID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get settlements", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetSettlementByID は精算詳細の取得
// GET /api/settlements/:id
func (h *SettlementHandler) GetSettlementByID(c *gin.Context) {
	// 認証されたユーザーの情報を取得
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// パラメータからIDを取得
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid settlement ID"})
		return
	}

	// 精算詳細を取得
	settlement, err := h.settlementService.GetSettlementByID(uint(id))
	if err != nil {
		if err.Error() == "settlement not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Settlement not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get settlement", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settlement)
}

// TimeParseHelper は時刻文字列をパースするヘルパー関数
func parseTimeParam(timeStr string) (time.Time, error) {
	// ISO 8601形式またはYYYY-MM-DD形式をサポート
	layouts := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z",
		"2006-01-02",
	}

	for _, layout := range layouts {
		if t, err := time.Parse(layout, timeStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, gin.Error{Err: gin.Error{Type: gin.ErrorTypeBind}, Type: gin.ErrorTypeBind}
}
