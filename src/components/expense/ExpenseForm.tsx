'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ExpenseFormProps {
  onSubmit: () => void;
  initialData?: {
    id?: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    split_ratio: number;
  };
}

const DEFAULT_CATEGORIES = [
  { id: 'food', name: '食費', color: 'bg-red-100 text-red-800', icon: '🍽️' },
  {
    id: 'transport',
    name: '交通費',
    color: 'bg-blue-100 text-blue-800',
    icon: '🚗',
  },
  {
    id: 'shopping',
    name: '買い物',
    color: 'bg-green-100 text-green-800',
    icon: '🛒',
  },
  {
    id: 'entertainment',
    name: '娯楽',
    color: 'bg-purple-100 text-purple-800',
    icon: '🎬',
  },
  {
    id: 'utilities',
    name: '公共料金',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⚡',
  },
  {
    id: 'medical',
    name: '医療費',
    color: 'bg-pink-100 text-pink-800',
    icon: '🏥',
  },
  {
    id: 'other',
    name: 'その他',
    color: 'bg-gray-100 text-gray-800',
    icon: '📦',
  },
];

export default function ExpenseForm({
  onSubmit,
  initialData,
}: ExpenseFormProps) {
  const { data: session } = useSession();
  console.log('Current session:', session); // TODO: Remove in production
  const [formData, setFormData] = useState({
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    split_ratio: initialData?.split_ratio || 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: APIコール実装
      console.log('支出データ:', formData);

      // 模擬的な成功処理
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit();
    } catch (err) {
      setError('支出の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* 金額 */}
      <Input
        label='金額'
        type='number'
        value={formData.amount}
        onChange={e =>
          handleInputChange('amount', parseFloat(e.target.value) || 0)
        }
        required
        leftIcon={<span>¥</span>}
        placeholder='1000'
      />

      {/* 説明 */}
      <Input
        label='説明'
        value={formData.description}
        onChange={e => handleInputChange('description', e.target.value)}
        placeholder='例: 昼食、ガソリン代'
        required
      />

      {/* カテゴリ選択 */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          カテゴリ
        </label>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
          {DEFAULT_CATEGORIES.map(category => (
            <button
              key={category.id}
              type='button'
              onClick={() => handleInputChange('category', category.id)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                formData.category === category.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className='flex items-center space-x-2'>
                <span className='text-lg'>{category.icon}</span>
                <span>{category.name}</span>
              </div>
            </button>
          ))}
        </div>
        {!formData.category && (
          <p className='text-sm text-red-600'>カテゴリを選択してください</p>
        )}
      </div>

      {/* 日付 */}
      <Input
        label='日付'
        type='date'
        value={formData.date}
        onChange={e => handleInputChange('date', e.target.value)}
        required
      />

      {/* 分担比率 */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          分担比率
        </label>
        <div className='space-y-2'>
          <input
            type='range'
            min='0'
            max='1'
            step='0.1'
            value={formData.split_ratio}
            onChange={e =>
              handleInputChange('split_ratio', parseFloat(e.target.value))
            }
            className='w-full'
          />
          <div className='flex justify-between text-sm text-gray-600'>
            <span>あなた: {Math.round(formData.split_ratio * 100)}%</span>
            <span>
              パートナー: {Math.round((1 - formData.split_ratio) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className='flex space-x-3'>
        <Button
          type='submit'
          loading={loading}
          disabled={
            !formData.category || !formData.amount || !formData.description
          }
          className='flex-1'
        >
          {initialData ? '更新' : '追加'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => onSubmit()}
          className='flex-1'
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
