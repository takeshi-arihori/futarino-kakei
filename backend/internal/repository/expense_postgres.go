package repository

import (
	"context"
	"database/sql"
	"futarino-kakei/backend/internal/model"
)

// ExpensePostgresRepository はPostgreSQLを使用した支出リポジトリの実装
type ExpensePostgresRepository struct {
	db *sql.DB
}

// NewExpensePostgresRepository は新しいExpensePostgresRepositoryを作成
func NewExpensePostgresRepository(db *sql.DB) *ExpensePostgresRepository {
	return &ExpensePostgresRepository{db: db}
}

// Create は新しい支出を作成
func (r *ExpensePostgresRepository) Create(ctx context.Context, expense *model.Expense) error {
	query := `
		INSERT INTO expenses (user_id, amount, category, description, date, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at`

	return r.db.QueryRowContext(ctx, query,
		expense.UserID, expense.Amount, expense.Category, expense.Description, expense.Date,
	).Scan(&expense.ID, &expense.CreatedAt, &expense.UpdatedAt)
}

// FindByID はIDで支出を検索
func (r *ExpensePostgresRepository) FindByID(ctx context.Context, id uint) (*model.Expense, error) {
	expense := &model.Expense{}
	query := `
		SELECT id, user_id, amount, category, description, date, created_at, updated_at
		FROM expenses
		WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&expense.ID, &expense.UserID, &expense.Amount, &expense.Category,
		&expense.Description, &expense.Date, &expense.CreatedAt, &expense.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return expense, nil
}

// FindByUserID はユーザーIDで支出を検索
func (r *ExpensePostgresRepository) FindByUserID(ctx context.Context, userID uint) ([]*model.Expense, error) {
	query := `
		SELECT id, user_id, amount, category, description, date, created_at, updated_at
		FROM expenses
		WHERE user_id = $1
		ORDER BY date DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var expenses []*model.Expense
	for rows.Next() {
		expense := &model.Expense{}
		err := rows.Scan(
			&expense.ID, &expense.UserID, &expense.Amount, &expense.Category,
			&expense.Description, &expense.Date, &expense.CreatedAt, &expense.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		expenses = append(expenses, expense)
	}
	return expenses, nil
}

// Update は支出を更新
func (r *ExpensePostgresRepository) Update(ctx context.Context, expense *model.Expense) error {
	query := `
		UPDATE expenses
		SET amount = $2, category = $3, description = $4, date = $5, updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at`

	return r.db.QueryRowContext(ctx, query,
		expense.ID, expense.Amount, expense.Category, expense.Description, expense.Date,
	).Scan(&expense.UpdatedAt)
}

// Delete は支出を削除
func (r *ExpensePostgresRepository) Delete(ctx context.Context, id uint) error {
	query := `DELETE FROM expenses WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
