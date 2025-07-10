'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SettlementDetail from '@/components/settlement/SettlementDetail';

export default function SettlementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          ← 戻る
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">精算詳細</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">精算情報</h2>
        </CardHeader>
        <CardBody>
          <SettlementDetail settlementId={params.id} />
        </CardBody>
      </Card>
    </div>
  );
}