import useSWR, { mutate } from 'swr';
import { expenseApi } from '@/lib/api/expense';
import { ExpenseFilters, ExpenseApiResponse } from '@/types/expense';

export function useExpenses(filters?: ExpenseFilters) {
    const key = filters ? `expenses-${JSON.stringify(filters)}` : 'expenses';

    const { data, error, isLoading } = useSWR<ExpenseApiResponse>(
        key,
        () => expenseApi.getExpenses(filters),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1分間のキャッシュ
        }
    );

    const deleteExpense = async (id: string) => {
        try {
            await expenseApi.deleteExpense(id);
            // 一覧を再取得
            mutate(key);
        } catch (error) {
            console.error('Failed to delete expense:', error);
            throw error;
        }
    };

    return {
        expenses: data?.expenses || [],
        total: data?.total || 0,
        isLoading,
        error,
        deleteExpense,
        refresh: () => mutate(key),
    };
} 
