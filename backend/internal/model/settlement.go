package model

import (
	"time"
)

// Settlement は精算情報を表すモデル
type Settlement struct {
	ID             uint                   `json:"id" gorm:"primaryKey"`
	CoupleID       uint                   `json:"couple_id" gorm:"not null"`
	SettlementDate time.Time              `json:"settlement_date" gorm:"not null"`
	PeriodStart    time.Time              `json:"period_start" gorm:"not null"`
	PeriodEnd      time.Time              `json:"period_end" gorm:"not null"`
	Details        map[string]interface{} `json:"details" gorm:"type:jsonb"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}

// SettlementExpense は精算と支出の関連を表すモデル
type SettlementExpense struct {
	SettlementID uint `json:"settlement_id" gorm:"primaryKey"`
	ExpenseID    uint `json:"expense_id" gorm:"primaryKey"`
}

// SettlementCalculateRequest は精算計算のリクエスト
type SettlementCalculateRequest struct {
	PeriodStart time.Time `json:"period_start" binding:"required"`
	PeriodEnd   time.Time `json:"period_end" binding:"required"`
}

// SettlementCalculateResponse は精算計算のレスポンス
type SettlementCalculateResponse struct {
	PeriodStart             time.Time              `json:"period_start"`
	PeriodEnd               time.Time              `json:"period_end"`
	ExpenseCount            int                    `json:"expense_count"`
	TotalAmount             int                    `json:"total_amount"`
	User1PaidAmount         int                    `json:"user1_paid_amount"`
	User2PaidAmount         int                    `json:"user2_paid_amount"`
	User1OwedAmount         int                    `json:"user1_owed_amount"`
	User2OwedAmount         int                    `json:"user2_owed_amount"`
	NetTransferUser1ToUser2 int                    `json:"net_transfer_user1_to_user2"`
	ExpenseIDs              []uint                 `json:"expense_ids"`
	Expenses                []ExpenseForSettlement `json:"expenses"`
}

// SettlementConfirmRequest は精算確定のリクエスト
type SettlementConfirmRequest struct {
	PeriodStart time.Time              `json:"period_start" binding:"required"`
	PeriodEnd   time.Time              `json:"period_end" binding:"required"`
	ExpenseIDs  []uint                 `json:"expense_ids" binding:"required"`
	Details     map[string]interface{} `json:"details" binding:"required"`
}

// ExpenseForSettlement は精算計算で使用する支出情報
type ExpenseForSettlement struct {
	ID           uint      `json:"id"`
	Amount       int       `json:"amount"`
	Date         time.Time `json:"date"`
	CategoryID   uint      `json:"category_id"`
	PaidByUserID uint      `json:"paid_by_user_id"`
	SplitUser1   int       `json:"split_user1"`
	SplitUser2   int       `json:"split_user2"`
	Memo         string    `json:"memo"`
	IsSettled    bool      `json:"is_settled"`
}

// SettlementListResponse は精算履歴のレスポンス
type SettlementListResponse struct {
	Settlements []SettlementWithDetails `json:"settlements"`
	Total       int                     `json:"total"`
}

// SettlementWithDetails は詳細情報付きの精算データ
type SettlementWithDetails struct {
	ID             uint                   `json:"id"`
	SettlementDate time.Time              `json:"settlement_date"`
	PeriodStart    time.Time              `json:"period_start"`
	PeriodEnd      time.Time              `json:"period_end"`
	Details        map[string]interface{} `json:"details"`
	ExpenseCount   int                    `json:"expense_count"`
	CreatedAt      time.Time              `json:"created_at"`
}
