package service

import (
	"fmt"
	"time"

	"futarino-kakei/backend/internal/model"
	"futarino-kakei/backend/internal/repository"
)

// SettlementService は精算機能のサービス
type SettlementService struct {
	settlementRepo repository.SettlementRepository
}

// NewSettlementService は新しい SettlementService インスタンスを作成
func NewSettlementService(settlementRepo repository.SettlementRepository) *SettlementService {
	return &SettlementService{
		settlementRepo: settlementRepo,
	}
}

// CalculateSettlement は指定期間の精算額を計算
func (s *SettlementService) CalculateSettlement(coupleID uint, periodStart, periodEnd time.Time) (*model.SettlementCalculateResponse, error) {
	// 未精算の支出を取得
	expenses, err := s.settlementRepo.GetUnsettledExpensesByPeriod(coupleID, periodStart, periodEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to get unsettled expenses: %w", err)
	}

	if len(expenses) == 0 {
		return &model.SettlementCalculateResponse{
			PeriodStart:  periodStart,
			PeriodEnd:    periodEnd,
			ExpenseCount: 0,
			Expenses:     []model.ExpenseForSettlement{},
		}, nil
	}

	// 精算計算のロジック
	var totalAmount int
	var user1PaidAmount, user2PaidAmount int
	var user1OwedAmount, user2OwedAmount int
	var expenseIDs []uint

	// カップルの最初のユーザーIDを取得（簡略化のため、expenses[0].PaidByUserIDを基準とする）
	// 実際の実装では、coupleIDからuser1とuser2のIDを取得する必要がある
	user1ID := expenses[0].PaidByUserID
	var user2ID uint

	// user2IDを探す
	for _, expense := range expenses {
		if expense.PaidByUserID != user1ID {
			user2ID = expense.PaidByUserID
			break
		}
	}

	// user2IDが見つからない場合（全ての支出が同一人物による支払い）
	if user2ID == 0 {
		user2ID = user1ID + 1 // 仮の値
	}

	for _, expense := range expenses {
		totalAmount += expense.Amount
		expenseIDs = append(expenseIDs, expense.ID)

		// 支払った金額の集計
		if expense.PaidByUserID == user1ID {
			user1PaidAmount += expense.Amount
		} else {
			user2PaidAmount += expense.Amount
		}

		// 負担すべき金額の集計（split比率に基づいて）
		user1OwedAmount += expense.Amount * expense.SplitUser1 / 100
		user2OwedAmount += expense.Amount * expense.SplitUser2 / 100
	}

	// 最終的な精算額を計算
	// 正の値：user1がuser2に支払う
	// 負の値：user2がuser1に支払う
	netTransferUser1ToUser2 := user1OwedAmount - user1PaidAmount

	return &model.SettlementCalculateResponse{
		PeriodStart:             periodStart,
		PeriodEnd:               periodEnd,
		ExpenseCount:            len(expenses),
		TotalAmount:             totalAmount,
		User1PaidAmount:         user1PaidAmount,
		User2PaidAmount:         user2PaidAmount,
		User1OwedAmount:         user1OwedAmount,
		User2OwedAmount:         user2OwedAmount,
		NetTransferUser1ToUser2: netTransferUser1ToUser2,
		ExpenseIDs:              expenseIDs,
		Expenses:                expenses,
	}, nil
}

// ConfirmSettlement は精算を確定
func (s *SettlementService) ConfirmSettlement(coupleID uint, req *model.SettlementConfirmRequest) (*model.Settlement, error) {
	// 精算データを作成
	settlement := &model.Settlement{
		CoupleID:       coupleID,
		SettlementDate: time.Now(),
		PeriodStart:    req.PeriodStart,
		PeriodEnd:      req.PeriodEnd,
		Details:        req.Details,
	}

	// データベースに精算を保存
	err := s.settlementRepo.CreateSettlement(settlement)
	if err != nil {
		return nil, fmt.Errorf("failed to create settlement: %w", err)
	}

	// 精算と支出の関連を作成
	settlementExpenses := make([]model.SettlementExpense, len(req.ExpenseIDs))
	for i, expenseID := range req.ExpenseIDs {
		settlementExpenses[i] = model.SettlementExpense{
			SettlementID: settlement.ID,
			ExpenseID:    expenseID,
		}
	}

	err = s.settlementRepo.CreateSettlementExpenses(settlementExpenses)
	if err != nil {
		return nil, fmt.Errorf("failed to create settlement expenses: %w", err)
	}

	// 支出を精算済みに更新
	err = s.settlementRepo.MarkExpensesAsSettled(req.ExpenseIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to mark expenses as settled: %w", err)
	}

	return settlement, nil
}

// GetSettlements は精算履歴を取得
func (s *SettlementService) GetSettlements(coupleID uint, page, pageSize int) (*model.SettlementListResponse, error) {
	offset := (page - 1) * pageSize
	settlements, total, err := s.settlementRepo.GetSettlementsByCouple(coupleID, pageSize, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get settlements: %w", err)
	}

	return &model.SettlementListResponse{
		Settlements: settlements,
		Total:       total,
	}, nil
}

// GetSettlementByID は精算詳細を取得
func (s *SettlementService) GetSettlementByID(settlementID uint) (*model.Settlement, error) {
	settlement, err := s.settlementRepo.GetSettlementByID(settlementID)
	if err != nil {
		return nil, fmt.Errorf("failed to get settlement: %w", err)
	}

	return settlement, nil
}
