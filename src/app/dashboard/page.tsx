'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { user, couple } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setLoading(false);

      // カップルがない場合はオンボーディングへ
      if (!couple) {
        router.push('/onboarding');
      }
    }
  }, [user, couple, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/signin');
    return null;
  }

  if (!couple) {
    return null; // リダイレクト中
  }

  // Mock partner user - in real implementation, this would be fetched from the database
  const partnerUser = { name: 'パートナー', email: 'partner@example.com' };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* ヘッダー */}
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>ふたりの家計</h1>
              <p className='text-sm text-gray-600'>{couple.name}</p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-600'>{user.name}さん</div>
              <button
                onClick={handleSignOut}
                className='text-gray-400 hover:text-gray-600'
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ウェルカムメッセージ */}
        <div className='bg-white rounded-lg shadow p-6 mb-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            おかえりなさい、{user.name}さん！
          </h2>
          {partnerUser ? (
            <p className='text-gray-600'>
              {partnerUser.name}さんと一緒に家計管理を始めましょう。
            </p>
          ) : (
            <div className='text-yellow-600'>
              <p className='mb-2'>パートナーがまだ参加していません。</p>
              <p className='text-sm'>
                招待コードを共有してパートナーを招待しましょう。
              </p>
            </div>
          )}
        </div>

        {/* 機能カード */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* 支出記録 */}
          <div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow'>
            <div className='text-center'>
              <div className='text-4xl mb-4'>💰</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                支出を記録
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                日々の支出をカテゴリ別に記録
              </p>
              <button className='w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                支出を追加
              </button>
            </div>
          </div>

          {/* 支出一覧 */}
          <div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow'>
            <div className='text-center'>
              <div className='text-4xl mb-4'>📋</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                支出履歴
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                これまでの支出を確認・編集
              </p>
              <button className='w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                履歴を見る
              </button>
            </div>
          </div>

          {/* 精算 */}
          <div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow'>
            <div className='text-center'>
              <div className='text-4xl mb-4'>🔄</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                精算管理
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                支出の分担と精算を管理
              </p>
              <button className='w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                精算する
              </button>
            </div>
          </div>

          {/* 統計・レポート */}
          <div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow'>
            <div className='text-center'>
              <div className='text-4xl mb-4'>📊</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                家計レポート
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                支出の分析とグラフ表示
              </p>
              <button className='w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                レポートを見る
              </button>
            </div>
          </div>

          {/* 設定 */}
          <div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow'>
            <div className='text-center'>
              <div className='text-4xl mb-4'>⚙️</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>設定</h3>
              <p className='text-sm text-gray-600 mb-4'>
                カテゴリや分担比率の設定
              </p>
              <button className='w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                設定を変更
              </button>
            </div>
          </div>

          {/* パートナー招待（パートナーがいない場合） */}
          {!partnerUser && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow'>
              <div className='text-center'>
                <div className='text-4xl mb-4'>👫</div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  パートナーを招待
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  招待コードを共有してパートナーを招待
                </p>
                <Link
                  href='/couple/create'
                  className='inline-block w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium'
                >
                  招待コードを確認
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 最近の活動（プレースホルダー） */}
        <div className='mt-8 bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            最近の活動
          </h3>
          <div className='text-center py-8 text-gray-500'>
            <p>まだ活動がありません</p>
            <p className='text-sm'>支出を記録して家計管理を始めましょう！</p>
          </div>
        </div>
      </main>
    </div>
  );
}
