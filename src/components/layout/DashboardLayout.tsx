'use client';

import { ReactNode, useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import MobileLayout from './MobileLayout';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Desktop Layout */}
      <div className='hidden lg:flex lg:h-screen lg:overflow-hidden'>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* Header */}
          <header className='border-b border-gray-200 bg-white'>
            <div className='flex h-16 items-center justify-between px-6'>
              <div className='flex items-center'>
                <h1 className='text-xl font-semibold text-gray-900'>
                  ふたりの家計
                </h1>
              </div>

              <div className='flex items-center space-x-4'>
                {/* User Menu */}
                <div className='flex items-center space-x-3'>
                  <div className='h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center'>
                    <span className='text-sm font-medium text-white'>
                      {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className='text-sm text-gray-700'>
                    {session?.user?.name}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className='flex-1 overflow-y-auto bg-gray-50'>
            <div className='p-6'>{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className='lg:hidden'>
        <MobileLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          {children}
        </MobileLayout>
      </div>
    </>
  );
}
