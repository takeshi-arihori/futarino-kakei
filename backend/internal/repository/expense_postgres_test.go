package repository

import (
	"context"
	"database/sql"
	"futarino-kakei/backend/internal/model"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestExpensePostgresRepository_Create(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewExpensePostgresRepository(db)

	expense := &model.Expense{
		UserID:      1,
		Amount:      1000,
		Category:    "食費",
		Description: "昼食",
		Date:        time.Now(),
	}

	rows := sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).
		AddRow(1, time.Now(), time.Now())

	mock.ExpectQuery(`INSERT INTO expenses`).
		WithArgs(expense.UserID, expense.Amount, expense.Category, expense.Description, expense.Date).
		WillReturnRows(rows)

	err = repo.Create(context.Background(), expense)
	assert.NoError(t, err)
	assert.Equal(t, uint(1), expense.ID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpensePostgresRepository_FindByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewExpensePostgresRepository(db)

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

	rows := sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "description", "date", "created_at", "updated_at"}).
		AddRow(expectedExpense.ID, expectedExpense.UserID, expectedExpense.Amount, expectedExpense.Category,
			expectedExpense.Description, expectedExpense.Date, expectedExpense.CreatedAt, expectedExpense.UpdatedAt)

	mock.ExpectQuery(`SELECT id, user_id, amount, category, description, date, created_at, updated_at FROM expenses WHERE id = \$1`).
		WithArgs(uint(1)).
		WillReturnRows(rows)

	expense, err := repo.FindByID(context.Background(), 1)
	assert.NoError(t, err)
	assert.Equal(t, expectedExpense.ID, expense.ID)
	assert.Equal(t, expectedExpense.UserID, expense.UserID)
	assert.Equal(t, expectedExpense.Amount, expense.Amount)
	assert.Equal(t, expectedExpense.Category, expense.Category)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpensePostgresRepository_FindByUserID(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewExpensePostgresRepository(db)

	rows := sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "description", "date", "created_at", "updated_at"}).
		AddRow(1, 1, 1000, "食費", "昼食", time.Now(), time.Now(), time.Now()).
		AddRow(2, 1, 500, "交通費", "電車代", time.Now(), time.Now(), time.Now())

	mock.ExpectQuery(`SELECT id, user_id, amount, category, description, date, created_at, updated_at FROM expenses WHERE user_id = \$1 ORDER BY date DESC`).
		WithArgs(uint(1)).
		WillReturnRows(rows)

	expenses, err := repo.FindByUserID(context.Background(), 1)
	assert.NoError(t, err)
	assert.Len(t, expenses, 2)
	assert.Equal(t, uint(1), expenses[0].ID)
	assert.Equal(t, uint(2), expenses[1].ID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpensePostgresRepository_Update(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewExpensePostgresRepository(db)

	expense := &model.Expense{
		ID:          1,
		UserID:      1,
		Amount:      1500,
		Category:    "食費",
		Description: "夕食",
		Date:        time.Now(),
	}

	rows := sqlmock.NewRows([]string{"updated_at"}).
		AddRow(time.Now())

	mock.ExpectQuery(`UPDATE expenses SET amount = \$2, category = \$3, description = \$4, date = \$5, updated_at = NOW\(\) WHERE id = \$1`).
		WithArgs(expense.ID, expense.Amount, expense.Category, expense.Description, expense.Date).
		WillReturnRows(rows)

	err = repo.Update(context.Background(), expense)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpensePostgresRepository_Delete(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewExpensePostgresRepository(db)

	mock.ExpectExec(`DELETE FROM expenses WHERE id = \$1`).
		WithArgs(uint(1)).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.Delete(context.Background(), 1)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpensePostgresRepository_FindByID_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewExpensePostgresRepository(db)

	mock.ExpectQuery(`SELECT id, user_id, amount, category, description, date, created_at, updated_at FROM expenses WHERE id = \$1`).
		WithArgs(uint(999)).
		WillReturnError(sql.ErrNoRows)

	expense, err := repo.FindByID(context.Background(), 999)
	assert.Error(t, err)
	assert.Nil(t, expense)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}
