'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const { user, couple } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setLoading(false);

      // すでにカップルがある場合はダッシュボードへリダイレクト
      if (couple) {
        router.push('/dashboard');
      }
    }
  }, [user, couple, router]);

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

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-extrabold text-gray-900 mb-4'>
            ふたりの家計へようこそ！
          </h1>
          <p className='text-xl text-gray-600'>
            {user.name}さん、アカウント作成が完了しました
          </p>
        </div>

        <div className='bg-white shadow rounded-lg p-8 mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            次に進む手順を選択してください
          </h2>

          <div className='grid gap-6 md:grid-cols-2'>
            {/* カップル作成 */}
            <div className='border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors'>
              <div className='text-center'>
                <div className='text-4xl mb-4'>👫</div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  新しいカップルを作成
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  カップルを作成して招待コードを生成し、パートナーを招待します
                </p>
                <Link
                  href='/couple/create'
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  カップルを作成
                </Link>
              </div>
            </div>

            {/* カップル参加 */}
            <div className='border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors'>
              <div className='text-center'>
                <div className='text-4xl mb-4'>🎫</div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  カップルに参加
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  パートナーから受け取った招待コードを使ってカップルに参加します
                </p>
                <Link
                  href='/invite'
                  className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  招待コードで参加
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className='bg-white shadow rounded-lg p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            ふたりの家計でできること
          </h2>

          <div className='grid gap-6 md:grid-cols-3'>
            <div className='text-center'>
              <div className='text-3xl mb-3'>💰</div>
              <h3 className='font-semibold text-gray-900 mb-2'>支出記録</h3>
              <p className='text-sm text-gray-600'>
                日々の支出を簡単に記録・分類できます
              </p>
            </div>

            <div className='text-center'>
              <div className='text-3xl mb-3'>🔄</div>
              <h3 className='font-semibold text-gray-900 mb-2'>自動精算</h3>
              <p className='text-sm text-gray-600'>
                支出の分担を自動計算して精算できます
              </p>
            </div>

            <div className='text-center'>
              <div className='text-3xl mb-3'>📊</div>
              <h3 className='font-semibold text-gray-900 mb-2'>家計分析</h3>
              <p className='text-sm text-gray-600'>
                グラフで家計の状況を可視化します
              </p>
            </div>
          </div>
        </div>

        <div className='text-center mt-8'>
          <p className='text-sm text-gray-500'>
            後からいつでも設定を変更できます
          </p>
        </div>
      </div>
    </div>
  );
}
