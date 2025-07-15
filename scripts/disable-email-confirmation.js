// メール確認を無効化する設定（開発環境用）
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('開発環境向けメール確認設定...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function configureEmailSettings() {
  try {
    console.log('\n=== メール確認無効化設定 ===');
    
    // テストユーザーを作成してメール確認済みに設定
    const testEmail = 'dev-test-' + Date.now() + '@gmail.com';
    const testPassword = 'testpassword123';
    
    console.log(`テストユーザー作成: ${testEmail}`);
    
    // Admin APIでユーザー作成（メール確認済み）
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // メール確認をスキップ
      user_metadata: {
        name: 'Dev Test User'
      }
    });

    if (userError) {
      console.error('❌ ユーザー作成エラー:', userError.message);
      return;
    }

    console.log('✅ メール確認済みユーザー作成成功:', userData.user.id);
    
    // usersテーブルにも登録
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: userData.user.id,
        email: userData.user.email,
        name: 'Dev Test User',
        email_verified: userData.user.email_confirmed_at,
        image: null,
      });

    if (dbError) {
      console.warn('⚠️  usersテーブル登録エラー:', dbError.message);
    } else {
      console.log('✅ usersテーブル登録成功');
    }

    console.log('\n📧 開発環境での推奨設定:');
    console.log('1. Supabaseダッシュボード > Authentication > Settings');
    console.log('2. "Enable email confirmations" をオフにする');
    console.log('3. または開発時はAdmin APIを使用してユーザー作成');
    
    console.log('\n🧪 テストアカウント:');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log('このアカウントはメール確認済みでログイン可能です');

  } catch (error) {
    console.error('❌ 設定エラー:', error.message);
  }
}

configureEmailSettings();