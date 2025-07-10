'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface SettlementStats {
  totalSettlements: number;
  totalAmount: number;
  completedCount: number;
  pendingCount: number;
  averageAmount: number;
  yourReceived: number;
  yourPaid: number;
  netBalance: number;
  monthlyTrend: {
    month: string;
    count: number;
    amount: number;
    received: number;
    paid: number;
  }[];
  frequencyStats: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface SettlementStatisticsProps {
  period?: 'current_month' | 'last_month' | 'current_year' | 'all';
}

export default function SettlementStatistics({
  period = 'current_month',
}: SettlementStatisticsProps) {
  const [stats, setStats] = useState<SettlementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchStatistics = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('精算統計取得期間:', period);

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockStats: SettlementStats = {
        totalSettlements: 8,
        totalAmount: 95000,
        completedCount: 6,
        pendingCount: 2,
        averageAmount: 11875,
        yourReceived: 42000,
        yourPaid: 53000,
        netBalance: -11000,
        monthlyTrend: [
          {
            month: '2024-10',
            count: 2,
            amount: 15000,
            received: 8000,
            paid: 7000,
          },
          {
            month: '2024-11',
            count: 2,
            amount: 22000,
            received: 12000,
            paid: 10000,
          },
          {
            month: '2024-12',
            count: 2,
            amount: 28000,
            received: 15000,
            paid: 13000,
          },
          {
            month: '2025-01',
            count: 2,
            amount: 30000,
            received: 7000,
            paid: 23000,
          },
        ],
        frequencyStats: {
          daily: 0.27, // 0.27回/日
          weekly: 1.9, // 1.9回/週
          monthly: 8.2, // 8.2回/月
        },
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
        <h2 className='text-xl font-bold text-gray-900'>精算統計</h2>
        <Badge variant='info'>{getPeriodLabel()}</Badge>
      </div>

      {/* 基本統計 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>
                総精算回数
              </h3>
              <p className='text-3xl font-bold text-blue-600 mt-2'>
                {stats.totalSettlements}回
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>総精算額</h3>
              <p className='text-3xl font-bold text-purple-600 mt-2'>
                ¥{stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>完了済み</h3>
              <p className='text-3xl font-bold text-green-600 mt-2'>
                {stats.completedCount}回
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {(
                  (stats.completedCount / stats.totalSettlements) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>精算待ち</h3>
              <p className='text-3xl font-bold text-orange-600 mt-2'>
                {stats.pendingCount}回
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {((stats.pendingCount / stats.totalSettlements) * 100).toFixed(
                  1
                )}
                %
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 収支バランス */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-900'>収支バランス</h3>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <h4 className='text-sm font-medium text-green-800'>
                受け取り合計
              </h4>
              <p className='text-2xl font-bold text-green-700 mt-2'>
                ¥{stats.yourReceived.toLocaleString()}
              </p>
            </div>

            <div className='text-center p-4 bg-red-50 rounded-lg'>
              <h4 className='text-sm font-medium text-red-800'>支払い合計</h4>
              <p className='text-2xl font-bold text-red-700 mt-2'>
                ¥{stats.yourPaid.toLocaleString()}
              </p>
            </div>

            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <h4 className='text-sm font-medium text-blue-800'>純収支</h4>
              <p
                className={`text-2xl font-bold mt-2 ${
                  stats.netBalance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {stats.netBalance >= 0 ? '+' : ''}¥
                {stats.netBalance.toLocaleString()}
              </p>
              <p className='text-xs text-gray-600 mt-1'>
                {stats.netBalance >= 0 ? '黒字' : '赤字'}
              </p>
            </div>
          </div>

          <div className='mt-6 text-center'>
            <h4 className='text-sm font-medium text-gray-700'>平均精算額</h4>
            <p className='text-xl font-bold text-gray-900 mt-1'>
              ¥{stats.averageAmount.toLocaleString()}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* 精算頻度 */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-900'>精算頻度</h3>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center p-4 border rounded-lg'>
              <h4 className='text-sm font-medium text-gray-700'>日平均</h4>
              <p className='text-xl font-bold text-gray-900 mt-2'>
                {stats.frequencyStats.daily.toFixed(1)}回
              </p>
            </div>

            <div className='text-center p-4 border rounded-lg'>
              <h4 className='text-sm font-medium text-gray-700'>週平均</h4>
              <p className='text-xl font-bold text-gray-900 mt-2'>
                {stats.frequencyStats.weekly.toFixed(1)}回
              </p>
            </div>

            <div className='text-center p-4 border rounded-lg'>
              <h4 className='text-sm font-medium text-gray-700'>月平均</h4>
              <p className='text-xl font-bold text-gray-900 mt-2'>
                {stats.frequencyStats.monthly.toFixed(1)}回
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 月次推移 */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-900'>月次推移</h3>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            {stats.monthlyTrend.map(month => (
              <div key={month.month} className='border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-medium text-gray-900'>
                    {new Date(month.month + '-01').toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </h4>
                  <Badge variant='default'>{month.count}回</Badge>
                </div>

                <div className='grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-600'>総精算額</span>
                    <p className='font-medium text-gray-900'>
                      ¥{month.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>受け取り</span>
                    <p className='font-medium text-green-700'>
                      ¥{month.received.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>支払い</span>
                    <p className='font-medium text-red-700'>
                      ¥{month.paid.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className='mt-3'>
                  <div className='flex justify-between text-xs text-gray-600 mb-1'>
                    <span>精算頻度</span>
                    <span>
                      {Math.max(
                        10,
                        (month.count /
                          Math.max(...stats.monthlyTrend.map(m => m.count))) *
                          100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${Math.max(10, (month.count / Math.max(...stats.monthlyTrend.map(m => m.count))) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* インサイト */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-900'>インサイト</h3>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <h4 className='font-medium text-blue-900 mb-2'>
                💡 精算パターン分析
              </h4>
              <p className='text-sm text-blue-800'>
                {stats.frequencyStats.monthly > 5
                  ? '精算頻度が高く、こまめに精算を行っています。'
                  : '精算頻度は標準的です。'}
              </p>
            </div>

            <div className='p-4 bg-green-50 rounded-lg'>
              <h4 className='font-medium text-green-900 mb-2'>📈 収支傾向</h4>
              <p className='text-sm text-green-800'>
                {stats.netBalance >= 0
                  ? 'トータルでプラス収支です。パートナーからの受け取りが多い状況です。'
                  : 'トータルでマイナス収支です。パートナーへの支払いが多い状況です。'}
              </p>
            </div>

            <div className='p-4 bg-yellow-50 rounded-lg'>
              <h4 className='font-medium text-yellow-900 mb-2'>⚡ 完了率</h4>
              <p className='text-sm text-yellow-800'>
                精算完了率は
                {(
                  (stats.completedCount / stats.totalSettlements) *
                  100
                ).toFixed(1)}
                %です。
                {stats.pendingCount > 0 &&
                  `${stats.pendingCount}件の未完了精算があります。`}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
