import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ふたりの家計 - カップル・夫婦専用家計管理アプリ',
    short_name: 'ふたりの家計',
    description: 'カップル・夫婦が共同で家計管理を行うためのWebアプリケーション',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#a855f7',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'productivity', 'lifestyle'],
    shortcuts: [
      {
        name: '支出を追加',
        short_name: '支出追加',
        description: '新しい支出を記録する',
        url: '/dashboard/expenses/new',
        icons: [
          {
            src: '/icons/add-expense.png',
            sizes: '96x96',
          },
        ],
      },
      {
        name: '精算',
        short_name: '精算',
        description: '支出の精算を行う',
        url: '/dashboard/settlements',
        icons: [
          {
            src: '/icons/settlement.png',
            sizes: '96x96',
          },
        ],
      },
    ],
  }
}