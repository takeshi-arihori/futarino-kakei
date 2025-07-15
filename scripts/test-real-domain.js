// 実際のドメインでサインアップテスト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('実際のドメインでサインアップテスト...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealDomainSignup() {
  try {
    // 実際に存在するドメインを使用
    const testEmail = 'test-' + Date.now() + '@gmail.com';
    const testPassword = 'testpassword123';
    
    console.log(`\nテスト: ${testEmail}`);
    
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
      console.log('エラーコード:', error.code);
      console.log('エラー詳細:', error);
    } else {
      console.log('✅ サインアップ成功!');
      console.log('ユーザーID:', data.user?.id);
      console.log('メール確認済み:', !!data.user?.email_confirmed_at);
      console.log('セッション作成:', !!data.session);
      
      if (!data.session) {
        console.log('📧 メール確認が必要です');
      }
    }

  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

testRealDomainSignup();