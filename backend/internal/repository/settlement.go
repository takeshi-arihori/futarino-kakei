package repository

import (
	"futarino-kakei/backend/internal/model"
	"time"
)

// SettlementRepository は精算に関するデータアクセスのインターフェース
type SettlementRepository interface {
	// 指定期間の未精算支出を取得
	GetUnsettledExpensesByPeriod(coupleID uint, periodStart, periodEnd time.Time) ([]model.ExpenseForSettlement, error)

	// 精算を作成
	CreateSettlement(settlement *model.Settlement) error

	// 精算と支出の関連を作成
	CreateSettlementExpenses(settlementExpenses []model.SettlementExpense) error

	// 支出を精算済みに更新
	MarkExpensesAsSettled(expenseIDs []uint) error

	// カップルの精算履歴を取得
	GetSettlementsByCouple(coupleID uint, limit, offset int) ([]model.SettlementWithDetails, int, error)

	// 精算IDで精算を取得
	GetSettlementByID(settlementID uint) (*model.Settlement, error)
}
