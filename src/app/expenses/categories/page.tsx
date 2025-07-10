'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import CategoryManager from '@/components/expense/CategoryManager';
import Button from '@/components/ui/Button';

export default function CategoriesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={handleBack} className='mb-4'>
          ← 戻る
        </Button>
        <h1 className='text-2xl font-bold text-gray-900'>カテゴリ管理</h1>
        <p className='text-gray-600 mt-2'>
          支出のカテゴリを管理できます。カスタムカテゴリの追加・編集・削除が可能です。
        </p>
      </div>

      <Card>
        <CardBody>
          <CategoryManager />
        </CardBody>
      </Card>
    </div>
  );
}
