'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Settlement {
  id: string;
  amount: number;
  from_user_name: string;
  to_user_name: string;
  period_start: string;
  period_end: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  note?: string;
}

export default function SettlementList() {
  const router = useRouter();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<Settlement | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('精算一覧取得中...');

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSettlements: Settlement[] = [
        {
          id: '1',
          amount: 12500,
          from_user_name: 'あなた',
          to_user_name: 'パートナー',
          period_start: '2025-01-01',
          period_end: '2025-01-15',
          status: 'completed',
          created_at: '2025-01-16T10:00:00Z',
          completed_at: '2025-01-16T14:30:00Z',
          note: '1月前半の精算',
        },
        {
          id: '2',
          amount: 8750,
          from_user_name: 'パートナー',
          to_user_name: 'あなた',
          period_start: '2024-12-16',
          period_end: '2024-12-31',
          status: 'completed',
          created_at: '2025-01-01T09:00:00Z',
          completed_at: '2025-01-02T11:00:00Z',
          note: '12月後半の精算',
        },
        {
          id: '3',
          amount: 18000,
          from_user_name: 'パートナー',
          to_user_name: 'あなた',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
          status: 'pending',
          created_at: '2025-01-08T15:00:00Z',
          note: '1月の支出精算',
        },
      ];

      setSettlements(mockSettlements);
    } catch (err) {
      setError('精算一覧の取得に失敗しました');
      console.error('精算一覧の取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSettlement = async (settlement: Settlement) => {
    try {
      // TODO: 実際のAPIコール
      console.log('精算完了:', settlement.id);

      // 模擬的な完了処理
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSettlements(prev =>
        prev.map(s =>
          s.id === settlement.id
            ? {
                ...s,
                status: 'completed' as const,
                completed_at: new Date().toISOString(),
              }
            : s
        )
      );

      setShowCompleteModal(false);
      setSelectedSettlement(null);
    } catch (err) {
      setError('精算完了処理に失敗しました');
      console.error('精算完了処理に失敗:', err);
    }
  };

  const getStatusBadge = (status: Settlement['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant='warning'>精算待ち</Badge>;
      case 'completed':
        return <Badge variant='success'>完了済み</Badge>;
      case 'cancelled':
        return <Badge variant='danger'>キャンセル</Badge>;
      default:
        return <Badge variant='default'>不明</Badge>;
    }
  };

  const filteredSettlements = settlements.filter(settlement => {
    if (filter === 'all') return true;
    return settlement.status === filter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPeriod = (start: string, end: string) => {
    return `${formatDate(start)} 〜 ${formatDate(end)}`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>読み込み中...</span>
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

  return (
    <div className='space-y-4'>
      {/* フィルター */}
      <div className='flex space-x-2'>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size='sm'
          onClick={() => setFilter('all')}
        >
          すべて ({settlements.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          size='sm'
          onClick={() => setFilter('pending')}
        >
          精算待ち ({settlements.filter(s => s.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          size='sm'
          onClick={() => setFilter('completed')}
        >
          完了済み ({settlements.filter(s => s.status === 'completed').length})
        </Button>
      </div>

      {/* 精算一覧 */}
      {filteredSettlements.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>精算履歴がありません</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filteredSettlements.map(settlement => (
            <div
              key={settlement.id}
              className='border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => router.push(`/settlements/${settlement.id}`)}
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <div className='text-2xl'>
                      {settlement.from_user_name === 'あなた' ? '💸' : '💰'}
                    </div>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium text-gray-900'>
                          {settlement.from_user_name} →{' '}
                          {settlement.to_user_name}
                        </span>
                        {getStatusBadge(settlement.status)}
                      </div>
                      <p className='text-sm text-gray-600'>
                        {formatPeriod(
                          settlement.period_start,
                          settlement.period_end
                        )}
                      </p>
                    </div>
                  </div>

                  {settlement.note && (
                    <p className='text-sm text-gray-600 mb-2'>
                      {settlement.note}
                    </p>
                  )}

                  <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-500'>
                      作成日: {formatDate(settlement.created_at)}
                      {settlement.completed_at && (
                        <span className='ml-2'>
                          完了日: {formatDate(settlement.completed_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='text-right ml-4'>
                  <div className='text-2xl font-bold text-gray-900'>
                    ¥{settlement.amount.toLocaleString()}
                  </div>
                  {settlement.status === 'pending' && (
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSettlement(settlement);
                        setShowCompleteModal(true);
                      }}
                      className='mt-2'
                    >
                      精算完了
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 精算完了確認モーダル */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title='精算完了確認'
      >
        {selectedSettlement && (
          <div className='space-y-4'>
            <p className='text-gray-700'>
              この精算を完了としてマークしますか？
            </p>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <span className='font-medium'>
                  {selectedSettlement.from_user_name} →{' '}
                  {selectedSettlement.to_user_name}
                </span>
              </div>
              <p className='text-2xl font-bold text-gray-900'>
                ¥{selectedSettlement.amount.toLocaleString()}
              </p>
              <p className='text-sm text-gray-600'>
                {formatPeriod(
                  selectedSettlement.period_start,
                  selectedSettlement.period_end
                )}
              </p>
              {selectedSettlement.note && (
                <p className='text-sm text-gray-600 mt-1'>
                  {selectedSettlement.note}
                </p>
              )}
            </div>
            <div className='flex space-x-3'>
              <Button
                variant='primary'
                onClick={() => handleCompleteSettlement(selectedSettlement)}
                className='flex-1'
              >
                完了にする
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowCompleteModal(false)}
                className='flex-1'
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
