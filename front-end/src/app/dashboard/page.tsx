'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    CircularProgress,
} from '@mui/material';
import {
    TrendingUp,
    AccountBalance,
    Receipt,
    Assessment,
} from '@mui/icons-material';
import { AuthGuard } from '@/components/Layout/AuthGuard';
import { Header } from '@/components/Layout/Header';
import { useAuthStore } from '@/store/authStore';
import { useExpenseStore } from '@/store/expenseStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DashboardStats {
    thisMonthTotal: number;
    lastMonthTotal: number;
    thisMonthExpenseCount: number;
    pendingSettlementAmount: number;
}

const Dashboard: React.FC = () => {
    const { user } = useAuthStore();
    const { expenses, fetchExpenses, fetchCategories } = useExpenseStore();
    const [stats, setStats] = useState<DashboardStats>({
        thisMonthTotal: 0,
        lastMonthTotal: 0,
        thisMonthExpenseCount: 0,
        pendingSettlementAmount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            // 既にデータが読み込まれている場合はスキップ
            if (dataLoaded) {
                setIsLoading(false);
                return;
            }

            try {
                console.log('📊 Loading dashboard data...');
                await Promise.all([
                    fetchExpenses(),
                    fetchCategories(),
                ]);
                setDataLoaded(true);
                console.log('✅ Dashboard data loaded');
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [fetchExpenses, fetchCategories, dataLoaded]);

    // expensesが変更されたときに統計を再計算
    useEffect(() => {
        if (expenses.length > 0) {
            console.log('📈 Calculating stats from expenses:', expenses.length);
            // 今月と先月の統計を計算
            const now = new Date();
            const thisMonth = format(now, 'yyyy-MM');
            const lastMonth = format(new Date(now.getFullYear(), now.getMonth() - 1), 'yyyy-MM');

            const thisMonthExpenses = expenses.filter(expense =>
                expense.date.startsWith(thisMonth)
            );
            const lastMonthExpenses = expenses.filter(expense =>
                expense.date.startsWith(lastMonth)
            );

            setStats({
                thisMonthTotal: thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
                lastMonthTotal: lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
                thisMonthExpenseCount: thisMonthExpenses.length,
                pendingSettlementAmount: 0, // TODO: 実際の精算データから計算
            });
            console.log('✅ Stats calculated');
        }
    }, [expenses]);

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
    }> = ({ title, value, icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div">
                            {typeof value === 'number' ? `¥${value.toLocaleString()}` : value}
                        </Typography>
                    </Box>
                    <Box sx={{ color, fontSize: 40 }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return (
            <AuthGuard>
                <Header />
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </Container>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, p: 3 }}>
                <Box mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        ダッシュボード
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {user?.name}さん、おかえりなさい！
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
                    <StatCard
                        title="今月の支出"
                        value={stats.thisMonthTotal}
                        icon={<Receipt />}
                        color="#2E7D32"
                    />
                    <StatCard
                        title="先月の支出"
                        value={stats.lastMonthTotal}
                        icon={<TrendingUp />}
                        color="#1976D2"
                    />
                    <StatCard
                        title="今月の記録数"
                        value={`${stats.thisMonthExpenseCount}件`}
                        icon={<Assessment />}
                        color="#ED6C02"
                    />
                    <StatCard
                        title="精算予定額"
                        value={stats.pendingSettlementAmount}
                        icon={<AccountBalance />}
                        color="#9C27B0"
                    />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            最近の支出
                        </Typography>
                        {expenses.slice(0, 5).map((expense) => (
                            <Box
                                key={expense.id}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                py={1}
                                borderBottom="1px solid #eee"
                            >
                                <Box>
                                    <Typography variant="body1">{expense.description}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {expense.category} • {format(new Date(expense.date), 'MM/dd', { locale: ja })}
                                    </Typography>
                                </Box>
                                <Typography variant="h6" color="primary">
                                    ¥{expense.amount.toLocaleString()}
                                </Typography>
                            </Box>
                        ))}
                        <Box mt={2}>
                            <Button variant="outlined" fullWidth href="/expenses">
                                すべての支出を見る
                            </Button>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            クイックアクション
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                startIcon={<Receipt />}
                                href="/expenses/new"
                                fullWidth
                            >
                                支出を記録
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<AccountBalance />}
                                href="/settlements"
                                fullWidth
                            >
                                精算を確認
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Assessment />}
                                href="/reports"
                                fullWidth
                            >
                                レポートを見る
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </AuthGuard>
    );
};

export default Dashboard; 
