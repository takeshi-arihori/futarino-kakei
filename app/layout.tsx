import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a855f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'ふたりの家計 | カップル・夫婦専用家計管理アプリ',
    template: '%s | ふたりの家計',
  },
  description:
    'カップル・夫婦が共同で家計管理を行うためのWebアプリケーション。支出の記録から精算まで、二人の家計をスマートに管理。リアルタイム同期で常に最新の情報を共有できます。',
  keywords: [
    '家計管理',
    '家計簿',
    'カップル',
    '夫婦',
    '支出管理',
    '精算',
    '共同管理',
    'リアルタイム同期',
    '家計アプリ',
    '二人暮らし',
  ],
  authors: [{ name: 'futarino-kakei' }],
  creator: 'futarino-kakei',
  publisher: 'futarino-kakei',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://www.futarino-kakei.com'
      : 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.futarino-kakei.com',
    title: 'ふたりの家計 | カップル・夫婦専用家計管理アプリ',
    description:
      'カップル・夫婦が共同で家計管理を行うためのWebアプリケーション。支出の記録から精算まで、二人の家計をスマートに管理。',
    siteName: 'ふたりの家計',
    images: [
      {
        url: '/og/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ふたりの家計 - カップル・夫婦専用家計管理アプリ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ふたりの家計 | カップル・夫婦専用家計管理アプリ',
    description:
      'カップル・夫婦が共同で家計管理を行うためのWebアプリケーション。支出の記録から精算まで、二人の家計をスマートに管理。',
    creator: '@futarino_kakei',
    images: ['/og/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'finance',
  classification: 'Finance, Productivity',
  referrer: 'origin-when-cross-origin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
        {/* Google Analytics等のスクリプトは後で追加 */}
      </body>
    </html>
  )
}