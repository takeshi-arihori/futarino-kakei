package repository

import "futarino-kakei/backend/internal/model"

// UserRepository ユーザー情報の永続化を担当するインターフェース
type UserRepository interface {
	Create(user *model.User) error
	FindByEmail(email string) (*model.User, error)
	ExistsByEmail(email string) (bool, error)
}
