'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import ExpenseDetail from '@/components/expense/ExpenseDetail';
import Button from '@/components/ui/Button';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={handleBack} className='mb-4'>
          ← 戻る
        </Button>
        <h1 className='text-2xl font-bold text-gray-900'>支出詳細</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold text-gray-900'>支出情報</h2>
        </CardHeader>
        <CardBody>
          <ExpenseDetail expenseId={expenseId} />
        </CardBody>
      </Card>
    </div>
  );
}
