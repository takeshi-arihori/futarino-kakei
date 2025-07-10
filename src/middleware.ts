import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // 追加のミドルウェアロジックがあればここに記述
    console.log('Middleware called for:', req.nextUrl.pathname); // TODO: Remove in production
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // 認証が不要なパス
        const publicPaths = [
          '/',
          '/signin',
          '/signup',
          '/api/auth',
          '/_next',
          '/favicon.ico',
        ];

        // パブリックパスの場合は認証不要
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true;
        }

        // 認証が必要なパスでトークンがない場合は拒否
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
