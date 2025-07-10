'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ExpenseForm from './ExpenseForm';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  user_name: string;
  split_ratio: number;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_CATEGORIES = {
  food: { name: '食費', color: 'bg-red-100 text-red-800', icon: '🍽️' },
  transport: { name: '交通費', color: 'bg-blue-100 text-blue-800', icon: '🚗' },
  shopping: {
    name: '買い物',
    color: 'bg-green-100 text-green-800',
    icon: '🛒',
  },
  entertainment: {
    name: '娯楽',
    color: 'bg-purple-100 text-purple-800',
    icon: '🎬',
  },
  utilities: {
    name: '公共料金',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⚡',
  },
  medical: { name: '医療費', color: 'bg-pink-100 text-pink-800', icon: '🏥' },
  other: { name: 'その他', color: 'bg-gray-100 text-gray-800', icon: '📦' },
};

interface ExpenseDetailProps {
  expenseId: string;
}

export default function ExpenseDetail({ expenseId }: ExpenseDetailProps) {
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseId]);

  const fetchExpense = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('取得対象ID:', expenseId);

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockExpense: Expense = {
        id: expenseId,
        amount: 1500,
        description: '昼食',
        category: 'food',
        date: '2025-01-08',
        user_name: 'あなた',
        split_ratio: 0.5,
        is_settled: false,
        created_at: '2025-01-08T12:00:00Z',
        updated_at: '2025-01-08T12:00:00Z',
      };

      setExpense(mockExpense);
    } catch (err) {
      setError('支出データの取得に失敗しました');
      console.error('支出データの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(false);
    // リフレッシュして最新データを取得
    fetchExpense();
  };

  const handleDelete = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('削除対象ID:', expenseId);

      // 模擬的な削除処理
      await new Promise(resolve => setTimeout(resolve, 500));

      setShowDeleteModal(false);
      router.push('/expenses');
    } catch (err) {
      setError('支出の削除に失敗しました');
      console.error('支出の削除に失敗:', err);
    }
  };

  const handleSettlement = async () => {
    if (!expense) return;

    try {
      // TODO: 実際のAPIコール
      console.log('精算処理:', expenseId);

      // 模擬的な精算処理
      await new Promise(resolve => setTimeout(resolve, 1000));

      setExpense(prev => (prev ? { ...prev, is_settled: true } : null));
    } catch (err) {
      setError('精算処理に失敗しました');
      console.error('精算処理に失敗:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
        {error}
      </div>
    );
  }

  if (!expense) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <p>支出データが見つかりません</p>
      </div>
    );
  }

  const category =
    DEFAULT_CATEGORIES[expense.category as keyof typeof DEFAULT_CATEGORIES];

  return (
    <div className='space-y-6'>
      {/* 基本情報 */}
      <div className='bg-white border rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <div className='text-3xl'>{category?.icon}</div>
            <div>
              <h3 className='text-xl font-bold text-gray-900'>
                {expense.description}
              </h3>
              <p className='text-sm text-gray-600'>
                {formatDate(expense.date)}
              </p>
            </div>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-gray-900'>
              ¥{expense.amount.toLocaleString()}
            </div>
            <Badge variant={expense.is_settled ? 'success' : 'warning'}>
              {expense.is_settled ? '精算済み' : '精算待ち'}
            </Badge>
          </div>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className='bg-white border rounded-lg p-6 space-y-4'>
        <h4 className='font-semibold text-gray-900'>詳細情報</h4>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <span className='text-sm font-medium text-gray-500'>カテゴリ</span>
            <div className='mt-1'>
              <Badge variant='default'>
                {category?.name || expense.category}
              </Badge>
            </div>
          </div>

          <div>
            <span className='text-sm font-medium text-gray-500'>支払者</span>
            <p className='mt-1 text-sm text-gray-900'>{expense.user_name}</p>
          </div>

          <div>
            <span className='text-sm font-medium text-gray-500'>分担比率</span>
            <p className='mt-1 text-sm text-gray-900'>
              {expense.split_ratio === 0.5
                ? '半分ずつ'
                : `あなた: ${Math.round(expense.split_ratio * 100)}%`}
            </p>
          </div>

          <div>
            <span className='text-sm font-medium text-gray-500'>
              あなたの負担額
            </span>
            <p className='mt-1 text-sm font-bold text-gray-900'>
              ¥
              {Math.round(
                expense.amount * expense.split_ratio
              ).toLocaleString()}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
          <div>
            <span className='text-sm font-medium text-gray-500'>作成日時</span>
            <p className='mt-1 text-xs text-gray-600'>
              {formatDateTime(expense.created_at)}
            </p>
          </div>

          <div>
            <span className='text-sm font-medium text-gray-500'>更新日時</span>
            <p className='mt-1 text-xs text-gray-600'>
              {formatDateTime(expense.updated_at)}
            </p>
          </div>
        </div>
      </div>

      {/* アクション */}
      <div className='flex space-x-3'>
        <Button
          variant='primary'
          onClick={() => setShowEditModal(true)}
          className='flex-1'
        >
          編集
        </Button>

        {!expense.is_settled && (
          <Button
            variant='outline'
            onClick={handleSettlement}
            className='flex-1'
          >
            精算済みにする
          </Button>
        )}

        <Button
          variant='destructive'
          onClick={() => setShowDeleteModal(true)}
          className='flex-1'
        >
          削除
        </Button>
      </div>

      {/* 編集モーダル */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='支出を編集'
        size='lg'
      >
        <ExpenseForm
          onSubmit={handleEdit}
          initialData={{
            id: expense.id,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: expense.date,
            split_ratio: expense.split_ratio,
          }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title='支出を削除'
      >
        <div className='space-y-4'>
          <p className='text-gray-700'>
            この支出を削除してもよろしいですか？この操作は元に戻せません。
          </p>
          <div className='bg-gray-50 p-3 rounded'>
            <p className='font-medium'>{expense.description}</p>
            <p className='text-sm text-gray-600'>
              ¥{expense.amount.toLocaleString()} - {formatDate(expense.date)}
            </p>
          </div>
          <div className='flex space-x-3'>
            <Button
              variant='destructive'
              onClick={handleDelete}
              className='flex-1'
            >
              削除
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowDeleteModal(false)}
              className='flex-1'
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
