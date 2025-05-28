/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    User,
    Expense,
    Category,
    Settlement,
    Budget,
    SharingRatio,
    ApiResponse,
    PaginatedResponse,
    LoginForm,
    RegisterForm,
    ExpenseForm,
    CategoryForm,
    BudgetForm,
    ExpenseStats,
    MonthlyReport,
    ExpenseFilter,
    SortOption,
    DashboardStats
} from '@/types';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        console.log('API Client Configuration:', {
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            baseURL: baseURL,
            NODE_ENV: process.env.NODE_ENV
        });

        this.client = axios.create({
            baseURL: baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            withCredentials: false,
        });

        // リクエストインターセプター
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                console.log('API Request Details:', {
                    url: config.url,
                    method: config.method,
                    baseURL: config.baseURL,
                    fullURL: `${config.baseURL}${config.url}`,
                    headers: config.headers,
                    data: config.data,
                    token: token ? `${token.substring(0, 10)}...` : 'なし'
                });
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // レスポンスインターセプター
        this.client.interceptors.response.use(
            (response: AxiosResponse<ApiResponse>) => {
                console.log('API Response Details:', {
                    url: response.config.url,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    data: response.data
                });
                return response;
            },
            (error) => {
                console.error('API Error Details:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    message: error.message,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    code: error.code,
                    stack: error.stack,
                    // ネットワークエラーの詳細情報
                    isNetworkError: !error.response,
                    isTimeoutError: error.code === 'ECONNABORTED',
                    isCancelledError: error.message?.includes('canceled'),
                    request: error.request ? {
                        readyState: error.request.readyState,
                        status: error.request.status,
                        statusText: error.request.statusText,
                        responseURL: error.request.responseURL,
                        responseText: error.request.responseText?.substring(0, 500)
                    } : null
                });

                // ネットワークエラーの場合の追加情報
                if (!error.response) {
                    console.error('Network Error - No response received:', {
                        baseURL: this.client.defaults.baseURL,
                        timeout: this.client.defaults.timeout,
                        withCredentials: this.client.defaults.withCredentials,
                        headers: this.client.defaults.headers
                    });
                }

                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // 認証関連
    async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await this.client.post('/login', { email, password });
        return response.data;
    }

    async register(name: string, email: string, password: string, password_confirmation: string): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await this.client.post('/register', {
            name,
            email,
            password,
            password_confirmation
        });
        return response.data;
    }

    async logout(): Promise<ApiResponse> {
        const response = await this.client.post('/logout');
        return response.data;
    }

    async getUser(): Promise<ApiResponse<User>> {
        const response = await this.client.get('/user');
        return response.data;
    }

    // 支出関連
    async getExpenses(filter?: ExpenseFilter, sort?: SortOption, page = 1): Promise<PaginatedResponse<Expense>> {
        const params = new URLSearchParams();

        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }

        if (sort) {
            params.append('sort_field', sort.field);
            params.append('sort_direction', sort.direction);
        }

        params.append('page', page.toString());

        const response = await this.client.get(`/expenses?${params.toString()}`);
        return response.data;
    }

    async getExpense(id: number): Promise<ApiResponse<Expense>> {
        const response = await this.client.get(`/expenses/${id}`);
        return response.data;
    }

    async createExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Expense>> {
        const response = await this.client.post('/expenses', expense);
        return response.data;
    }

    async updateExpense(id: number, expense: Partial<Expense>): Promise<ApiResponse<Expense>> {
        const response = await this.client.put(`/expenses/${id}`, expense);
        return response.data;
    }

    async deleteExpense(id: number): Promise<ApiResponse> {
        const response = await this.client.delete(`/expenses/${id}`);
        return response.data;
    }

    // カテゴリ関連
    async getCategories(): Promise<ApiResponse<Category[]>> {
        const response = await this.client.get('/categories');
        return response.data;
    }

    async createCategory(category: Omit<Category, 'id'>): Promise<ApiResponse<Category>> {
        const response = await this.client.post('/categories', category);
        return response.data;
    }

    async updateCategory(id: number, category: Partial<Category>): Promise<ApiResponse<Category>> {
        const response = await this.client.put(`/categories/${id}`, category);
        return response.data;
    }

    async deleteCategory(id: number): Promise<ApiResponse> {
        const response = await this.client.delete(`/categories/${id}`);
        return response.data;
    }

    // 精算関連
    async getSettlements(): Promise<ApiResponse<Settlement[]>> {
        const response = await this.client.get('/settlements');
        return response.data;
    }

    async createSettlement(settlement: Omit<Settlement, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Settlement>> {
        const response = await this.client.post('/settlements', settlement);
        return response.data;
    }

    async updateSettlement(id: number, settlement: Partial<Settlement>): Promise<ApiResponse<Settlement>> {
        const response = await this.client.put(`/settlements/${id}`, settlement);
        return response.data;
    }

    // 予算関連
    async getBudgets(): Promise<ApiResponse<Budget[]>> {
        const response = await this.client.get('/budgets');
        return response.data;
    }

    async createBudget(budget: Omit<Budget, 'id' | 'couple_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Budget>> {
        const response = await this.client.post('/budgets', budget);
        return response.data;
    }

    async updateBudget(id: number, budget: Partial<Budget>): Promise<ApiResponse<Budget>> {
        const response = await this.client.put(`/budgets/${id}`, budget);
        return response.data;
    }

    async deleteBudget(id: number): Promise<ApiResponse> {
        const response = await this.client.delete(`/budgets/${id}`);
        return response.data;
    }

    // 統計・ダッシュボード関連
    async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
        const response = await this.client.get('/dashboard/stats');
        return response.data;
    }

    async getExpenseStats(filter?: ExpenseFilter): Promise<ApiResponse<unknown>> {
        const params = new URLSearchParams();

        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }

        const response = await this.client.get(`/expenses/stats?${params.toString()}`);
        return response.data;
    }

    // 分担比率関連
    async getSharingRatios(): Promise<ApiResponse<SharingRatio[]>> {
        const response = await this.client.get('/sharing-ratios');
        return response.data;
    }

    async updateSharingRatio(data: {
        category_id?: number;
        user1_ratio: number;
        user2_ratio: number;
    }): Promise<ApiResponse<SharingRatio>> {
        const response = await this.client.post('/sharing-ratios', data);
        return response.data;
    }

    // 統計・レポート関連
    async getMonthlyReport(params: {
        year: number;
        month: number;
    }): Promise<ApiResponse<MonthlyReport>> {
        const response = await this.client.get('/reports/monthly', { params });
        return response.data;
    }

    // CSV関連
    async exportExpenses(params: {
        start_date: string;
        end_date: string;
    }): Promise<Blob> {
        const response = await this.client.get('/exports/expenses', {
            params,
            responseType: 'blob',
        });
        return response.data;
    }

    async importExpenses(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await this.client.post('/imports/expenses', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}

export const apiClient = new ApiClient();
export default apiClient; 
