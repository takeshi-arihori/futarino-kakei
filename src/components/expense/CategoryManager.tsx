'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  created_at?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: '食費',
    color: 'bg-red-100 text-red-800',
    icon: '🍽️',
    is_default: true,
  },
  {
    id: 'transport',
    name: '交通費',
    color: 'bg-blue-100 text-blue-800',
    icon: '🚗',
    is_default: true,
  },
  {
    id: 'shopping',
    name: '買い物',
    color: 'bg-green-100 text-green-800',
    icon: '🛒',
    is_default: true,
  },
  {
    id: 'entertainment',
    name: '娯楽',
    color: 'bg-purple-100 text-purple-800',
    icon: '🎬',
    is_default: true,
  },
  {
    id: 'utilities',
    name: '公共料金',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⚡',
    is_default: true,
  },
  {
    id: 'medical',
    name: '医療費',
    color: 'bg-pink-100 text-pink-800',
    icon: '🏥',
    is_default: true,
  },
  {
    id: 'other',
    name: 'その他',
    color: 'bg-gray-100 text-gray-800',
    icon: '📦',
    is_default: true,
  },
];

const COLOR_OPTIONS = [
  { value: 'bg-red-100 text-red-800', label: 'レッド', preview: 'bg-red-500' },
  {
    value: 'bg-blue-100 text-blue-800',
    label: 'ブルー',
    preview: 'bg-blue-500',
  },
  {
    value: 'bg-green-100 text-green-800',
    label: 'グリーン',
    preview: 'bg-green-500',
  },
  {
    value: 'bg-purple-100 text-purple-800',
    label: 'パープル',
    preview: 'bg-purple-500',
  },
  {
    value: 'bg-yellow-100 text-yellow-800',
    label: 'イエロー',
    preview: 'bg-yellow-500',
  },
  {
    value: 'bg-pink-100 text-pink-800',
    label: 'ピンク',
    preview: 'bg-pink-500',
  },
  {
    value: 'bg-indigo-100 text-indigo-800',
    label: 'インディゴ',
    preview: 'bg-indigo-500',
  },
  {
    value: 'bg-gray-100 text-gray-800',
    label: 'グレー',
    preview: 'bg-gray-500',
  },
];

