'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { useSettlement } from '@/hooks/useSettlement';
import { formatDate } from '@/lib/utils';
import { Settlement } from '@/types/settlement';

export function SettlementHistory() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

    const {
        isLoading,
        error,
        settlements,
        settlementsTotal,
        fetchSettlements,
        settlementDetail,
        fetchSettlementDetail,
        clearError,
    } = useSettlement();

    useEffect(() => {
        fetchSettlements(currentPage);
    }, [currentPage, fetchSettlements]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(amount);
    };

    const getWhoShouldPayText = (whoPayWhom: string, amount: number) => {
        if (whoPayWhom === 'user1_pays_user2') {
            return `ユーザー1 → ユーザー2: ${formatCurrency(amount)}`;
        } else if (whoPayWhom === 'user2_pays_user1') {
            return `ユーザー2 → ユーザー1: ${formatCurrency(amount)}`;
        }
        return '精算不要';
    };

    const handleViewDetail = async (settlement: Settlement) => {
        setSelectedSettlement(settlement);
        await fetchSettlementDetail(settlement.id);
    };

    const handleCloseDetail = () => {
        setSelectedSettlement(null);
    };

    const itemsPerPage = 10;
    const totalPages = Math.ceil(settlementsTotal / itemsPerPage);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>精算履歴</CardTitle>
                    <CardDescription>
                        過去の精算記録を確認できます
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                            <Button variant="outline" size="sm" onClick={clearError}>
                                エラーを閉じる
                            </Button>
                        </Alert>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : settlements.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            精算履歴がありません
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {settlements.map((settlement) => (
                                    <div
                                        key={settlement.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        #{settlement.id}
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(settlement.period_start)} 〜 {formatDate(settlement.period_end)}
                                                    </span>
                                                </div>
                                                <p className="font-medium">
                                                    {getWhoShouldPayText(
                                                        settlement.details.who_pays_whom,
                                                        settlement.details.settlement_amount
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    精算日: {formatDate(settlement.settlement_date)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    対象支出: {settlement.details.expense_count}件
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetail(settlement)}
                                            >
                                                詳細
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        前へ
                                    </Button>

                                    <span className="px-3 py-1 text-sm">
                                        {currentPage} / {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        次へ
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {selectedSettlement && settlementDetail && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>精算詳細 #{selectedSettlement.id}</CardTitle>
                                <CardDescription>
                                    {formatDate(settlementDetail.period_start)} 〜 {formatDate(settlementDetail.period_end)}
                                </CardDescription>
                            </div>
                            <Button variant="outline" onClick={handleCloseDetail}>
                                閉じる
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">精算結果</h4>
                            <p className="text-lg font-bold text-blue-700">
                                {getWhoShouldPayText(
                                    settlementDetail.details.who_pays_whom,
                                    settlementDetail.details.settlement_amount
                                )}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h5 className="font-medium">ユーザー1</h5>
                                <p>支払い合計: {formatCurrency(settlementDetail.details.user1_paid_total)}</p>
                                <p>負担予定額: {formatCurrency(settlementDetail.details.user1_should_pay)}</p>
                            </div>

                            <div className="space-y-2">
                                <h5 className="font-medium">ユーザー2</h5>
                                <p>支払い合計: {formatCurrency(settlementDetail.details.user2_paid_total)}</p>
                                <p>負担予定額: {formatCurrency(settlementDetail.details.user2_should_pay)}</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            <p>精算確定日: {formatDate(settlementDetail.settlement_date)}</p>
                            <p>対象支出件数: {settlementDetail.details.expense_count}件</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 
