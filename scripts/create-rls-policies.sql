-- Supabaseダッシュボードで実行するRLSポリシー作成スクリプト

-- 1. usersテーブルにRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. 認証されたユーザーが自分のレコードを作成できるポリシー
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 3. 認証されたユーザーが自分のレコードを読取できるポリシー
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

-- 4. 認証されたユーザーが自分のレコードを更新できるポリシー
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- 5. サービスロールでの操作を許可（管理者権限）
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. couplesテーブルのRLSポリシーも作成
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーがカップルを作成できるポリシー
CREATE POLICY "Users can create couples" ON couples
    FOR INSERT WITH CHECK (auth.uid()::text = user1_id);

-- 認証されたユーザーが自分のカップルを読取できるポリシー
CREATE POLICY "Users can view their couples" ON couples
    FOR SELECT USING (
        auth.uid()::text = user1_id OR auth.uid()::text = user2_id
    );

-- 認証されたユーザーが自分のカップルを更新できるポリシー
CREATE POLICY "Users can update their couples" ON couples
    FOR UPDATE USING (
        auth.uid()::text = user1_id OR auth.uid()::text = user2_id
    );

-- サービスロールでの操作を許可
CREATE POLICY "Service role can manage all couples" ON couples
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 7. 現在のポリシーを確認するクエリ
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'couples');