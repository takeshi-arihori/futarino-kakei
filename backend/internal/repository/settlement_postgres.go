package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"futarino-kakei/backend/internal/model"
)

// SettlementPostgres は PostgreSQL を使用した精算リポジトリの実装
type SettlementPostgres struct {
	db *sql.DB
}

// NewSettlementPostgres は新しい SettlementPostgres インスタンスを作成
func NewSettlementPostgres(db *sql.DB) SettlementRepository {
	return &SettlementPostgres{db: db}
}

// GetUnsettledExpensesByPeriod は指定期間の未精算支出を取得
func (r *SettlementPostgres) GetUnsettledExpensesByPeriod(coupleID uint, periodStart, periodEnd time.Time) ([]model.ExpenseForSettlement, error) {
	query := `
		SELECT id, amount, date, category_id, paid_by_user_id, split_user1, split_user2, memo, is_settled
		FROM expenses 
		WHERE couple_id = $1 AND is_settled = false AND date >= $2 AND date <= $3
		ORDER BY date DESC
	`

	rows, err := r.db.Query(query, coupleID, periodStart, periodEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to query unsettled expenses: %w", err)
	}
	defer rows.Close()

	var expenses []model.ExpenseForSettlement
	for rows.Next() {
		var expense model.ExpenseForSettlement
		var memo sql.NullString

		err := rows.Scan(
			&expense.ID,
			&expense.Amount,
			&expense.Date,
			&expense.CategoryID,
			&expense.PaidByUserID,
			&expense.SplitUser1,
			&expense.SplitUser2,
			&memo,
			&expense.IsSettled,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan expense: %w", err)
		}

		if memo.Valid {
			expense.Memo = memo.String
		}

		expenses = append(expenses, expense)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return expenses, nil
}

// CreateSettlement は精算を作成
func (r *SettlementPostgres) CreateSettlement(settlement *model.Settlement) error {
	detailsJSON, err := json.Marshal(settlement.Details)
	if err != nil {
		return fmt.Errorf("failed to marshal details: %w", err)
	}

	query := `
		INSERT INTO settlements (couple_id, settlement_date, period_start, period_end, details, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err = r.db.QueryRow(
		query,
		settlement.CoupleID,
		settlement.SettlementDate,
		settlement.PeriodStart,
		settlement.PeriodEnd,
		detailsJSON,
	).Scan(&settlement.ID, &settlement.CreatedAt, &settlement.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create settlement: %w", err)
	}

	return nil
}

// CreateSettlementExpenses は精算と支出の関連を作成
func (r *SettlementPostgres) CreateSettlementExpenses(settlementExpenses []model.SettlementExpense) error {
	if len(settlementExpenses) == 0 {
		return nil
	}

	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `INSERT INTO settlement_expenses (settlement_id, expense_id) VALUES ($1, $2)`

	for _, se := range settlementExpenses {
		_, err = tx.Exec(query, se.SettlementID, se.ExpenseID)
		if err != nil {
			return fmt.Errorf("failed to create settlement expense: %w", err)
		}
	}

	return tx.Commit()
}

// MarkExpensesAsSettled は支出を精算済みに更新
func (r *SettlementPostgres) MarkExpensesAsSettled(expenseIDs []uint) error {
	if len(expenseIDs) == 0 {
		return nil
	}

	// PostgreSQLの配列型を使用
	ids := make([]int, len(expenseIDs))
	for i, id := range expenseIDs {
		ids[i] = int(id)
	}

	query := `UPDATE expenses SET is_settled = true, updated_at = NOW() WHERE id = ANY($1::int[])`

	_, err := r.db.Exec(query, fmt.Sprintf("{%s}", joinInts(ids, ",")))
	if err != nil {
		return fmt.Errorf("failed to mark expenses as settled: %w", err)
	}

	return nil
}

// joinInts は int slice を文字列に結合するヘルパー関数
func joinInts(ints []int, sep string) string {
	if len(ints) == 0 {
		return ""
	}
	result := fmt.Sprintf("%d", ints[0])
	for _, v := range ints[1:] {
		result += sep + fmt.Sprintf("%d", v)
	}
	return result
}

// GetSettlementsByCouple はカップルの精算履歴を取得
func (r *SettlementPostgres) GetSettlementsByCouple(coupleID uint, limit, offset int) ([]model.SettlementWithDetails, int, error) {
	// 総数を取得
	var total int
	countQuery := `SELECT COUNT(*) FROM settlements WHERE couple_id = $1`
	err := r.db.QueryRow(countQuery, coupleID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count settlements: %w", err)
	}

	// 精算データを取得
	query := `
		SELECT s.id, s.settlement_date, s.period_start, s.period_end, s.details, s.created_at,
		       COUNT(se.expense_id) as expense_count
		FROM settlements s
		LEFT JOIN settlement_expenses se ON s.id = se.settlement_id
		WHERE s.couple_id = $1
		GROUP BY s.id, s.settlement_date, s.period_start, s.period_end, s.details, s.created_at
		ORDER BY s.settlement_date DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(query, coupleID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query settlements: %w", err)
	}
	defer rows.Close()

	var settlements []model.SettlementWithDetails
	for rows.Next() {
		var settlement model.SettlementWithDetails
		var detailsJSON []byte

		err := rows.Scan(
			&settlement.ID,
			&settlement.SettlementDate,
			&settlement.PeriodStart,
			&settlement.PeriodEnd,
			&detailsJSON,
			&settlement.CreatedAt,
			&settlement.ExpenseCount,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan settlement: %w", err)
		}

		if len(detailsJSON) > 0 {
			err = json.Unmarshal(detailsJSON, &settlement.Details)
			if err != nil {
				return nil, 0, fmt.Errorf("failed to unmarshal details: %w", err)
			}
		}

		settlements = append(settlements, settlement)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("rows iteration error: %w", err)
	}

	return settlements, total, nil
}

// GetSettlementByID は精算IDで精算を取得
func (r *SettlementPostgres) GetSettlementByID(settlementID uint) (*model.Settlement, error) {
	query := `
		SELECT id, couple_id, settlement_date, period_start, period_end, details, created_at, updated_at
		FROM settlements
		WHERE id = $1
	`

	var settlement model.Settlement
	var detailsJSON []byte

	err := r.db.QueryRow(query, settlementID).Scan(
		&settlement.ID,
		&settlement.CoupleID,
		&settlement.SettlementDate,
		&settlement.PeriodStart,
		&settlement.PeriodEnd,
		&detailsJSON,
		&settlement.CreatedAt,
		&settlement.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("settlement not found")
		}
		return nil, fmt.Errorf("failed to get settlement: %w", err)
	}

	if len(detailsJSON) > 0 {
		err = json.Unmarshal(detailsJSON, &settlement.Details)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal details: %w", err)
		}
	}

	return &settlement, nil
}
