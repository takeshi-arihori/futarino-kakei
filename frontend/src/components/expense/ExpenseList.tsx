'use client';

import { Expense } from '@/types/expense';

interface ExpenseListProps {
    expenses: Expense[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP');
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(amount);
    };

    if (expenses.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">支出データがありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                日付
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                内容
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                金額
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                カテゴリ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                支払者
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ステータス
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {expenses.map((expense) => (
                            <tr
                                key={expense.id}
                                className={`hover:bg-gray-50 ${expense.isSettled ? 'bg-green-50' : 'bg-white'
                                    }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(expense.date)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="max-w-xs truncate" title={expense.description}>
                                        {expense.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatAmount(expense.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {expense.payer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expense.isSettled
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {expense.isSettled ? '精算済み' : '未精算'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={() => onEdit(expense.id)}
                                            disabled={expense.isSettled}
                                            className={`text-blue-600 hover:text-blue-900 ${expense.isSettled ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            title={expense.isSettled ? '精算済みの支出は編集できません' : '編集'}
                                        >
                                            編集
                                        </button>
                                        <button
                                            onClick={() => onDelete(expense.id)}
                                            disabled={expense.isSettled}
                                            className={`text-red-600 hover:text-red-900 ${expense.isSettled ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            title={expense.isSettled ? '精算済みの支出は削除できません' : '削除'}
                                        >
                                            削除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 
