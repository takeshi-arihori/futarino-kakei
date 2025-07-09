/** @type {import('next').NextConfig} */
const nextConfig = {
  // 実験的機能
  experimental: {
    // App Router使用
    appDir: true,
  },

  // 画像最適化
  images: {
    domains: [
      'supabase.co', // Supabase Storage
      'lh3.googleusercontent.com', // Google OAuth画像
      'avatars.githubusercontent.com', // GitHub OAuth画像
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // リダイレクト設定
  async redirects() {
    return [
      // ルートドメインからwwwへリダイレクト
      {
        source: '/',
        has: [{ type: 'host', value: 'futarino-kakei.com' }],
        destination: 'https://www.futarino-kakei.com',
        permanent: true,
      },
      // 旧パスのリダイレクト（将来の機能追加時用）
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
    ];
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // PWA設定（将来的に追加予定）
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

module.exports = nextConfig;
