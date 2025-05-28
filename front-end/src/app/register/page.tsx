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
import { RegisterForm } from '@/types';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>();

  const password = watch('password');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await registerUser(data.name, data.email, data.password, data.password_confirmation);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('登録に失敗しました');
      }
    }
  };

  // 認証チェック中の場合はローディング表示
  if (isLoading) {
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
          新規登録
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
            id="name"
            label="お名前"
            autoComplete="name"
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name', {
              required: 'お名前は必須です',
              minLength: {
                value: 2,
                message: 'お名前は2文字以上で入力してください',
              },
            })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="メールアドレス"
            autoComplete="email"
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
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'パスワードは必須です',
              minLength: {
                value: 8,
                message: 'パスワードは8文字以上で入力してください',
              },
            })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="パスワード（確認）"
            type="password"
            id="password_confirmation"
            autoComplete="new-password"
            error={!!errors.password_confirmation}
            helperText={errors.password_confirmation?.message}
            {...register('password_confirmation', {
              required: 'パスワード（確認）は必須です',
              validate: (value) =>
                value === password || 'パスワードが一致しません',
            })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : '新規登録'}
          </Button>
          <Box className="flex justify-center items-center">
            <Link href="/login" variant="body2">
              すでにアカウントをお持ちですか？ ログイン
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
