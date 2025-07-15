'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

function InviteForm() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinCouple, user } = useAuth();

  // URLパラメータから招待コードを取得
  const codeFromUrl = searchParams.get('code');

  useEffect(() => {
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/signin?callbackUrl=/invite?code=' + inviteCode);
      return;
    }

    if (!inviteCode.trim()) {
      setError('招待コードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await joinCouple(inviteCode.trim().toUpperCase());
      setSuccess('カップルに参加しました！');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'カップルへの参加に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            カップルに参加
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            パートナーから送られた招待コードを入力してカップルに参加しましょう
          </p>
        </div>

        {!user && (
          <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded'>
            カップルに参加するには、まず
            <Link href='/signin' className='font-medium underline ml-1'>
              ログイン
            </Link>
            してください。
          </div>
        )}

        <form className='space-y-6' onSubmit={handleJoinCouple}>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded'>
              {success}
            </div>
          )}

          <div>
            <label
              htmlFor='inviteCode'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              招待コード
            </label>
            <input
              id='inviteCode'
              name='inviteCode'
              type='text'
              required
              className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center tracking-wider font-mono text-lg'
              placeholder='XXXXXXXX'
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              maxLength={8}
              style={{ letterSpacing: '0.2em' }}
            />
            <p className='mt-1 text-xs text-gray-500'>
              8文字の英数字コードを入力してください
            </p>
          </div>

          <div>
            <button
              type='submit'
              disabled={loading || !user}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
            >
              {loading ? '参加中...' : 'カップルに参加'}
            </button>
          </div>
        </form>

        <div className='text-center'>
          <p className='text-sm text-gray-600'>招待コードをお持ちでない方は</p>
          <Link
            href='/couple/create'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            新しいカップルを作成
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-gray-500'>読み込み中...</div>
        </div>
      }
    >
      <InviteForm />
    </Suspense>
  );
}