const ICON_OPTIONS = [
  '🍽️',
  '🚗',
  '🛒',
  '🎬',
  '⚡',
  '🏥',
  '📦',
  '🏠',
  '💰',
  '📱',
  '👕',
  '🎓',
  '🎮',
  '🚶',
  '🏃',
  '🎯',
  '🎨',
  '📚',
  '🎵',
  '🌟',
];

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: '',
    color: 'bg-blue-100 text-blue-800',
    icon: '📦',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // TODO: 実際のAPIコール
      // 模擬データ（デフォルトカテゴリ + カスタムカテゴリ）
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockCustomCategories: Category[] = [
        {
          id: 'custom-1',
          name: '趣味',
          color: 'bg-indigo-100 text-indigo-800',
          icon: '🎨',
          is_default: false,
          created_at: '2025-01-08T10:00:00Z',
        },
      ];

      setCategories([...DEFAULT_CATEGORIES, ...mockCustomCategories]);
    } catch (err) {
      setError('カテゴリの取得に失敗しました');
      console.error('カテゴリの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      // TODO: 実際のAPIコール
      console.log('カテゴリ追加:', formData);

      // 模擬的な追加処理
      await new Promise(resolve => setTimeout(resolve, 500));

      const newCategory: Category = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        color: formData.color,
        icon: formData.icon,
        is_default: false,
        created_at: new Date().toISOString(),
      };

      setCategories(prev => [...prev, newCategory]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError('カテゴリの追加に失敗しました');
      console.error('カテゴリの追加に失敗:', err);
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;

    try {
      // TODO: 実際のAPIコール
      console.log('カテゴリ更新:', selectedCategory.id, formData);

      // 模擬的な更新処理
      await new Promise(resolve => setTimeout(resolve, 500));

      setCategories(prev =>
        prev.map(cat =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                name: formData.name,
                color: formData.color,
                icon: formData.icon,
              }
            : cat
        )
      );

      setShowEditModal(false);
      setSelectedCategory(null);
      resetForm();
    } catch (err) {
      setError('カテゴリの更新に失敗しました');
      console.error('カテゴリの更新に失敗:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      // TODO: 実際のAPIコール
      console.log('カテゴリ削除:', selectedCategory.id);

      // 模擬的な削除処理
      await new Promise(resolve => setTimeout(resolve, 500));

      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      setError('カテゴリの削除に失敗しました');
      console.error('カテゴリの削除に失敗:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: 'bg-blue-100 text-blue-800',
      icon: '📦',
    });
    setError('');
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>読み込み中...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-bold text-gray-900'>カテゴリ管理</h2>
        <Button
          variant='primary'
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          カテゴリを追加
        </Button>
      </div>

      <div className='grid gap-4'>
        {categories.map(category => (
          <div
            key={category.id}
            className='flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow'
          >
            <div className='flex items-center space-x-3'>
              <div className='text-2xl'>{category.icon}</div>
              <div>
                <h3 className='font-medium text-gray-900'>{category.name}</h3>
                <div className='flex items-center space-x-2 text-sm text-gray-600'>
                  <Badge variant='default' className={category.color}>
                    {category.name}
                  </Badge>
                  {category.is_default && (
                    <span className='text-xs text-gray-500'>
                      （デフォルト）
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => openEditModal(category)}
                disabled={category.is_default}
              >
                編集
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => openDeleteModal(category)}
                disabled={category.is_default}
              >
                削除
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 追加モーダル */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title='カテゴリを追加'
      >
        <div className='space-y-4'>
          <Input
            label='カテゴリ名'
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder='カテゴリ名を入力'
            required
          />

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              色
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color.value}
                  type='button'
                  onClick={() =>
                    setFormData(prev => ({ ...prev, color: color.value }))
                  }
                  className={`p-2 rounded border text-sm ${
                    formData.color === color.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mx-auto mb-1 ${color.preview}`}
                  ></div>
                  <span className='text-xs'>{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              アイコン
            </label>
            <div className='grid grid-cols-10 gap-2'>
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type='button'
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-2 rounded border text-lg ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className='flex space-x-3'>
            <Button
              variant='primary'
              onClick={handleAdd}
              disabled={!formData.name.trim()}
              className='flex-1'
            >
              追加
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowAddModal(false)}
              className='flex-1'
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='カテゴリを編集'
      >
        <div className='space-y-4'>
          <Input
            label='カテゴリ名'
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder='カテゴリ名を入力'
            required
          />

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              色
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color.value}
                  type='button'
                  onClick={() =>
                    setFormData(prev => ({ ...prev, color: color.value }))
                  }
                  className={`p-2 rounded border text-sm ${
                    formData.color === color.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mx-auto mb-1 ${color.preview}`}
                  ></div>
                  <span className='text-xs'>{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              アイコン
            </label>
            <div className='grid grid-cols-10 gap-2'>
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type='button'
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-2 rounded border text-lg ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className='flex space-x-3'>
            <Button
              variant='primary'
              onClick={handleEdit}
              disabled={!formData.name.trim()}
              className='flex-1'
            >
              更新
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowEditModal(false)}
              className='flex-1'
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title='カテゴリを削除'
      >
        <div className='space-y-4'>
          <p className='text-gray-700'>
            このカテゴリを削除してもよろしいですか？このカテゴリを使用している支出は「その他」カテゴリに変更されます。
          </p>
          {selectedCategory && (
            <div className='bg-gray-50 p-3 rounded flex items-center space-x-3'>
              <div className='text-2xl'>{selectedCategory.icon}</div>
              <div>
                <p className='font-medium'>{selectedCategory.name}</p>
                <Badge variant='default' className={selectedCategory.color}>
                  {selectedCategory.name}
                </Badge>
              </div>
            </div>
          )}
          <div className='flex space-x-3'>
            <Button
              variant='destructive'
              onClick={handleDelete}
              className='flex-1'
            >
              削除
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowDeleteModal(false)}
              className='flex-1'
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
