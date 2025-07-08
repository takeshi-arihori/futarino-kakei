-- 支出管理テーブル

-- 支出記録テーブル
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL,
  receipt_image_url TEXT,
  is_settled BOOLEAN DEFAULT FALSE,
  split_ratio DECIMAL(3,2) DEFAULT 0.50 CHECK (split_ratio >= 0 AND split_ratio <= 1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 精算記録テーブル
CREATE TABLE settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  settlement_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT different_users CHECK (from_user_id != to_user_id)
);

-- 精算対象支出の関連テーブル
CREATE TABLE settlement_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(settlement_id, expense_id)
);

-- 予算管理テーブル（将来の機能拡張用）
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'weekly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_budget_period CHECK (end_date IS NULL OR end_date >= start_date)
);

-- 支出テーブルのインデックス
CREATE INDEX expenses_couple_id_idx ON expenses(couple_id);
CREATE INDEX expenses_user_id_idx ON expenses(user_id);
CREATE INDEX expenses_category_id_idx ON expenses(category_id);
CREATE INDEX expenses_date_idx ON expenses(date);
CREATE INDEX expenses_is_settled_idx ON expenses(is_settled);
CREATE INDEX expenses_created_at_idx ON expenses(created_at);

-- 精算テーブルのインデックス
CREATE INDEX settlements_couple_id_idx ON settlements(couple_id);
CREATE INDEX settlements_from_user_id_idx ON settlements(from_user_id);
CREATE INDEX settlements_to_user_id_idx ON settlements(to_user_id);
CREATE INDEX settlements_status_idx ON settlements(status);
CREATE INDEX settlements_period_idx ON settlements(period_start, period_end);

-- 精算対象支出のインデックス
CREATE INDEX settlement_expenses_settlement_id_idx ON settlement_expenses(settlement_id);
CREATE INDEX settlement_expenses_expense_id_idx ON settlement_expenses(expense_id);

-- 予算テーブルのインデックス
CREATE INDEX budgets_couple_id_idx ON budgets(couple_id);
CREATE INDEX budgets_category_id_idx ON budgets(category_id);
CREATE INDEX budgets_period_idx ON budgets(start_date, end_date);
CREATE INDEX budgets_is_active_idx ON budgets(is_active);

-- 更新日時トリガーの適用
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 精算完了時に支出のis_settledを更新する関数
CREATE OR REPLACE FUNCTION update_expense_settled_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 精算が完了状態になった場合
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE expenses 
    SET is_settled = TRUE 
    WHERE id IN (
      SELECT expense_id 
      FROM settlement_expenses 
      WHERE settlement_id = NEW.id
    );
  -- 精算がキャンセルまたはpendingに戻った場合
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    UPDATE expenses 
    SET is_settled = FALSE 
    WHERE id IN (
      SELECT expense_id 
      FROM settlement_expenses 
      WHERE settlement_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 精算ステータス変更トリガー
CREATE TRIGGER settlement_status_change AFTER UPDATE OF status ON settlements
    FOR EACH ROW EXECUTE FUNCTION update_expense_settled_status();