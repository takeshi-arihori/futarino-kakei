'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/onboarding');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white'>
      {/* ヘッダー */}
      <header className='relative overflow-hidden bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-gray-900'>ふたりの家計</h1>
            </div>
            <div className='space-x-4'>
              <Link
                href='/signin'
                className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium'
              >
                ログイン
              </Link>
              <Link
                href='/signup'
                className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium'
                style={{ color: 'white' }}
              >
                はじめる
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        {/* ヒーローセクション */}
        <div className='relative overflow-hidden'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24'>
            <div className='text-center'>
              <h1 className='text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl'>
                <span className='block'>ふたりで始める</span>
                <span className='block text-blue-600'>かんたん家計管理</span>
              </h1>
              <p className='mt-6 text-xl text-gray-500 max-w-3xl mx-auto'>
                カップル・夫婦専用の家計管理アプリ。支出の記録から面倒な精算まで、すべてをスマートに解決します。
              </p>
              <div className='mt-10 flex justify-center space-x-4'>
                <Link
                  href='/signup'
                  className='bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-md text-lg font-medium shadow-lg hover:shadow-xl transition-all'
                  style={{ color: 'white' }}
                >
                  無料で始める
                </Link>
                <Link
                  href='/signin'
                  className='bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-md text-lg font-medium shadow-lg hover:shadow-xl transition-all'
                >
                  ログイン
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 機能紹介セクション */}
        <div className='py-16 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-extrabold text-gray-900'>
                ふたりの家計でできること
              </h2>
              <p className='mt-4 text-lg text-gray-600'>
                二人の生活をもっと豊かにする機能がそろっています
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-3'>
              {/* 支出記録 */}
              <div className='text-center p-6'>
                <div className='text-6xl mb-4'>💰</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  簡単支出記録
                </h3>
                <p className='text-gray-600'>
                  日々の支出をカテゴリ別に記録。レシート撮影機能で入力もラクラク。
                </p>
              </div>

              {/* 自動精算 */}
              <div className='text-center p-6'>
                <div className='text-6xl mb-4'>🔄</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  自動精算機能
                </h3>
                <p className='text-gray-600'>
                  支出の分担比率を設定して、自動で精算金額を計算。もうお金の計算で悩まない。
                </p>
              </div>

              {/* リアルタイム同期 */}
              <div className='text-center p-6'>
                <div className='text-6xl mb-4'>📱</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  リアルタイム同期
                </h3>
                <p className='text-gray-600'>
                  パートナーが入力した支出情報はリアルタイムで同期。いつでも最新の家計状況を確認。
                </p>
              </div>

              {/* 家計分析 */}
              <div className='text-center p-6'>
                <div className='text-6xl mb-4'>📊</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  家計分析レポート
                </h3>
                <p className='text-gray-600'>
                  月別・カテゴリ別の支出をグラフで可視化。家計の傾向を把握して賢い節約を。
                </p>
              </div>

              {/* 予算管理 */}
              <div className='text-center p-6'>
                <div className='text-6xl mb-4'>🎯</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  予算管理
                </h3>
                <p className='text-gray-600'>
                  カテゴリ別に予算を設定して支出をコントロール。目標達成をサポートします。
                </p>
              </div>

              {/* セキュリティ */}
              <div className='text-center p-6'>
                <div className='text-6xl mb-4'>🔒</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  安心セキュリティ
                </h3>
                <p className='text-gray-600'>
                  カップル間でのみデータを共有。プライバシーを守りながら安全に家計管理。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA セクション */}
        <div className='bg-blue-600'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
            <div className='text-center'>
              <h2 className='text-3xl font-extrabold text-white'>
                今すぐふたりの家計を始めませんか？
              </h2>
              <p className='mt-4 text-xl text-blue-200'>
                無料で始められます。クレジットカードは不要です。
              </p>
              <div className='mt-8'>
                <Link
                  href='/signup'
                  className='bg-white hover:bg-gray-100 px-8 py-3 rounded-md text-lg font-medium shadow-lg hover:shadow-xl transition-all'
                  style={{ color: 'white' }}
                >
                  無料アカウントを作成
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className='bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center text-gray-500 text-sm'>
            <p>&copy; 2025 ふたりの家計. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
