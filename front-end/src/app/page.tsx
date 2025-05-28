'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Security,
  Smartphone,
  Group,
  Assessment,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    // 初期化されていない場合は初期化を実行
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    // 初期化済みで認証されている場合はダッシュボードにリダイレクト
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);

  // 初期化中の場合はローディング表示
  if (!isInitialized) {
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

  // 認証済みの場合は何も表示しない（リダイレクト中）
  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: <Group fontSize="large" />,
      title: 'カップル・夫婦専用',
      description: '二人の家計を一緒に管理。お互いの支出を透明化し、共通の目標に向かって貯金できます。',
    },
    {
      icon: <AccountBalance fontSize="large" />,
      title: '簡単な支出管理',
      description: '日々の支出を簡単に記録。カテゴリ別に分類して、どこにお金を使っているかが一目瞭然。',
    },
    {
      icon: <Assessment fontSize="large" />,
      title: '詳細なレポート',
      description: '月別・カテゴリ別の詳細なレポートで、家計の傾向を把握。改善点が見つかります。',
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: '予算管理',
      description: 'カテゴリ別に予算を設定。使いすぎを防ぎ、計画的な家計管理をサポートします。',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'セキュア',
      description: '銀行レベルのセキュリティで大切な家計データを保護。安心してご利用いただけます。',
    },
    {
      icon: <Smartphone fontSize="large" />,
      title: 'どこでも利用可能',
      description: 'スマートフォン・タブレット・PCに対応。外出先でもすぐに支出を記録できます。',
    },
  ];

  return (
    <Box>
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            ふたりの家計
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            カップル・夫婦のための家計管理アプリ
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, opacity: 0.9 }}>
            二人で一緒に家計を管理し、共通の目標に向かって貯金しましょう。
            <br />
            透明性のある家計管理で、より良い関係を築けます。
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={NextLink}
              href="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                px: 4,
                py: 1.5,
              }}
            >
              無料で始める
            </Button>
            <Button
              component={NextLink}
              href="/login"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 4,
                py: 1.5,
              }}
            >
              ログイン
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 機能紹介セクション */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          主な機能
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 8 }}>
          ふたりの家計管理を簡単にする機能が満載
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 4 }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* 価格セクション */}
      <Box sx={{ bgcolor: 'grey.50', py: 12 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            料金プラン
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 8 }}>
            シンプルで分かりやすい料金体系
          </Typography>

          <Card sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Chip label="おすすめ" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h4" component="h3" gutterBottom fontWeight="bold">
                無料プラン
              </Typography>
              <Typography variant="h2" component="div" color="primary" gutterBottom>
                ¥0
                <Typography component="span" variant="h6" color="text.secondary">
                  /月
                </Typography>
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                すべての基本機能が無料でご利用いただけます
              </Typography>
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>✓ 支出・収入の記録</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>✓ カテゴリ別管理</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>✓ 月次レポート</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>✓ 予算設定</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>✓ パートナーとの共有</Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                component={NextLink}
                href="/register"
                variant="contained"
                size="large"
                fullWidth
              >
                今すぐ始める
              </Button>
            </CardActions>
          </Card>
        </Container>
      </Box>

      {/* CTAセクション */}
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            今すぐ始めましょう
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            アカウント作成は1分で完了。今日から二人の家計管理を始めませんか？
          </Typography>
          <Button
            component={NextLink}
            href="/register"
            variant="contained"
            size="large"
            sx={{ px: 6, py: 2 }}
          >
            無料でアカウント作成
          </Button>
        </Container>
      </Box>

      {/* フッター */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ふたりの家計
              </Typography>
              <Typography variant="body2" color="grey.400">
                カップル・夫婦のための家計管理アプリ。
                二人で一緒に家計を管理し、共通の目標に向かって貯金しましょう。
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                機能
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" color="grey.400" underline="hover">支出管理</Link>
                <Link href="#" color="grey.400" underline="hover">予算設定</Link>
                <Link href="#" color="grey.400" underline="hover">レポート</Link>
                <Link href="#" color="grey.400" underline="hover">パートナー共有</Link>
              </Box>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                サポート
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" color="grey.400" underline="hover">ヘルプ</Link>
                <Link href="#" color="grey.400" underline="hover">お問い合わせ</Link>
                <Link href="#" color="grey.400" underline="hover">プライバシーポリシー</Link>
                <Link href="#" color="grey.400" underline="hover">利用規約</Link>
              </Box>
            </Box>
          </Box>
          <Box sx={{ borderTop: '1px solid', borderColor: 'grey.700', mt: 6, pt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="grey.400">
              © 2024 ふたりの家計. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
