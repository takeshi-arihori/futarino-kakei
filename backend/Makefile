.PHONY: migrate-up migrate-down migrate-force

# マイグレーションを実行（全て or 指定したステップ数）
migrate-up:
	@if [ -z "$(steps)" ]; then \
		migrate -path migrations -database "${DATABASE_URL}" up; \
	else \
		migrate -path migrations -database "${DATABASE_URL}" up $(steps); \
	fi

# マイグレーションをロールバック（全て or 指定したステップ数）
migrate-down:
	@if [ -z "$(steps)" ]; then \
		migrate -path migrations -database "${DATABASE_URL}" down; \
	else \
		migrate -path migrations -database "${DATABASE_URL}" down $(steps); \
	fi

# マイグレーションのバージョンを強制的に設定（エラー時の復旧用）
migrate-force:
	@if [ -z "$(version)" ]; then \
		echo "Usage: make migrate-force version=<version>"; \
		exit 1; \
	else \
		migrate -path migrations -database "${DATABASE_URL}" force $(version); \
	fi 
