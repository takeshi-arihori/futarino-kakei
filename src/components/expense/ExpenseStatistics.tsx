'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface ExpenseStats {
  totalAmount: number;
  totalCount: number;
  pendingAmount: number;
  pendingCount: number;
  settledAmount: number;
  settledCount: number;
  categoryBreakdown: {
    category: string;
    name: string;
    amount: number;
    count: number;
    percentage: number;
    color: string;
    icon: string;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
    count: number;
  }[];
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

interface ExpenseStatisticsProps {
  period?: 'current_month' | 'last_month' | 'current_year' | 'all';
}

export default function ExpenseStatistics({
  period = 'current_month',
}: ExpenseStatisticsProps) {
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('統計取得期間:', period);

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockStats: ExpenseStats = {
        totalAmount: 45000,
        totalCount: 12,
        pendingAmount: 18000,
        pendingCount: 5,
        settledAmount: 27000,
        settledCount: 7,
        categoryBreakdown: [
          {
            category: 'food',
            name: '食費',
            amount: 15000,
            count: 5,
            percentage: 33.3,
            color: 'bg-red-100 text-red-800',
            icon: '🍽️',
          },
          {
            category: 'transport',
            name: '交通費',
            amount: 12000,
            count: 3,
            percentage: 26.7,
            color: 'bg-blue-100 text-blue-800',
            icon: '🚗',
          },
          {
            category: 'entertainment',
            name: '娯楽',
            amount: 8000,
            count: 2,
            percentage: 17.8,
            color: 'bg-purple-100 text-purple-800',
            icon: '🎬',
          },
          {
            category: 'shopping',
            name: '買い物',
            amount: 6000,
            count: 1,
            percentage: 13.3,
            color: 'bg-green-100 text-green-800',
            icon: '🛒',
          },
          {
            category: 'utilities',
            name: '公共料金',
            amount: 4000,
            count: 1,
            percentage: 8.9,
            color: 'bg-yellow-100 text-yellow-800',
            icon: '⚡',
          },
        ],
        monthlyTrend: [
          { month: '2024-10', amount: 32000, count: 8 },
          { month: '2024-11', amount: 38000, count: 10 },
          { month: '2024-12', amount: 42000, count: 11 },
          { month: '2025-01', amount: 45000, count: 12 },
        ],
      };

      setStats(mockStats);
    } catch (err) {
      setError('統計データの取得に失敗しました');
      console.error('統計データの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'current_month':
        return '今月';
      case 'last_month':
        return '先月';
      case 'current_year':
        return '今年';
      case 'all':
        return '全期間';
      default:
        return '今月';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>統計データを読み込み中...</span>
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

  if (!stats) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <p>統計データがありません</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-bold text-gray-900'>支出統計</h2>
        <Badge variant='info'>{getPeriodLabel()}</Badge>
      </div>

      {/* 基本統計 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>総支出</h3>
              <p className='text-3xl font-bold text-blue-600 mt-2'>
                ¥{stats.totalAmount.toLocaleString()}
              </p>
              <p className='text-sm text-gray-600 mt-1'>{stats.totalCount}件</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>精算済み</h3>
              <p className='text-3xl font-bold text-green-600 mt-2'>
                ¥{stats.settledAmount.toLocaleString()}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {stats.settledCount}件
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>精算待ち</h3>
              <p className='text-3xl font-bold text-orange-600 mt-2'>
                ¥{stats.pendingAmount.toLocaleString()}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {stats.pendingCount}件
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* カテゴリ別統計 */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-900'>
            カテゴリ別内訳
          </h3>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            {stats.categoryBreakdown.map(category => (
              <div
                key={category.category}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-2xl'>{category.icon}</div>
                  <div>
                    <p className='font-medium text-gray-900'>{category.name}</p>
                    <p className='text-sm text-gray-600'>{category.count}件</p>
                  </div>
                </div>

                <div className='text-right'>
                  <p className='font-bold text-gray-900'>
                    ¥{category.amount.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {category.percentage}%
                  </p>
                </div>

                <div className='w-24 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 月次推移 */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-900'>月次推移</h3>
        </CardHeader>
        <CardBody>
          <div className='space-y-3'>
            {stats.monthlyTrend.map(month => (
              <div
                key={month.month}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div>
                  <p className='font-medium text-gray-900'>
                    {new Date(month.month + '-01').toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className='text-sm text-gray-600'>{month.count}件</p>
                </div>

                <div className='text-right'>
                  <p className='font-bold text-gray-900'>
                    ¥{month.amount.toLocaleString()}
                  </p>
                  <div className='w-32 bg-gray-200 rounded-full h-2 mt-1'>
                    <div
                      className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${Math.max(10, (month.amount / Math.max(...stats.monthlyTrend.map(m => m.amount))) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
