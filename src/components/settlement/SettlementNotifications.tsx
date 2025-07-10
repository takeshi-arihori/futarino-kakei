'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

interface Notification {
  id: string;
  type: 'settlement_reminder' | 'settlement_request' | 'settlement_completed';
  title: string;
  message: string;
  settlement_id?: string;
  created_at: string;
  read: boolean;
  action_required: boolean;
}

export default function SettlementNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    reminderDays: 3,
    autoReminder: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('通知一覧取得中...');
      
      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'settlement_reminder',
          title: '精算リマインダー',
          message: 'パートナーへの精算（¥18,000）が3日前に作成されています。確認をお願いします。',
          settlement_id: '3',
          created_at: '2025-01-08T09:00:00Z',
          read: false,
          action_required: true,
        },
        {
          id: '2',
          type: 'settlement_request',
          title: '新しい精算が作成されました',
          message: 'パートナーが1月前半の精算（¥12,500）を作成しました。',
          settlement_id: '1',
          created_at: '2025-01-07T15:30:00Z',
          read: true,
          action_required: false,
        },
        {
          id: '3',
          type: 'settlement_completed',
          title: '精算が完了しました',
          message: '12月後半の精算（¥8,750）が完了しました。',
          settlement_id: '2',
          created_at: '2025-01-06T11:00:00Z',
          read: true,
          action_required: false,
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (err) {
      setError('通知の取得に失敗しました');
      console.error('通知の取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('通知設定取得中...');
      
      // 模擬データ（現在の設定をそのまま使用）
    } catch (err) {
      console.error('通知設定の取得に失敗:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: 実際のAPIコール
      console.log('通知既読:', notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('通知の既読処理に失敗:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('全通知既読');
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('全通知の既読処理に失敗:', err);
    }
  };

  const updateSettings = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('通知設定更新:', settings);
      
      // 模擬的な更新処理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setShowSettingsModal(false);
    } catch (err) {
      setError('設定の更新に失敗しました');
      console.error('設定の更新に失敗:', err);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'settlement_reminder':
        return '⏰';
      case 'settlement_request':
        return '💰';
      case 'settlement_completed':
        return '✅';
      default:
        return '📔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'settlement_reminder':
        return 'text-orange-600';
      case 'settlement_request':
        return 'text-blue-600';
      case 'settlement_completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'たった今';
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}日前`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.action_required).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">通知</h2>
          <div className="flex items-center space-x-4 mt-1">
            {unreadCount > 0 && (
              <Badge variant="warning">{unreadCount}件未読</Badge>
            )}
            {actionRequiredCount > 0 && (
              <Badge variant="danger">{actionRequiredCount}件要対応</Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              全て既読
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsModal(true)}
          >
            通知設定
          </Button>
        </div>
      </div>

      {/* 通知一覧 */}
      {notifications.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🔔</div>
              <p>通知はありません</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.read ? 'border-blue-200 bg-blue-50' : ''
              }`}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
                if (notification.settlement_id) {
                  window.location.href = `/settlements/${notification.settlement_id}`;
                }
              }}
            >
              <CardBody>
                <div className="flex items-start space-x-3">
                  <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {notification.action_required && (
                        <Badge variant="danger" size="sm">要対応</Badge>
                      )}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      !notification.read ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* 通知設定モーダル */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="通知設定"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">通知方法</h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  emailNotifications: e.target.checked 
                }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">メール通知</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  pushNotifications: e.target.checked 
                }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">プッシュ通知</span>
            </label>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">リマインダー設定</h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoReminder}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  autoReminder: e.target.checked 
                }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">自動リマインダー</span>
            </label>
            
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-700">リマインダー間隔:</label>
              <select
                value={settings.reminderDays}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  reminderDays: parseInt(e.target.value) 
                }))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                disabled={!settings.autoReminder}
              >
                <option value={1}>1日</option>
                <option value={2}>2日</option>
                <option value={3}>3日</option>
                <option value={7}>1週間</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={updateSettings}
              className="flex-1"
            >
              設定を保存
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}