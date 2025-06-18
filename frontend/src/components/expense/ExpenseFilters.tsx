'use client';

import { useState } from 'react';
import { ExpenseFilters as ExpenseFiltersType } from '@/types/expense';

interface ExpenseFiltersProps {
    filters: ExpenseFiltersType;
    onFilterChange: (filters: ExpenseFiltersType) => void;
}

export function ExpenseFilters({ filters, onFilterChange }: ExpenseFiltersProps) {
    const [localFilters, setLocalFilters] = useState<ExpenseFiltersType>(filters);

    const handleInputChange = (field: keyof ExpenseFiltersType, value: string) => {
        const newFilters = {
            ...localFilters,
            [field]: value || undefined,
        };
        setLocalFilters(newFilters);
    };

    const handleApplyFilters = () => {
        onFilterChange(localFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {};
        setLocalFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">フィルター</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        開始日
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        value={localFilters.startDate || ''}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        終了日
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        value={localFilters.endDate || ''}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        カテゴリ
                    </label>
                    <select
                        id="category"
                        value={localFilters.category || ''}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">すべて</option>
                        <option value="食費">食費</option>
                        <option value="交通費">交通費</option>
                        <option value="娯楽">娯楽</option>
                        <option value="日用品">日用品</option>
                        <option value="その他">その他</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="payer" className="block text-sm font-medium text-gray-700 mb-1">
                        支払者
                    </label>
                    <select
                        id="payer"
                        value={localFilters.payer || ''}
                        onChange={(e) => handleInputChange('payer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">すべて</option>
                        <option value="user1">ユーザー1</option>
                        <option value="user2">ユーザー2</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    検索
                </button>
                <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    クリア
                </button>
            </div>
        </div>
    );
} 
