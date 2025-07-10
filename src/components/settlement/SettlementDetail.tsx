'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
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
  expenses: SettlementExpense[];
}

interface SettlementExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  user_name: string;
  split_ratio: number;
  your_share: number;
}

interface SettlementDetailProps {
  settlementId: string;
}

const DEFAULT_CATEGORIES = {
  food: { name: '食費', color: 'bg-red-100 text-red-800', icon: '🍽️' },
  transport: { name: '交通費', color: 'bg-blue-100 text-blue-800', icon: '🚗' },
  shopping: { name: '買い物', color: 'bg-green-100 text-green-800', icon: '🛒' },
  entertainment: { name: '娯楽', color: 'bg-purple-100 text-purple-800', icon: '🎬' },
  utilities: { name: '公共料金', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' },
  medical: { name: '医療費', color: 'bg-pink-100 text-pink-800', icon: '🏥' },
  other: { name: 'その他', color: 'bg-gray-100 text-gray-800', icon: '📦' },
};

export default function SettlementDetail({ settlementId }: SettlementDetailProps) {
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettlement();
  }, [settlementId]);

  const fetchSettlement = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('精算詳細取得:', settlementId);
      
      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSettlement: Settlement = {
        id: settlementId,
        amount: 18000,
        from_user_name: 'パートナー',
        to_user_name: 'あなた',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
        status: 'pending',
        created_at: '2025-01-08T15:00:00Z',
        note: '1月の支出精算',
        expenses: [
          {
            id: '1',
            amount: 2500,
            description: '昼食代',
            category: 'food',
            date: '2025-01-05',
            user_name: 'あなた',
            split_ratio: 0.5,
            your_share: 1250,
          },
          {
            id: '2',
            amount: 8000,
            description: '映画鑑賞',
            category: 'entertainment',
            date: '2025-01-06',
            user_name: 'パートナー',
            split_ratio: 0.5,
            your_share: 4000,
          },
          {
            id: '3',
            amount: 15000,
            description: '食材購入',
            category: 'shopping',
            date: '2025-01-07',
            user_name: 'あなた',
            split_ratio: 0.5,
            your_share: 7500,
          },
          {
            id: '4',
            amount: 3200,
            description: '交通費',
            category: 'transport',
            date: '2025-01-08',
            user_name: 'パートナー',
            split_ratio: 0.5,
            your_share: 1600,
          },
        ],
      };
      
      setSettlement(mockSettlement);
    } catch (err) {
      setError('精算詳細の取得に失敗しました');
      console.error('精算詳細の取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSettlement = async () => {
    if (!settlement) return;
    
    try {
      // TODO: 実際のAPIコール
      console.log('精算完了:', settlement.id);
      
      // 模擬的な完了処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettlement(prev => prev ? {
        ...prev,
        status: 'completed',
        completed_at: new Date().toISOString()
      } : null);
      
      setShowCompleteModal(false);
    } catch (err) {
      setError('精算完了処理に失敗しました');
      console.error('精算完了処理に失敗:', err);
    }
  };

  const handleCancelSettlement = async () => {
    if (!settlement) return;
    
    try {
      // TODO: 実際のAPIコール
      console.log('精算キャンセル:', settlement.id);
      
      // 模擬的なキャンセル処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettlement(prev => prev ? {
        ...prev,
        status: 'cancelled'
      } : null);
      
      setShowCancelModal(false);
    } catch (err) {
      setError('精算キャンセル処理に失敗しました');
      console.error('精算キャンセル処理に失敗:', err);
    }
  };

  const getStatusBadge = (status: Settlement['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">精算待ち</Badge>;
      case 'completed':
        return <Badge variant="success">完了済み</Badge>;
      case 'cancelled':
        return <Badge variant="danger">キャンセル</Badge>;
      default:
        return <Badge variant="default">不明</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP');
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} 〜 ${endDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>精算データが見つかりません</p>
      </div>
    );
  }

  const yourPayments = settlement.expenses.filter(e => e.user_name === 'あなた').reduce((sum, e) => sum + e.amount, 0);
  const partnerPayments = settlement.expenses.filter(e => e.user_name === 'パートナー').reduce((sum, e) => sum + e.amount, 0);
  const yourShare = settlement.expenses.reduce((sum, e) => sum + e.your_share, 0);
  const partnerShare = settlement.expenses.reduce((sum, e) => sum + e.amount - e.your_share, 0);

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">精算情報</h3>
              <p className="text-sm text-gray-600 mt-1">
                {formatPeriod(settlement.period_start, settlement.period_end)}
              </p>
            </div>
            {getStatusBadge(settlement.status)}
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">精算方向</span>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-2xl">
                    {settlement.from_user_name === 'あなた' ? '💸' : '💰'}
                  </span>
                  <span className="text-lg font-medium text-gray-900">
                    {settlement.from_user_name} → {settlement.to_user_name}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">精算金額</span>
                <div className="mt-1 text-3xl font-bold text-blue-600">
                  ¥{settlement.amount.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">作成日時</span>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(settlement.created_at)}</p>
              </div>
              
              {settlement.completed_at && (
                <div>
                  <span className="text-sm font-medium text-gray-500">完了日時</span>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(settlement.completed_at)}</p>
                </div>
              )}
              
              {settlement.note && (
                <div>
                  <span className="text-sm font-medium text-gray-500">メモ</span>
                  <p className="mt-1 text-sm text-gray-900">{settlement.note}</p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 精算計算詳細 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">精算計算詳細</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">支払い額</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">あなたの支払い</span>
                  <span className="font-medium text-gray-900">¥{yourPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">パートナーの支払い</span>
                  <span className="font-medium text-gray-900">¥{partnerPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium text-gray-900">合計支払い</span>
                  <span className="font-bold text-gray-900">¥{(yourPayments + partnerPayments).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">負担額</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">あなたの負担</span>
                  <span className="font-medium text-gray-900">¥{yourShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">パートナーの負担</span>
                  <span className="font-medium text-gray-900">¥{partnerShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium text-gray-900">合計負担</span>
                  <span className="font-bold text-gray-900">¥{(yourShare + partnerShare).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 対象支出一覧 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">対象支出一覧</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {settlement.expenses.map((expense) => {
              const category = DEFAULT_CATEGORIES[expense.category as keyof typeof DEFAULT_CATEGORIES];
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{category?.icon}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{expense.description}</span>
                        <Badge variant="default" className={category?.color}>
                          {category?.name || expense.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(expense.date)} - {expense.user_name}が支払い
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ¥{expense.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      あなたの負担: ¥{expense.your_share.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* アクション */}
      {settlement.status === 'pending' && (
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => setShowCompleteModal(true)}
            className="flex-1"
          >
            精算完了
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowCancelModal(true)}
            className="flex-1"
          >
            キャンセル
          </Button>
        </div>
      )}

      {/* 完了確認モーダル */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="精算完了確認"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            この精算を完了としてマークしますか？
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">
              {settlement.from_user_name} → {settlement.to_user_name}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              ¥{settlement.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {formatPeriod(settlement.period_start, settlement.period_end)}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={handleCompleteSettlement}
              className="flex-1"
            >
              完了にする
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCompleteModal(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>

      {/* キャンセル確認モーダル */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="精算キャンセル確認"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            この精算をキャンセルしますか？キャンセル後は元に戻せません。
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">
              {settlement.from_user_name} → {settlement.to_user_name}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{settlement.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {formatPeriod(settlement.period_start, settlement.period_end)}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={handleCancelSettlement}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              戻る
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}