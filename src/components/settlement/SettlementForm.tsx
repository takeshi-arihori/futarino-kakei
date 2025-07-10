'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface UnsettledExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  user_name: string;
  split_ratio: number;
  your_share: number;
}

interface SettlementFormProps {
  onSubmit: () => void;
}

export default function SettlementForm({ onSubmit }: SettlementFormProps) {
  const { data: session } = useSession();
  console.log('Current session:', session); // TODO: Remove in production
  const [unsettledExpenses, setUnsettledExpenses] = useState<
    UnsettledExpense[]
  >([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    period_start: '',
    period_end: '',
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUnsettledExpenses();
  }, []);

  const fetchUnsettledExpenses = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('未精算支出取得中...');

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockExpenses: UnsettledExpense[] = [
        {
          id: '1',
          amount: 2500,
          description: '昼食代',
          category: 'food',
          date: '2025-01-05',
          user_name: 'あなた',
          split_ratio: 0.5,
          your_share: 1250,
        },
        {
          id: '2',
          amount: 8000,
          description: '映画鑑賞',
          category: 'entertainment',
          date: '2025-01-06',
          user_name: 'パートナー',
          split_ratio: 0.5,
          your_share: 4000,
        },
        {
          id: '3',
          amount: 15000,
          description: '食材購入',
          category: 'shopping',
          date: '2025-01-07',
          user_name: 'あなた',
          split_ratio: 0.5,
          your_share: 7500,
        },
        {
          id: '4',
          amount: 3200,
          description: '交通費',
          category: 'transport',
          date: '2025-01-08',
          user_name: 'パートナー',
          split_ratio: 0.5,
          your_share: 1600,
        },
      ];

      setUnsettledExpenses(mockExpenses);

      // 期間の自動設定
      const dates = mockExpenses
        .map(e => new Date(e.date))
        .sort((a, b) => a.getTime() - b.getTime());
      if (dates.length > 0) {
        setFormData({
          period_start: dates[0].toISOString().split('T')[0],
          period_end: dates[dates.length - 1].toISOString().split('T')[0],
          note: '',
        });
      }
    } catch (err) {
      setError('未精算支出の取得に失敗しました');
      console.error('未精算支出の取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseToggle = (expenseId: string) => {
    setSelectedExpenses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedExpenses.size === unsettledExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(unsettledExpenses.map(e => e.id)));
    }
  };

  const calculateSettlementAmount = () => {
    const selectedExpensesList = unsettledExpenses.filter(e =>
      selectedExpenses.has(e.id)
    );

    const yourPayments = selectedExpensesList
      .filter(e => e.user_name === 'あなた')
      .reduce((sum, e) => sum + e.amount, 0);

    const partnerPayments = selectedExpensesList
      .filter(e => e.user_name === 'パートナー')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalAmount = yourPayments + partnerPayments;
    const yourShare = selectedExpensesList.reduce(
      (sum, e) => sum + e.your_share,
      0
    );
    const partnerShare = totalAmount - yourShare;

    return {
      yourPayments,
      partnerPayments,
      yourShare,
      partnerShare,
      balance: yourPayments - yourShare,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedExpenses.size === 0) {
      setError('精算対象の支出を選択してください');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const calculation = calculateSettlementAmount();

      // TODO: 実際のAPIコール
      console.log('精算作成:', {
        selectedExpenses: Array.from(selectedExpenses),
        calculation,
        formData,
      });

      // 模擬的な精算作成処理
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSubmit();
    } catch (err) {
      setError('精算の作成に失敗しました');
      console.error('精算の作成に失敗:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
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

  if (unsettledExpenses.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-600 mb-4'>未精算の支出がありません</p>
        <Button
          variant='outline'
          onClick={() => (window.location.href = '/expenses')}
        >
          支出を追加する
        </Button>
      </div>
    );
  }

  const calculation = calculateSettlementAmount();

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* 期間設定 */}
      <div className='grid grid-cols-2 gap-4'>
        <Input
          label='期間開始'
          type='date'
          value={formData.period_start}
          onChange={e =>
            setFormData(prev => ({ ...prev, period_start: e.target.value }))
          }
          required
        />
        <Input
          label='期間終了'
          type='date'
          value={formData.period_end}
          onChange={e =>
            setFormData(prev => ({ ...prev, period_end: e.target.value }))
          }
          required
        />
      </div>

      {/* 支出選択 */}
      <div className='space-y-3'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>精算対象の支出</h3>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleSelectAll}
          >
            {selectedExpenses.size === unsettledExpenses.length
              ? '全て解除'
              : '全て選択'}
          </Button>
        </div>

        <div className='border rounded-lg max-h-64 overflow-y-auto'>
          {unsettledExpenses.map(expense => (
            <label
              key={expense.id}
              className={`flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                selectedExpenses.has(expense.id) ? 'bg-blue-50' : ''
              }`}
            >
              <input
                type='checkbox'
                checked={selectedExpenses.has(expense.id)}
                onChange={() => handleExpenseToggle(expense.id)}
                className='mr-3 h-4 w-4 text-blue-600 rounded border-gray-300'
              />
              <div className='flex-1 flex items-center justify-between'>
                <div>
                  <div className='flex items-center space-x-2'>
                    <span className='font-medium text-gray-900'>
                      {expense.description}
                    </span>
                    <Badge variant='default'>{expense.category}</Badge>
                  </div>
                  <div className='text-sm text-gray-600'>
                    {formatDate(expense.date)} - {expense.user_name}が支払い
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-gray-900'>
                    ¥{expense.amount.toLocaleString()}
                  </div>
                  <div className='text-sm text-gray-600'>
                    あなたの負担: ¥{expense.your_share.toLocaleString()}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 精算計算結果 */}
      {selectedExpenses.size > 0 && (
        <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
          <h4 className='font-medium text-gray-900'>精算計算結果</h4>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-gray-600'>あなたの支払い</p>
              <p className='font-medium text-gray-900'>
                ¥{calculation.yourPayments.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-gray-600'>パートナーの支払い</p>
              <p className='font-medium text-gray-900'>
                ¥{calculation.partnerPayments.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-gray-600'>あなたの負担額</p>
              <p className='font-medium text-gray-900'>
                ¥{calculation.yourShare.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-gray-600'>パートナーの負担額</p>
              <p className='font-medium text-gray-900'>
                ¥{calculation.partnerShare.toLocaleString()}
              </p>
            </div>
          </div>
          <div className='pt-3 border-t'>
            <div className='flex justify-between items-center'>
              <span className='text-lg font-medium text-gray-900'>
                精算金額
              </span>
              <div className='text-right'>
                <div className='text-2xl font-bold text-blue-600'>
                  ¥{Math.abs(calculation.balance).toLocaleString()}
                </div>
                <div className='text-sm text-gray-600'>
                  {calculation.balance > 0
                    ? 'パートナーからあなたへ'
                    : 'あなたからパートナーへ'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メモ */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          メモ（任意）
        </label>
        <textarea
          value={formData.note}
          onChange={e =>
            setFormData(prev => ({ ...prev, note: e.target.value }))
          }
          rows={3}
          className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          placeholder='精算に関するメモを入力'
        />
      </div>

      {/* 実行ボタン */}
      <Button
        type='submit'
        variant='primary'
        loading={submitting}
        disabled={selectedExpenses.size === 0}
        className='w-full'
      >
        {submitting ? '精算を作成中...' : '精算を作成'}
      </Button>
    </form>
  );
}
