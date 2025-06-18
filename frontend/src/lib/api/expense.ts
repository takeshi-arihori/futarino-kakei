import axios from 'axios';
import { Expense, ExpenseFilters, ExpenseApiResponse } from '@/types/expense';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const expenseApi = {
    getExpenses: async (filters?: ExpenseFilters): Promise<ExpenseApiResponse> => {
        const params = new URLSearchParams();

        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.payer) params.append('payer', filters.payer);

        const response = await apiClient.get<ExpenseApiResponse>(`/api/expenses?${params.toString()}`);
        return response.data;
    },

    deleteExpense: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/expenses/${id}`);
    },

    updateExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
        const response = await apiClient.put<Expense>(`/api/expenses/${id}`, data);
        return response.data;
    },
}; 
