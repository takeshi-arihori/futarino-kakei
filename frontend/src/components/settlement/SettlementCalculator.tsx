'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useSettlement } from '@/hooks/useSettlement';
import { formatDate } from '@/lib/utils';

export function SettlementCalculator() {
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');

    const {
        isLoading,
        error,
        calculationResult,
        calculate,
        confirm,
        clearError,
        clearCalculation,
    } = useSettlement();

    const handleCalculate = async () => {
        if (!periodStart || !periodEnd) {
            return;
        }

        await calculate({
            period_start: periodStart,
            period_end: periodEnd,
        });
    };

    const handleConfirm = async () => {
        if (!calculationResult) return;

        const expenseIds = calculationResult.expenses.map(expense => expense.id);

        await confirm({
            period_start: calculationResult.period_start,
            period_end: calculationResult.period_end,
            expense_ids: expenseIds,
        });

        // 成功後にフォームをリセット
        setPeriodStart('');
        setPeriodEnd('');
        clearCalculation();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(amount);
    };

    const getWhoShouldPayText = (whoPayWhom: string, amount: number) => {
        if (whoPayWhom === 'user1_pays_user2') {
            return `ユーザー1がユーザー2に ${formatCurrency(amount)} 支払う`;
        } else if (whoPayWhom === 'user2_pays_user1') {
            return `ユーザー2がユーザー1に ${formatCurrency(amount)} 支払う`;
        }
        return '精算不要';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>精算計算</CardTitle>
                    <CardDescription>
                        指定期間の支出を集計して精算額を計算します
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                            <Button variant="outline" size="sm" onClick={clearError}>
                                エラーを閉じる
                            </Button>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="period-start">期間開始日</Label>
                            <Input
                                id="period-start"
                                type="date"
                                value={periodStart}
                                onChange={(e) => setPeriodStart(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="period-end">期間終了日</Label>
                            <Input
                                id="period-end"
                                type="date"
                                value={periodEnd}
                                onChange={(e) => setPeriodEnd(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleCalculate}
                        disabled={!periodStart || !periodEnd || isLoading}
                        className="w-full"
                    >
                        {isLoading ? <Spinner size="sm" /> : '精算額を計算'}
                    </Button>
                </CardContent>
            </Card>

            {calculationResult && (
                <Card>
                    <CardHeader>
                        <CardTitle>精算結果</CardTitle>
                        <CardDescription>
                            {formatDate(calculationResult.period_start)} 〜 {formatDate(calculationResult.period_end)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 精算サマリー */}
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <h4 className="font-semibold text-lg">精算額</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                {getWhoShouldPayText(calculationResult.who_pays_whom, calculationResult.settlement_amount)}
                            </p>
                        </div>

                        {/* 詳細情報 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h5 className="font-medium">ユーザー1</h5>
                                <p>支払い合計: {formatCurrency(calculationResult.user1_paid_total)}</p>
                                <p>負担予定額: {formatCurrency(calculationResult.user1_should_pay)}</p>
                            </div>

                            <div className="space-y-2">
                                <h5 className="font-medium">ユーザー2</h5>
                                <p>支払い合計: {formatCurrency(calculationResult.user2_paid_total)}</p>
                                <p>負担予定額: {formatCurrency(calculationResult.user2_should_pay)}</p>
                            </div>
                        </div>

                        {/* 対象支出一覧 */}
                        <div className="space-y-2">
                            <h5 className="font-medium">対象支出 ({calculationResult.expenses.length}件)</h5>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {calculationResult.expenses.map((expense) => (
                                    <div key={expense.id} className="flex justify-between items-center p-2 border rounded">
                                        <div>
                                            <p className="font-medium">{expense.memo || '支出'}</p>
                                            <p className="text-sm text-gray-600">{formatDate(expense.date)}</p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full"
                            variant="default"
                        >
                            {isLoading ? <Spinner size="sm" /> : '精算を確定する'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 
