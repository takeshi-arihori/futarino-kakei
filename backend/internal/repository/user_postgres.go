package repository

import (
	"database/sql"
	"futarino-kakei/backend/internal/model"
)

type UserPostgresRepository struct {
	db *sql.DB
}

func NewUserPostgresRepository(db *sql.DB) *UserPostgresRepository {
	return &UserPostgresRepository{db: db}
}

// Create 新規ユーザーを作成する
func (r *UserPostgresRepository) Create(user *model.User) error {
	query := `
		INSERT INTO users (email, password_hash, name, created_at, updated_at)
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query, user.Email, user.PasswordHash, user.Name).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

// FindByEmail メールアドレスからユーザーを検索する
func (r *UserPostgresRepository) FindByEmail(email string) (*model.User, error) {
	user := &model.User{}
	query := `
		SELECT id, email, password_hash, name, created_at, updated_at
		FROM users
		WHERE email = $1`

	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Name,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, err
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

// ExistsByEmail メールアドレスの重複をチェックする
func (r *UserPostgresRepository) ExistsByEmail(email string) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS(
			SELECT 1
			FROM users
			WHERE email = $1
		)`

	err := r.db.QueryRow(query, email).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}
