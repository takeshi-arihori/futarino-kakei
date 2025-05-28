// ユーザー関連の型定義
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    couple_id?: number;
    created_at: string;
    updated_at: string;
}

// カップル関連の型定義
export interface Couple {
    id: number;
    name?: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

// カテゴリ関連の型定義
export interface Category {
    id: number;
    name: string;
    color?: string;
    icon?: string;
}

// 支出関連の型定義
export interface Expense {
    id: number;
    user_id: number;
    amount: number;
    description: string;
    category: string;
    date: string;
    memo?: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

// 精算関連の型定義
export interface Settlement {
    id: number;
    couple_id: number;
    amount: number;
    from_user_id: number;
    to_user_id: number;
    period_start: string;
    period_end: string;
    status: 'pending' | 'completed';
    created_at: string;
    updated_at: string;
}

// 予算関連の型定義
export interface Budget {
    id: number;
    couple_id: number;
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    year: number;
    month?: number;
    created_at: string;
    updated_at: string;
}

// 分担比率の型定義
export interface SharingRatio {
    id: number;
    couple_id: number;
    category_id?: number;
    category?: Category;
    user1_ratio: number;
    user2_ratio: number;
    created_at: string;
    updated_at: string;
}

// API レスポンスの型定義
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: {
        data: T[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

// フォーム関連の型定義
export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface ExpenseForm {
    amount: number;
    description: string;
    category: string;
    date: string;
    memo?: string;
}

export interface CategoryForm {
    name: string;
    color?: string;
}

export interface BudgetForm {
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    year: number;
    month?: number;
}

// 統計・レポート関連の型定義
export interface ExpenseStats {
    total: number;
    count: number;
    average: number;
    by_category: Record<string, number>;
    by_month: Record<string, number>;
}

export interface MonthlyReport {
    period: string;
    total_expenses: number;
    user1_expenses: number;
    user2_expenses: number;
    category_breakdown: {
        category: Category;
        amount: number;
        user1_amount: number;
        user2_amount: number;
    }[];
    budget_comparison: {
        category: Category;
        budgeted: number;
        actual: number;
        variance: number;
    }[];
}

export interface DashboardStats {
    this_month_total: number;
    last_month_total: number;
    this_month_count: number;
    recent_expenses: Expense[];
    category_breakdown: Record<string, number>;
    monthly_trend: Record<string, number>;
}

// フィルター関連の型定義
export interface ExpenseFilter {
    start_date?: string;
    end_date?: string;
    category?: string;
    user_id?: number;
    min_amount?: number;
    max_amount?: number;
    search?: string;
}

// ソート関連の型定義
export interface SortOption {
    field: 'date' | 'amount' | 'category' | 'description';
    direction: 'asc' | 'desc';
} 
