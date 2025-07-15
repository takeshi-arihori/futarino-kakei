# RLSポリシーデバッグガイド

## 問題の確認

現在のエラー内容：
- ユーザー認証は成功する
- usersテーブルへのINSERT操作がRLSにより拒否される
- Service Role Keyを使用してもRLSが動作している

## Supabaseダッシュボードで確認すべき項目

### 1. usersテーブルのRLS設定確認
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
```

### 2. 既存のRLSポリシー確認
```sql
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
WHERE tablename = 'users';
```

### 3. Service Role Keyの動作確認
```sql
-- SQL Editorで実行してService Role Keyが正しく動作するか確認
SELECT auth.jwt() ->> 'role' as current_role;
```

## 修正方法

### オプション1: 一時的にRLSを無効化（開発環境のみ）
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### オプション2: 適切なRLSポリシーを作成
```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 新しいポリシーを作成
CREATE POLICY "Enable all for service role" ON users
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (
    auth.uid()::text = id
  );

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (
    auth.uid()::text = id
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (
    auth.uid()::text = id
  );
```

### オプション3: 完全に新しいポリシー（推奨）
```sql
-- 全てのポリシーを削除
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Enable all for service role" ON users;

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Service Role用のポリシー（最優先）
CREATE POLICY "service_role_access" ON users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 認証ユーザー用のポリシー
CREATE POLICY "authenticated_user_access" ON users
  FOR ALL TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);
```

## 確認コマンド

修正後、以下のクエリで確認：
```sql
-- ポリシーが正しく作成されているか確認
SELECT policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- RLSが有効になっているか確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
```