import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExpenseList } from '../ExpenseList';
import { Expense } from '@/types/expense';

const mockExpenses: Expense[] = [
    {
        id: '1',
        date: '2023-12-01',
        description: 'ランチ代',
        amount: 1200,
        category: '食費',
        payer: 'user1',
        isSettled: false,
        createdAt: '2023-12-01T10:00:00Z',
        updatedAt: '2023-12-01T10:00:00Z',
    },
    {
        id: '2',
        date: '2023-12-02',
        description: '電車代',
        amount: 300,
        category: '交通費',
        payer: 'user2',
        isSettled: true,
        createdAt: '2023-12-02T09:00:00Z',
        updatedAt: '2023-12-02T09:00:00Z',
    },
];

describe('ExpenseList', () => {
    it('支出リストが正しく表示される', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <ExpenseList
                expenses={mockExpenses}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        // 支出データが表示されることを確認
        expect(screen.getByText('ランチ代')).toBeInTheDocument();
        expect(screen.getByText('￥1,200')).toBeInTheDocument();
        expect(screen.getByText('食費')).toBeInTheDocument();
        expect(screen.getByText('user1')).toBeInTheDocument();

        expect(screen.getByText('電車代')).toBeInTheDocument();
        expect(screen.getByText('￥300')).toBeInTheDocument();
        expect(screen.getByText('交通費')).toBeInTheDocument();
        expect(screen.getByText('user2')).toBeInTheDocument();
    });

    it('精算ステータスが正しく表示される', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <ExpenseList
                expenses={mockExpenses}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        expect(screen.getByText('未精算')).toBeInTheDocument();
        expect(screen.getByText('精算済み')).toBeInTheDocument();
    });

    it('編集ボタンのクリックでonEditが呼ばれる', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <ExpenseList
                expenses={[mockExpenses[0]]}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        const editButton = screen.getByRole('button', { name: '編集' });
        fireEvent.click(editButton);

        expect(onEdit).toHaveBeenCalledWith('1');
    });

    it('削除ボタンのクリックでonDeleteが呼ばれる', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <ExpenseList
                expenses={[mockExpenses[0]]}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        const deleteButton = screen.getByRole('button', { name: '削除' });
        fireEvent.click(deleteButton);

        expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('精算済みの支出では編集・削除ボタンが無効化される', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <ExpenseList
                expenses={[mockExpenses[1]]}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        const editButton = screen.getByRole('button', { name: '編集' });
        const deleteButton = screen.getByRole('button', { name: '削除' });

        expect(editButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });

    it('支出データが空の場合にメッセージが表示される', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <ExpenseList
                expenses={[]}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        expect(screen.getByText('支出データがありません')).toBeInTheDocument();
    });
}); 
