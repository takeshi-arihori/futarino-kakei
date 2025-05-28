'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const router = useRouter();
    const { isAuthenticated, isLoading, isInitialized, checkAuth, initializeAuth } = useAuthStore();

    useEffect(() => {
        // 初期化されていない場合は初期化を実行
        if (!isInitialized) {
            initializeAuth();
        }

        // 初期化済みで認証されていない場合のみ認証チェック
        if (isInitialized && !isAuthenticated && !isLoading) {
            checkAuth();
        }
    }, [isInitialized, isAuthenticated, isLoading, checkAuth, initializeAuth]);

    useEffect(() => {
        // 初期化済みで認証されていない場合はログインページにリダイレクト
        if (isInitialized && !isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, isInitialized, router]);

    // 初期化中またはローディング中
    if (!isInitialized || isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // 認証されていない場合（リダイレクト中）
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}; 
