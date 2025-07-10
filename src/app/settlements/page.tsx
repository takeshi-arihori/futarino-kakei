'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SettlementList from '@/components/settlement/SettlementList';
import SettlementForm from '@/components/settlement/SettlementForm';
import Modal from '@/components/ui/Modal';

export default function SettlementsPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSettlementCreated = () => {
    setIsCreateModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className='space-y-6'>
      {/* ヘッダー */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>精算管理</h1>
        <div className='flex space-x-3'>
          <Button
            variant='outline'
            onClick={() => router.push('/settlements/statistics')}
          >
            統計
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className='bg-blue-600 hover:bg-blue-700'
            style={{ color: 'white' }}
          >
            + 精算を作成
          </Button>
        </div>
      </div>

      {/* 精算サマリーカード */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>
                今月の精算額
              </h3>
              <p className='text-3xl font-bold text-blue-600 mt-2'>¥12,500</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>
                未精算金額
              </h3>
              <p className='text-3xl font-bold text-orange-600 mt-2'>¥18,000</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>精算回数</h3>
              <p className='text-3xl font-bold text-green-600 mt-2'>3回</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 精算一覧 */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold text-gray-900'>精算履歴</h2>
        </CardHeader>
        <CardBody>
          <SettlementList key={refreshKey} />
        </CardBody>
      </Card>

      {/* 精算作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title='精算を作成'
        size='lg'
      >
        <SettlementForm onSubmit={handleSettlementCreated} />
      </Modal>
    </div>
  );
}
