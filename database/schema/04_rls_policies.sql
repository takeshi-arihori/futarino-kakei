-- Row Level Security (RLS) ポリシー設定

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーIDを取得するヘルパー関数
CREATE OR REPLACE FUNCTION auth.uid() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_metadata'->>'sub')::text
  )
$$ LANGUAGE sql STABLE;

-- ユーザーテーブルのポリシー
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- アカウントテーブルのポリシー
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (user_id = auth.uid());

-- セッションテーブルのポリシー
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (user_id = auth.uid());

-- カップルテーブルのポリシー
CREATE POLICY "Users can view own couple relationships" ON couples
  FOR SELECT USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
  );

CREATE POLICY "Users can create couple relationships" ON couples
  FOR INSERT WITH CHECK (user1_id = auth.uid());

CREATE POLICY "Users can update own couple relationships" ON couples
  FOR UPDATE USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
  );

-- 支出カテゴリテーブルのポリシー
CREATE POLICY "Users can view default categories" ON expense_categories
  FOR SELECT USING (is_default = true);

CREATE POLICY "Users can view couple categories" ON expense_categories
  FOR SELECT USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage couple categories" ON expense_categories
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- 支出テーブルのポリシー
CREATE POLICY "Users can view couple expenses" ON expenses
  FOR SELECT USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expenses for their couple" ON expenses
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (
    user_id = auth.uid() AND
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (
    user_id = auth.uid() AND
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- 精算テーブルのポリシー
CREATE POLICY "Users can view couple settlements" ON settlements
  FOR SELECT USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can create settlements for their couple" ON settlements
  FOR INSERT WITH CHECK (
    (from_user_id = auth.uid() OR to_user_id = auth.uid()) AND
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can update couple settlements" ON settlements
  FOR UPDATE USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- 精算対象支出テーブルのポリシー
CREATE POLICY "Users can view settlement expenses" ON settlement_expenses
  FOR SELECT USING (
    settlement_id IN (
      SELECT id FROM settlements
      WHERE couple_id IN (
        SELECT id FROM couples 
        WHERE user1_id = auth.uid() OR user2_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage settlement expenses" ON settlement_expenses
  FOR ALL USING (
    settlement_id IN (
      SELECT id FROM settlements
      WHERE couple_id IN (
        SELECT id FROM couples 
        WHERE user1_id = auth.uid() OR user2_id = auth.uid()
      )
    )
  );

-- 予算テーブルのポリシー
CREATE POLICY "Users can view couple budgets" ON budgets
  FOR SELECT USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage couple budgets" ON budgets
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- パフォーマンス向上のための関数
CREATE OR REPLACE FUNCTION get_user_couple_ids(user_id TEXT)
RETURNS TABLE(couple_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT id FROM couples 
  WHERE user1_id = user_id OR user2_id = user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;