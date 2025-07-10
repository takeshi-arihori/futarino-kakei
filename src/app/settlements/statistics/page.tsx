'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import SettlementStatistics from '@/components/settlement/SettlementStatistics';

export default function SettlementStatisticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<
    'current_month' | 'last_month' | 'current_year' | 'all'
  >('current_month');

  const handleBack = () => {
    router.back();
  };

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={handleBack} className='mb-4'>
          ← 戻る
        </Button>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>精算統計</h1>
            <p className='text-gray-600 mt-2'>
              精算の詳細な統計情報とトレンドを確認できます。
            </p>
          </div>

          <div className='flex space-x-2'>
            <Button
              variant={period === 'current_month' ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setPeriod('current_month')}
            >
              今月
            </Button>
            <Button
              variant={period === 'last_month' ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setPeriod('last_month')}
            >
              先月
            </Button>
            <Button
              variant={period === 'current_year' ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setPeriod('current_year')}
            >
              今年
            </Button>
            <Button
              variant={period === 'all' ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setPeriod('all')}
            >
              全期間
            </Button>
          </div>
        </div>
      </div>

      <SettlementStatistics period={period} />
    </div>
  );
}
