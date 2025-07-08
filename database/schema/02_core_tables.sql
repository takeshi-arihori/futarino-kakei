-- コアテーブル：カップル関係と支出カテゴリ

-- カップル関係テーブル
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT,
  invite_code TEXT UNIQUE,
  invite_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- 支出カテゴリテーブル
CREATE TABLE expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT NOT NULL DEFAULT '💰',
  is_default BOOLEAN DEFAULT FALSE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- デフォルトカテゴリまたはカップル固有カテゴリのどちらか
  CONSTRAINT category_ownership CHECK (
    (is_default = TRUE AND couple_id IS NULL) OR 
    (is_default = FALSE AND couple_id IS NOT NULL)
  )
);

-- 招待システム用の関数：招待コード生成
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- カップルのインデックス
CREATE INDEX couples_user1_id_idx ON couples(user1_id);
CREATE INDEX couples_user2_id_idx ON couples(user2_id);
CREATE INDEX couples_invite_code_idx ON couples(invite_code);
CREATE INDEX couples_status_idx ON couples(status);

-- カテゴリのインデックス
CREATE INDEX expense_categories_couple_id_idx ON expense_categories(couple_id);
CREATE INDEX expense_categories_is_default_idx ON expense_categories(is_default);

-- 更新日時トリガーの適用
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();