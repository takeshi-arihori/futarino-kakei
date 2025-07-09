import { ReactNode } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';

export default function AuthLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
