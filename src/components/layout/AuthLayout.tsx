import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex min-h-screen'>
        {/* Left side - Brand/Image */}
        <div className='hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 lg:py-12 bg-indigo-600'>
          <div className='mx-auto w-full max-w-sm'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-white mb-4'>
                ふたりの家計
              </h1>
              <p className='text-lg text-indigo-100 mb-8'>
                カップル・夫婦専用の家計管理アプリ
              </p>
              <div className='space-y-4 text-indigo-100'>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  支出の記録と管理
                </div>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  自動精算機能
                </div>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  リアルタイム同期
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className='flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
          <div className='mx-auto w-full max-w-sm lg:w-96'>
            {title && (
              <div className='text-center mb-8 lg:hidden'>
                <h2 className='text-3xl font-bold text-gray-900'>{title}</h2>
                {subtitle && (
                  <p className='mt-2 text-sm text-gray-600'>{subtitle}</p>
                )}
              </div>
            )}

            <div className='lg:hidden text-center mb-8'>
              <h1 className='text-2xl font-bold text-indigo-600 mb-2'>
                ふたりの家計
              </h1>
              <p className='text-gray-600'>
                カップル・夫婦専用の家計管理アプリ
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
