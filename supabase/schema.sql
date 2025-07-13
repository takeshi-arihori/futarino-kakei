-- カップル・夫婦専用家計アプリ「ふたりの家計」データベーススキーマ

-- Enable RLS (Row Level Security)
-- Note: JWT secret is automatically configured by Supabase

-- NextAuth.js用のユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- カップル関係テーブル
CREATE TABLE IF NOT EXISTS couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  user2_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  icon TEXT DEFAULT '📦',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(couple_id, name)
);

-- 支出記録テーブル
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  split_ratio DECIMAL(3,2) DEFAULT 0.5 CHECK (split_ratio >= 0 AND split_ratio <= 1),
  is_settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 精算記録テーブル
CREATE TABLE IF NOT EXISTS settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  from_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  to_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CHECK (period_end >= period_start)
);

-- 精算対象支出の関連テーブル
CREATE TABLE IF NOT EXISTS settlement_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id UUID REFERENCES settlements(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(settlement_id, expense_id)
);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('settlement_reminder', 'settlement_request', 'settlement_completed', 'expense_added')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  settlement_id UUID REFERENCES settlements(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知設定テーブル
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  reminder_days INTEGER DEFAULT 3 CHECK (reminder_days > 0),
  auto_reminder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_expenses_couple ON expenses(couple_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_settlements_couple ON settlements(couple_id);
CREATE INDEX IF NOT EXISTS idx_settlements_from_user ON settlements(from_user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_to_user ON settlements(to_user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Row Level Security (RLS) の設定

-- usersテーブルのRLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- couplesテーブルのRLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own couples" ON couples
  FOR SELECT USING (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);
CREATE POLICY "Users can create couples" ON couples
  FOR INSERT WITH CHECK (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);
CREATE POLICY "Users can update own couples" ON couples
  FOR UPDATE USING (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);

-- categoriesテーブルのRLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view couple categories" ON categories
  FOR SELECT USING (
    couple_id IN (
      SELECT c.id FROM couples c
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );
CREATE POLICY "Users can manage couple categories" ON categories
  FOR ALL USING (
    couple_id IN (
      SELECT c.id FROM couples c
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );

-- expensesテーブルのRLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view couple expenses" ON expenses
  FOR SELECT USING (
    couple_id IN (
      SELECT c.id FROM couples c
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );
CREATE POLICY "Users can manage couple expenses" ON expenses
  FOR ALL USING (
    couple_id IN (
      SELECT c.id FROM couples c
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );

-- settlementsテーブルのRLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view couple settlements" ON settlements
  FOR SELECT USING (
    couple_id IN (
      SELECT c.id FROM couples c
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );
CREATE POLICY "Users can manage couple settlements" ON settlements
  FOR ALL USING (
    couple_id IN (
      SELECT c.id FROM couples c
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );

-- settlement_expensesテーブルのRLS
ALTER TABLE settlement_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view settlement expenses" ON settlement_expenses
  FOR SELECT USING (
    settlement_id IN (
      SELECT s.id FROM settlements s
      JOIN couples c ON s.couple_id = c.id
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );
CREATE POLICY "Users can manage settlement expenses" ON settlement_expenses
  FOR ALL USING (
    settlement_id IN (
      SELECT s.id FROM settlements s
      JOIN couples c ON s.couple_id = c.id
      WHERE auth.uid()::text = c.user1_id OR auth.uid()::text = c.user2_id
    )
  );

-- notificationsテーブルのRLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- notification_settingsテーブルのRLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage own notification settings" ON notification_settings
  FOR ALL USING (auth.uid()::text = user_id);

-- デフォルトカテゴリの挿入用ファンクション
CREATE OR REPLACE FUNCTION create_default_categories(couple_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (couple_id, name, color, icon, is_default) VALUES
    (couple_uuid, '食費', 'bg-red-100 text-red-800', '🍽️', TRUE),
    (couple_uuid, '交通費', 'bg-blue-100 text-blue-800', '🚗', TRUE),
    (couple_uuid, '買い物', 'bg-green-100 text-green-800', '🛒', TRUE),
    (couple_uuid, '娯楽', 'bg-purple-100 text-purple-800', '🎬', TRUE),
    (couple_uuid, '公共料金', 'bg-yellow-100 text-yellow-800', '⚡', TRUE),
    (couple_uuid, '医療費', 'bg-pink-100 text-pink-800', '🏥', TRUE),
    (couple_uuid, 'その他', 'bg-gray-100 text-gray-800', '📦', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- カップル作成時にデフォルトカテゴリを自動作成するトリガー
CREATE OR REPLACE FUNCTION trigger_create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_couple_created
  AFTER INSERT ON couples
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_categories();

-- ユーザー作成時にデフォルト通知設定を作成するトリガー
CREATE OR REPLACE FUNCTION trigger_create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_notification_settings();

-- 精算完了時に支出を精算済みにするトリガー
CREATE OR REPLACE FUNCTION trigger_mark_expenses_settled()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE expenses 
    SET is_settled = TRUE 
    WHERE id IN (
      SELECT expense_id FROM settlement_expenses 
      WHERE settlement_id = NEW.id
    );
    
    -- 完了日時を設定
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_settlement_completed
  BEFORE UPDATE ON settlements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_mark_expenses_settled();

-- リアルタイム更新の有効化
ALTER publication supabase_realtime ADD TABLE expenses;
ALTER publication supabase_realtime ADD TABLE settlements;
ALTER publication supabase_realtime ADD TABLE notifications;