import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ExpenseListScreen } from '../ExpenseListScreen';

// SWRのモック
vi.mock('swr', () => ({
    default: vi.fn(),
    mutate: vi.fn(),
}));

// useExpensesフックのモック
vi.mock('@/hooks/useExpenses', () => ({
    useExpenses: vi.fn(),
}));

import useSWR from 'swr';
import { useExpenses } from '@/hooks/useExpenses';

const mockUseExpenses = useExpenses as ReturnType<typeof vi.fn>;

describe('ExpenseListScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ローディング状態が正しく表示される', () => {
        mockUseExpenses.mockReturnValue({
            expenses: [],
            total: 0,
            isLoading: true,
            error: null,
            deleteExpense: vi.fn(),
            refresh: vi.fn(),
        });

        render(<ExpenseListScreen />);

        expect(screen.getByText('支出一覧')).toBeInTheDocument();
        // ローディングスピナーが表示されることを確認
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('エラー状態が正しく表示される', () => {
        const mockError = new Error('API Error');
        mockUseExpenses.mockReturnValue({
            expenses: [],
            total: 0,
            isLoading: false,
            error: mockError,
            deleteExpense: vi.fn(),
            refresh: vi.fn(),
        });

        render(<ExpenseListScreen />);

        expect(screen.getByText('データの取得に失敗しました: API Error')).toBeInTheDocument();
        expect(screen.getByText('再読み込み')).toBeInTheDocument();
    });

    it('支出一覧が正しく表示される', () => {
        const mockExpenses = [
            {
                id: '1',
                description: 'テスト支出',
                amount: 1000,
                category: '食費',
                payer: 'user1',
                date: '2023-12-01',
                isSettled: false,
                createdAt: '2023-12-01T00:00:00Z',
                updatedAt: '2023-12-01T00:00:00Z',
            },
        ];

        mockUseExpenses.mockReturnValue({
            expenses: mockExpenses,
            total: 1,
            isLoading: false,
            error: null,
            deleteExpense: vi.fn(),
            refresh: vi.fn(),
        });

        render(<ExpenseListScreen />);

        expect(screen.getByText('支出一覧')).toBeInTheDocument();
        expect(screen.getByText('合計: 1件')).toBeInTheDocument();
    });

    it('支出データがない場合の表示が正しい', () => {
        mockUseExpenses.mockReturnValue({
            expenses: [],
            total: 0,
            isLoading: false,
            error: null,
            deleteExpense: vi.fn(),
            refresh: vi.fn(),
        });

        render(<ExpenseListScreen />);

        expect(screen.getByText('支出一覧')).toBeInTheDocument();
        expect(screen.getByText('合計: 0件')).toBeInTheDocument();
    });
}); 
