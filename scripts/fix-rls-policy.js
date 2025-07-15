// RLS（Row Level Security）ポリシーの修正
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('RLSポリシー確認・修正...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicy() {
  try {
    console.log('\n=== RLSポリシー確認 ===');
    
    // Service Role KeyでusersテーブルへのINSERTを試行
    const testUserId = 'test-rls-' + Date.now();
    
    console.log('Service Role Keyでの直接INSERT試行...');
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'test-rls@example.com',
        name: 'RLS Test User',
        email_verified: new Date().toISOString(),
        image: null,
      })
      .select();

    if (error) {
      console.error('❌ RLSエラー:', error.message);
      console.log('詳細:', error);
      
      console.log('\n💡 解決策:');
      console.log('1. Supabaseダッシュボード > Table Editor > users');
      console.log('2. Settings > RLS disabled にする（開発環境の場合）');
      console.log('3. または適切なRLSポリシーを設定する');
      console.log('\n推奨RLSポリシー:');
      console.log('Policy name: Enable insert for service role');
      console.log('Command: INSERT');
      console.log('Target roles: service_role');
      console.log('Policy definition: true');
    } else {
      console.log('✅ INSERT成功:', data[0].id);
      
      // テストデータを削除
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', testUserId);
        
      if (deleteError) {
        console.warn('⚠️  テストデータ削除失敗:', deleteError.message);
      } else {
        console.log('🗑️  テストデータを削除しました');
      }
    }

  } catch (error) {
    console.error('❌ 予期しないエラー:', error.message);
  }
}

fixRLSPolicy();