import { create } from 'zustand';
import { Expense, Category, ExpenseForm } from '@/types';
import { apiClient } from '@/lib/api';

interface ExpenseState {
    expenses: Expense[];
    categories: Category[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    filters: {
        category_id?: number;
        user_id?: number;
        start_date?: string;
        end_date?: string;
    };

    // Actions
    fetchExpenses: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    createExpense: (data: ExpenseForm) => Promise<void>;
    updateExpense: (id: number, data: Partial<ExpenseForm>) => Promise<void>;
    deleteExpense: (id: number) => Promise<void>;
    setFilters: (filters: Partial<ExpenseState['filters']>) => void;
    setPage: (page: number) => void;
    clearFilters: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
    expenses: [],
    categories: [],
    isLoading: false,
    currentPage: 1,
    totalPages: 1,
    filters: {},

    fetchExpenses: async () => {
        set({ isLoading: true });
        try {
            const { filters, currentPage } = get();
            if (process.env.NODE_ENV === 'development') {
                console.log('Fetching expenses with:', { filters, currentPage });
            }

            const response = await apiClient.getExpenses(
                filters,
                undefined, // sort
                currentPage
            );

            if (process.env.NODE_ENV === 'development') {
                console.log('Expenses response:', response);
            }

            set({
                expenses: response.data.data,
                currentPage: response.data.current_page,
                totalPages: response.data.last_page,
                isLoading: false,
            });
        } catch (error: unknown) {
            console.error('Failed to fetch expenses:', error);
            throw error;
        }
    },

    fetchCategories: async () => {
        try {
            const response = await apiClient.getCategories();
            set({ categories: response.data });
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    },

    createExpense: async (data: ExpenseForm) => {
        set({ isLoading: true });
        try {
            await apiClient.createExpense(data);
            // 作成後にリストを再取得
            await get().fetchExpenses();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    updateExpense: async (id: number, data: Partial<ExpenseForm>) => {
        set({ isLoading: true });
        try {
            await apiClient.updateExpense(id, data);
            // 更新後にリストを再取得
            await get().fetchExpenses();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    deleteExpense: async (id: number) => {
        set({ isLoading: true });
        try {
            await apiClient.deleteExpense(id);
            // 削除後にリストを再取得
            await get().fetchExpenses();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    setFilters: (newFilters: Partial<ExpenseState['filters']>) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            currentPage: 1, // フィルター変更時はページをリセット
        }));
        // フィルター変更後に自動で再取得
        get().fetchExpenses();
    },

    setPage: (page: number) => {
        set({ currentPage: page });
        get().fetchExpenses();
    },

    clearFilters: () => {
        set({ filters: {}, currentPage: 1 });
        get().fetchExpenses();
    },
})); 
