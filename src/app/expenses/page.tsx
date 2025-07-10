'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ExpenseForm from '@/components/expense/ExpenseForm';
import ExpenseList from '@/components/expense/ExpenseList';
import Modal from '@/components/ui/Modal';

export default function ExpensesPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseAdded = () => {
    setIsAddModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className='space-y-6'>
      {/* ヘッダー */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>支出管理</h1>
        <div className='flex space-x-3'>
          <Button
            variant='outline'
            onClick={() => router.push('/expenses/categories')}
          >
            カテゴリ管理
          </Button>
          <Button
            variant='outline'
            onClick={() => router.push('/expenses/statistics')}
          >
            統計
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className='bg-blue-600 hover:bg-blue-700'
            style={{ color: 'white' }}
          >
            + 支出を追加
          </Button>
        </div>
      </div>

      {/* 支出統計カード */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>
                今月の支出
              </h3>
              <p className='text-3xl font-bold text-blue-600 mt-2'>¥45,000</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>
                今月の件数
              </h3>
              <p className='text-3xl font-bold text-green-600 mt-2'>12件</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>精算待ち</h3>
              <p className='text-3xl font-bold text-orange-600 mt-2'>¥18,000</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 支出一覧 */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold text-gray-900'>支出履歴</h2>
        </CardHeader>
        <CardBody>
          <ExpenseList key={refreshKey} />
        </CardBody>
      </Card>

      {/* 支出追加モーダル */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title='支出を追加'
        size='lg'
      >
        <ExpenseForm onSubmit={handleExpenseAdded} />
      </Modal>
    </div>
  );
}
