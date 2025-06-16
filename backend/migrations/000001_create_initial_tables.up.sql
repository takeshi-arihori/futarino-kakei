CREATE TABLE couples (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_split_user1 SMALLINT NOT NULL,
    default_split_user2 SMALLINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    couple_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_couple
        FOREIGN KEY(couple_id)
            REFERENCES couples(id)
            ON DELETE SET NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    couple_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL,
    default_split_user1 SMALLINT NOT NULL,
    default_split_user2 SMALLINT NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_couple
        FOREIGN KEY(couple_id)
            REFERENCES couples(id)
            ON DELETE CASCADE
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    couple_id INT NOT NULL,
    category_id INT NOT NULL,
    paid_by_user_id INT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    memo TEXT,
    split_user1 SMALLINT NOT NULL,
    split_user2 SMALLINT NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_couple
        FOREIGN KEY(couple_id)
            REFERENCES couples(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
            REFERENCES categories(id)
            ON DELETE RESTRICT,
    CONSTRAINT fk_paid_by_user
        FOREIGN KEY(paid_by_user_id)
            REFERENCES users(id)
            ON DELETE RESTRICT
);

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    couple_id INT NOT NULL,
    target_month DATE UNIQUE NOT NULL,
    monthly_total DECIMAL(12, 2) NOT NULL,
    category_budgets JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_couple
        FOREIGN KEY(couple_id)
            REFERENCES couples(id)
            ON DELETE CASCADE
);

CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    couple_id INT NOT NULL,
    settlement_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_couple
        FOREIGN KEY(couple_id)
            REFERENCES couples(id)
            ON DELETE CASCADE
);

CREATE TABLE settlement_expenses (
    settlement_id INT NOT NULL,
    expense_id BIGINT NOT NULL,
    PRIMARY KEY (settlement_id, expense_id),
    CONSTRAINT fk_settlement
        FOREIGN KEY(settlement_id)
            REFERENCES settlements(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_expense
        FOREIGN KEY(expense_id)
            REFERENCES expenses(id)
            ON DELETE CASCADE
);
