'use client';

import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseFilters } from '@/types/expense';
import { ExpenseFilters as ExpenseFiltersComponent } from './ExpenseFilters';
import { ExpenseList } from './ExpenseList';

export function ExpenseListScreen() {
    const [filters, setFilters] = useState<ExpenseFilters>({});
    const { expenses, total, isLoading, error, deleteExpense } = useExpenses(filters);

    const handleFilterChange = (newFilters: ExpenseFilters) => {
        setFilters(newFilters);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('この支出を削除しますか？')) {
            try {
                await deleteExpense(id);
            } catch (error) {
                alert('削除に失敗しました。もう一度お試しください。');
            }
        }
    };

    const handleEdit = (id: string) => {
        // TODO: 編集画面への遷移を実装
        console.log('Edit expense:', id);
    };

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">データの取得に失敗しました: {error.message}</p>
                <button
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => window.location.reload()}
                >
                    再読み込み
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">支出一覧</h1>
                <div className="text-sm text-gray-600">
                    合計: {total}件
                </div>
            </div>

            <ExpenseFiltersComponent
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <ExpenseList
                    expenses={expenses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
} 
