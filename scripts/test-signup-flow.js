// 通常のサインアップフローをテスト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('通常のサインアップフローテスト...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignupFlow() {
  try {
    const testEmail = 'test-signup-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';
    
    console.log(`\nテスト: ${testEmail}`);
    
    // 通常のサインアップを試行
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });

    if (error) {
      console.error('❌ サインアップエラー:', error.message);
      console.log('エラー詳細:', error);
      
      // 具体的なエラーコードをチェック
      if (error.message.includes('Email rate limit exceeded')) {
        console.log('\n💡 解決策: メール送信レート制限に達しています。少し待ってから再試行してください。');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\n💡 解決策: メール確認が必要です。開発環境では無効化することをお勧めします。');
      } else if (error.message.includes('Signup is disabled')) {
        console.log('\n💡 解決策: サインアップが無効になっています。Supabaseダッシュボードで有効化してください。');
      } else if (error.message.includes('Invalid email')) {
        console.log('\n💡 解決策: メールアドレスの形式が無効です。');
      }
    } else {
      console.log('✅ サインアップ成功!');
      console.log('ユーザーID:', data.user?.id);
      console.log('メール確認が必要:', !data.user?.email_confirmed_at);
      
      if (data.session) {
        console.log('✅ セッション作成済み');
      } else {
        console.log('⚠️  セッション未作成（メール確認待ち）');
      }
    }

  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

testSignupFlow();