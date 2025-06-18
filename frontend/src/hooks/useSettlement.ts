import { useState, useCallback } from 'react';
import {
    SettlementCalculateRequest,
    SettlementCalculateResponse,
    SettlementConfirmRequest,
    Settlement,
    SettlementsResponse,
} from '@/types/settlement';
import {
    calculateSettlement,
    confirmSettlement,
    getSettlements,
    getSettlementById,
} from '@/lib/api/settlement';

interface UseSettlementReturn {
    // State
    isLoading: boolean;
    error: string | null;

    // 精算計算関連
    calculationResult: SettlementCalculateResponse | null;
    calculate: (request: SettlementCalculateRequest) => Promise<void>;

    // 精算確定関連
    confirmedSettlement: Settlement | null;
    confirm: (request: SettlementConfirmRequest) => Promise<void>;

    // 精算履歴関連
    settlements: Settlement[];
    settlementsTotal: number;
    fetchSettlements: (page?: number, limit?: number) => Promise<void>;

    // 特定の精算詳細関連
    settlementDetail: Settlement | null;
    fetchSettlementDetail: (id: number) => Promise<void>;

    // ユーティリティ
    clearError: () => void;
    clearCalculation: () => void;
}

export const useSettlement = (): UseSettlementReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 精算計算関連の状態
    const [calculationResult, setCalculationResult] = useState<SettlementCalculateResponse | null>(null);

    // 精算確定関連の状態
    const [confirmedSettlement, setConfirmedSettlement] = useState<Settlement | null>(null);

    // 精算履歴関連の状態
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [settlementsTotal, setSettlementsTotal] = useState(0);

    // 特定の精算詳細関連の状態
    const [settlementDetail, setSettlementDetail] = useState<Settlement | null>(null);

    // エラーをクリア
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 計算結果をクリア
    const clearCalculation = useCallback(() => {
        setCalculationResult(null);
    }, []);

    // 精算計算
    const calculate = useCallback(async (request: SettlementCalculateRequest) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await calculateSettlement(request);
            setCalculationResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '精算計算に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 精算確定
    const confirm = useCallback(async (request: SettlementConfirmRequest) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await confirmSettlement(request);
            setConfirmedSettlement(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '精算確定に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 精算履歴取得
    const fetchSettlements = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await getSettlements(page, limit);
            setSettlements(result.settlements);
            setSettlementsTotal(result.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : '精算履歴の取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 特定の精算詳細取得
    const fetchSettlementDetail = useCallback(async (id: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await getSettlementById(id);
            setSettlementDetail(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '精算詳細の取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        calculationResult,
        calculate,
        confirmedSettlement,
        confirm,
        settlements,
        settlementsTotal,
        fetchSettlements,
        settlementDetail,
        fetchSettlementDetail,
        clearError,
        clearCalculation,
    };
}; 
