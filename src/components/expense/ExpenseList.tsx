'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  user_name: string;
  split_ratio: number;
  is_settled: boolean;
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

export default function ExpenseList() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'settled' | 'unsettled'>('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      // TODO: 実際のAPIコール
      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockExpenses: Expense[] = [
        {
          id: '1',
          amount: 1500,
          description: '昼食',
          category: 'food',
          date: '2025-01-08',
          user_name: 'あなた',
          split_ratio: 0.5,
          is_settled: false,
        },
        {
          id: '2',
          amount: 3000,
          description: 'ガソリン代',
          category: 'transport',
          date: '2025-01-07',
          user_name: 'パートナー',
          split_ratio: 0.6,
          is_settled: true,
        },
        {
          id: '3',
          amount: 2500,
          description: '映画鑑賞',
          category: 'entertainment',
          date: '2025-01-06',
          user_name: 'あなた',
          split_ratio: 0.5,
          is_settled: false,
        },
      ];

      setExpenses(mockExpenses);
    } catch (error) {
      console.error('支出データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expense: Expense) => {
    try {
      // TODO: 実際のAPIコール
      console.log('削除対象:', expense.id);

      // 模擬的な削除処理
      await new Promise(resolve => setTimeout(resolve, 500));

      setExpenses(prev => prev.filter(e => e.id !== expense.id));
      setShowDeleteModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('支出の削除に失敗しました:', error);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'settled') return expense.is_settled;
    if (filter === 'unsettled') return !expense.is_settled;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>読み込み中...</span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* フィルター */}
      <div className='flex space-x-2'>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size='sm'
          onClick={() => setFilter('all')}
        >
          すべて
        </Button>
        <Button
          variant={filter === 'unsettled' ? 'primary' : 'outline'}
          size='sm'
          onClick={() => setFilter('unsettled')}
        >
          精算待ち
        </Button>
        <Button
          variant={filter === 'settled' ? 'primary' : 'outline'}
          size='sm'
          onClick={() => setFilter('settled')}
        >
          精算済み
        </Button>
      </div>

      {/* 支出一覧 */}
      {filteredExpenses.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>支出データがありません</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filteredExpenses.map(expense => {
            const category =
              DEFAULT_CATEGORIES[
                expense.category as keyof typeof DEFAULT_CATEGORIES
              ];
            return (
              <div
                key={expense.id}
                className='border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => router.push(`/expenses/${expense.id}`)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>{category?.icon}</div>
                    <div>
                      <h3 className='font-medium text-gray-900'>
                        {expense.description}
                      </h3>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <span>{formatDate(expense.date)}</span>
                        <span>•</span>
                        <span>{expense.user_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3'>
                    <Badge variant={category?.name ? 'default' : 'info'}>
                      {category?.name || expense.category}
                    </Badge>

                    <div className='text-right'>
                      <div className='font-bold text-lg'>
                        ¥{expense.amount.toLocaleString()}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {expense.split_ratio === 0.5
                          ? '半分'
                          : `${Math.round(expense.split_ratio * 100)}%`}
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Badge
                        variant={expense.is_settled ? 'success' : 'warning'}
                      >
                        {expense.is_settled ? '精算済み' : '精算待ち'}
                      </Badge>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedExpense(expense);
                          setShowDeleteModal(true);
                        }}
                        className='text-red-600 hover:text-red-800 p-1'
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          {selectedExpense && (
            <div className='bg-gray-50 p-3 rounded'>
              <p className='font-medium'>{selectedExpense.description}</p>
              <p className='text-sm text-gray-600'>
                ¥{selectedExpense.amount.toLocaleString()} -{' '}
                {formatDate(selectedExpense.date)}
              </p>
            </div>
          )}
          <div className='flex space-x-3'>
            <Button
              variant='destructive'
              onClick={() => selectedExpense && handleDelete(selectedExpense)}
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
