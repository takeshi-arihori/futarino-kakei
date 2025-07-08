-- デフォルト支出カテゴリのシードデータ

INSERT INTO expense_categories (name, color, icon, is_default) VALUES
-- 食費・日用品
('食費', '#EF4444', '🍽️', true),
('外食', '#F97316', '🍔', true),
('日用品', '#84CC16', '🧴', true),
('スーパー', '#22C55E', '🛒', true),

-- 交通・移動
('交通費', '#3B82F6', '🚃', true),
('ガソリン', '#6366F1', '⛽', true),
('タクシー', '#8B5CF6', '🚕', true),

-- 娯楽・趣味
('娯楽', '#EC4899', '🎮', true),
('映画', '#F43F5E', '🎬', true),
('旅行', '#06B6D4', '✈️', true),
('本・雑誌', '#10B981', '📚', true),

-- 健康・美容
('医療費', '#DC2626', '🏥', true),
('薬代', '#EF4444', '💊', true),
('美容', '#F59E0B', '💄', true),
('ジム', '#059669', '💪', true),

-- 衣類・装身具
('衣類', '#7C3AED', '👔', true),
('靴', '#BE185D', '👟', true),
('アクセサリー', '#DB2777', '💎', true),

-- 住居・光熱費
('家賃', '#1F2937', '🏠', true),
('電気代', '#FBBF24', '⚡', true),
('ガス代', '#F59E0B', '🔥', true),
('水道代', '#0EA5E9', '💧', true),
('インターネット', '#6B7280', '📶', true),

-- その他
('教育', '#16A34A', '📖', true),
('保険', '#0D9488', '🛡️', true),
('税金', '#991B1B', '📊', true),
('投資', '#059669', '📈', true),
('貯金', '#065F46', '💰', true),
('プレゼント', '#C2185B', '🎁', true),
('その他', '#6B7280', '❓', true);

-- 使用頻度の統計を追加するためのテーブル（将来的な機能拡張用）
CREATE TABLE category_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(couple_id, category_id)
);

-- カテゴリ使用統計のインデックス
CREATE INDEX category_usage_stats_couple_id_idx ON category_usage_stats(couple_id);
CREATE INDEX category_usage_stats_category_id_idx ON category_usage_stats(category_id);
CREATE INDEX category_usage_stats_usage_count_idx ON category_usage_stats(usage_count DESC);

-- カテゴリ使用統計の更新トリガー
CREATE TRIGGER update_category_usage_stats_updated_at BEFORE UPDATE ON category_usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- カテゴリ使用統計のRLS
ALTER TABLE category_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple category stats" ON category_usage_stats
  FOR SELECT USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage couple category stats" ON category_usage_stats
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- 支出作成時にカテゴリ使用統計を更新する関数
CREATE OR REPLACE FUNCTION update_category_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO category_usage_stats (couple_id, category_id, usage_count, last_used_at)
  VALUES (NEW.couple_id, NEW.category_id, 1, NEW.created_at)
  ON CONFLICT (couple_id, category_id) 
  DO UPDATE SET 
    usage_count = category_usage_stats.usage_count + 1,
    last_used_at = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 支出作成時のカテゴリ使用統計更新トリガー
CREATE TRIGGER expense_category_usage_trigger AFTER INSERT ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_category_usage();