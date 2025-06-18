export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    payer: string;
    date: string;
    isSettled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseFilters {
    startDate?: string;
    endDate?: string;
    category?: string;
    payer?: string;
}

export interface ExpenseApiResponse {
    expenses: Expense[];
    total: number;
    page: number;
    totalPages: number;
} 
