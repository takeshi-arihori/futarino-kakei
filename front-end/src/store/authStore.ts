import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    lastAuthCheck: number | null;
    isInitialized: boolean;
}

interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: (force?: boolean) => Promise<void>;
    initializeAuth: () => void;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

const AUTH_CACHE_DURATION = 5 * 60 * 1000;

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastAuthCheck: null,
            isInitialized: false,

            initializeAuth: () => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    const state = get();
                    if (state.user) {
                        set({
                            isAuthenticated: true,
                            isInitialized: true,
                        });
                    } else {
                        set({
                            isAuthenticated: false,
                            isInitialized: true,
                        });
                    }
                } else {
                    set({
                        isAuthenticated: false,
                        isInitialized: true,
                    });
                }
            },

            login: async (email: string, password: string) => {
                try {
                    console.log('🔐 Login process started');
                    set({ isLoading: true, error: null });

                    console.log('Attempting login with:', { email, baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api' });

                    const response = await apiClient.login(email, password);

                    console.log('✅ Login API response received:', response);

                    if (response.success && response.data) {
                        const { user, token } = response.data;

                        console.log('💾 Storing token in localStorage:', token.substring(0, 10) + '...');
                        localStorage.setItem('auth_token', token);

                        console.log('🔄 Updating auth state:', {
                            userId: user.id,
                            userName: user.name,
                            email: user.email,
                            tokenPrefix: token.substring(0, 10) + '...'
                        });

                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                            lastAuthCheck: Date.now(),
                            isInitialized: true,
                        });

                        console.log('✅ Auth state updated successfully');
                        console.log('🎯 Current auth state:', get());
                    } else {
                        console.error('❌ Login response indicates failure:', response);
                        throw new Error(response.message || 'ログインに失敗しました');
                    }
                } catch (error: unknown) {
                    console.error('❌ Login error occurred:', {
                        error,
                        message: error instanceof Error ? error.message : 'Unknown error',
                        response: error && typeof error === 'object' && 'response' in error ? error.response : undefined,
                        config: error && typeof error === 'object' && 'config' in error ? error.config : undefined,
                        code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
                        stack: error instanceof Error ? error.stack : undefined
                    });

                    const errorMessage = (error && typeof error === 'object' && 'response' in error &&
                        error.response && typeof error.response === 'object' && 'data' in error.response &&
                        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data &&
                        typeof error.response.data.message === 'string')
                        ? error.response.data.message
                        : error instanceof Error ? error.message : 'ログインに失敗しました';

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                        isInitialized: true,
                    });
                    throw new Error(errorMessage);
                }
            },

            register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await apiClient.register(name, email, password, passwordConfirmation);

                    if (response.success && response.data) {
                        const { user, token } = response.data;

                        localStorage.setItem('auth_token', token);

                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                            lastAuthCheck: Date.now(),
                            isInitialized: true,
                        });
                    } else {
                        throw new Error(response.message || 'ユーザー登録に失敗しました');
                    }
                } catch (error: unknown) {
                    const errorMessage = (error && typeof error === 'object' && 'response' in error &&
                        error.response && typeof error.response === 'object' && 'data' in error.response &&
                        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data &&
                        typeof error.response.data.message === 'string')
                        ? error.response.data.message
                        : error instanceof Error ? error.message : 'ユーザー登録に失敗しました';

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                        isInitialized: true,
                    });
                    throw new Error(errorMessage);
                }
            },

            logout: async () => {
                try {
                    set({ isLoading: true });

                    if (get().token) {
                        await apiClient.logout();
                    }
                } catch {
                    console.warn('Logout error occurred');
                } finally {
                    localStorage.removeItem('auth_token');

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        lastAuthCheck: Date.now(),
                        isInitialized: true,
                    });
                }
            },

            checkAuth: async (force = false) => {
                const state = get();

                if (state.isLoading && !force) {
                    return;
                }

                if (!force && state.lastAuthCheck && state.isAuthenticated) {
                    const timeSinceLastCheck = Date.now() - state.lastAuthCheck;
                    if (timeSinceLastCheck < AUTH_CACHE_DURATION) {
                        console.log('🚀 Auth check skipped (cached)');
                        set({ isInitialized: true });
                        return;
                    }
                }

                try {
                    set({ isLoading: true, error: null });

                    const token = localStorage.getItem('auth_token');
                    if (!token) {
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            lastAuthCheck: Date.now(),
                            isInitialized: true,
                        });
                        return;
                    }

                    const response = await apiClient.getUser();

                    if (response.success && response.data) {
                        set({
                            user: response.data,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                            lastAuthCheck: Date.now(),
                            isInitialized: true,
                        });
                    } else {
                        throw new Error('認証に失敗しました');
                    }
                } catch {
                    localStorage.removeItem('auth_token');

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        lastAuthCheck: Date.now(),
                        isInitialized: true,
                    });
                }
            },

            clearError: () => {
                set({ error: null });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                lastAuthCheck: state.lastAuthCheck,
            }),
        }
    )
); 
