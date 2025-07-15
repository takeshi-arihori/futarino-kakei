// Supabase設定確認スクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase設定確認中...');
console.log('URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceKey ? '設定済み' : '未設定');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSupabaseConfig() {
  try {
    // 認証設定を確認（管理者APIを使用）
    console.log('\n=== Supabase接続テスト ===');
    
    // テスト用ユーザー作成（既存の場合はエラーを無視）
    const testEmail = 'test-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';
    
    console.log(`\nテスト用ユーザー作成: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // メール確認をスキップ
      user_metadata: {
        name: 'Test User'
      }
    });

    if (authError) {
      console.error('❌ 認証エラー:', authError.message);
      console.log('詳細:', authError);
      
      // より詳細なエラー情報
      if (authError.message.includes('invalid')) {
        console.log('\n💡 推奨解決策:');
        console.log('1. Supabaseダッシュボード > Authentication > Settings');
        console.log('2. "Enable email confirmations" をオフにする');
        console.log('3. "Email Auth" が有効になっていることを確認');
      }
    } else {
      console.log('✅ ユーザー作成成功:', authData.user.id);
      
      // 作成したテストユーザーを削除
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      if (deleteError) {
        console.warn('⚠️  テストユーザー削除に失敗:', deleteError.message);
      } else {
        console.log('🗑️  テストユーザーを削除しました');
      }
    }

    // ユーザーテーブルの存在確認
    console.log('\n=== データベーステーブル確認 ===');
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (dbError) {
      console.error('❌ usersテーブルエラー:', dbError.message);
      console.log('💡 usersテーブルが存在しない可能性があります');
    } else {
      console.log('✅ usersテーブル接続成功');
    }

  } catch (error) {
    console.error('❌ 設定確認エラー:', error.message);
  }
}

checkSupabaseConfig();