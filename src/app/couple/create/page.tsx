'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function CreateCouplePage() {
  const [coupleName, setCoupleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);

  const router = useRouter();
  const { createCouple, user } = useAuth();

  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/signin?callbackUrl=/couple/create');
      return;
    }

    if (!coupleName.trim()) {
      setError('カップル名を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const couple = await createCouple(coupleName.trim());
      setInviteCode(couple.invite_code || '');
      setShowInviteCode(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'カップルの作成に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      alert('招待コードをコピーしました！');
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const shareInviteCode = async () => {
    const shareUrl = `${window.location.origin}/invite?code=${inviteCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ふたりの家計 - カップル招待',
          text: `招待コード: ${inviteCode}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('共有に失敗しました:', err);
      }
    } else {
      // Web Share API が利用できない場合はクリップボードにコピー
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('招待URLをコピーしました！');
      } catch (err) {
        console.error('コピーに失敗しました:', err);
      }
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded'>
            カップルを作成するには、まず
            <Link href='/signin' className='font-medium underline ml-1'>
              ログイン
            </Link>
            してください。
          </div>
        </div>
      </div>
    );
  }

  if (showInviteCode) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
              カップルを作成しました！
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              パートナーに招待コードを共有してカップルに招待しましょう
            </p>
          </div>

          <div className='bg-white shadow rounded-lg p-6 space-y-4'>
            <div className='text-center'>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                招待コード
              </h3>
              <div className='bg-gray-100 rounded-lg p-4 font-mono text-2xl tracking-wider text-center'>
                {inviteCode}
              </div>
              <p className='mt-2 text-xs text-gray-500'>
                このコードは7日間有効です
              </p>
            </div>

            <div className='space-y-3'>
              <button
                onClick={copyInviteCode}
                className='w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                📋 コードをコピー
              </button>

              <button
                onClick={shareInviteCode}
                className='w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                📤 パートナーに共有
              </button>
            </div>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-4'>
              パートナーが参加するまでお待ちください
            </p>
            <Link
              href='/dashboard'
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            カップルを作成
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            二人の家計管理を始めましょう
          </p>
        </div>

        <form className='space-y-6' onSubmit={handleCreateCouple}>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor='coupleName'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              カップル名
            </label>
            <input
              id='coupleName'
              name='coupleName'
              type='text'
              required
              className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
              placeholder='例: 山田夫妻の家計、たろう＆はなこ'
              value={coupleName}
              onChange={e => setCoupleName(e.target.value)}
              maxLength={50}
            />
            <p className='mt-1 text-xs text-gray-500'>
              後から変更することもできます
            </p>
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
            >
              {loading ? '作成中...' : 'カップルを作成'}
            </button>
          </div>
        </form>

        <div className='text-center'>
          <p className='text-sm text-gray-600'>
            すでにパートナーがカップルを作成済みの場合は
          </p>
          <Link
            href='/invite'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            招待コードで参加
          </Link>
        </div>
      </div>
    </div>
  );
}
