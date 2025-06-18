import {
    SettlementCalculateRequest,
    SettlementCalculateResponse,
    SettlementConfirmRequest,
    Settlement,
    SettlementsResponse,
} from '@/types/settlement';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// APIレスポンスの共通インターフェース
interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

// 認証トークンを取得
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

// 共通のfetch関数
const apiFetch = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
};

// 精算計算API
export const calculateSettlement = async (
    request: SettlementCalculateRequest
): Promise<SettlementCalculateResponse> => {
    return apiFetch<SettlementCalculateResponse>('/api/settlements/calculate', {
        method: 'POST',
        body: JSON.stringify(request),
    });
};

// 精算確定API
export const confirmSettlement = async (
    request: SettlementConfirmRequest
): Promise<Settlement> => {
    return apiFetch<Settlement>('/api/settlements/confirm', {
        method: 'POST',
        body: JSON.stringify(request),
    });
};

// 精算履歴取得API
export const getSettlements = async (
    page: number = 1,
    limit: number = 10
): Promise<SettlementsResponse> => {
    return apiFetch<SettlementsResponse>(
        `/api/settlements?page=${page}&limit=${limit}`
    );
};

// 特定の精算詳細取得API
export const getSettlementById = async (id: number): Promise<Settlement> => {
    return apiFetch<Settlement>(`/api/settlements/${id}`);
}; 
