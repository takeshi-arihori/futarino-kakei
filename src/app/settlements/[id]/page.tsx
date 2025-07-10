import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import SettlementDetail from '@/components/settlement/SettlementDetail';

export default async function SettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>精算詳細</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold text-gray-900'>精算情報</h2>
        </CardHeader>
        <CardBody>
          <SettlementDetail settlementId={resolvedParams.id} />
        </CardBody>
      </Card>
    </div>
  );
}
