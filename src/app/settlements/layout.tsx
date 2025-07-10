import { ReactNode } from 'react';

export default function SettlementsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className='min-h-screen bg-gray-50 p-4'>{children}</div>;
}
