'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/types';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, isInitialized, initializeAuth } = useAuthStore();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    // 初期化されていない場合は初期化を実行
    if (!isInitialized) {
      console.log('🔍 Initializing auth on login page...');
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    // 初期化済みで認証されている場合はダッシュボードにリダイレクト
    if (isInitialized && isAuthenticated) {
      console.log('✅ User is already authenticated, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log('📝 Login form submitted:', { email: data.email });
      setError('');

      console.log('🚀 Calling login function...');
      await login(data.email, data.password);

      console.log('✅ Login function completed successfully');
      console.log('🎯 Attempting redirect to dashboard...');
      router.push('/dashboard');
      console.log('✅ Redirect initiated');
    } catch (err: unknown) {
      console.error('❌ Login form error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('ログインに失敗しました');
      }
    }
  };

  // 初期化中またはローディング中の場合はローディング表示
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

  // 既に認証済みの場合は何も表示しない（リダイレクト中）
  if (isAuthenticated) {
    return null;
  }

  return (
    <Container component="main" maxWidth="xs" className="min-h-screen flex items-center justify-center">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
        className="w-full"
      >
        <Typography component="h1" variant="h4" className="font-bold" color="primary" gutterBottom>
          ふたりの家計
        </Typography>
        <Typography component="h2" variant="h6" className="font-bold" gutterBottom>
          ログイン
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }} className="w-full">
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="メールアドレス"
            autoComplete="email"
            autoFocus
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'メールアドレスは必須です',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '有効なメールアドレスを入力してください',
              },
            })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="パスワード"
            type="password"
            id="password"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'パスワードは必須です',
              minLength: {
                value: 6,
                message: 'パスワードは6文字以上で入力してください',
              },
            })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'ログイン'}
          </Button>
          <Box className="flex justify-between items-center">
            <Link href="/register" variant="body2">
              アカウントをお持ちでないですか？ 新規登録
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
