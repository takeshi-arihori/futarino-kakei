import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Zustandストアをモック
jest.mock('@/store/authStore', () => ({
    useAuthStore: () => ({
        isAuthenticated: false,
        isLoading: false,
        checkAuth: jest.fn(),
    }),
}));

// Next.js routerをモック
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('HomePage', () => {
    it('ローディングスピナーが表示されること', () => {
        render(<HomePage />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
