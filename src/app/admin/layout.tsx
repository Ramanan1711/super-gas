import React, { Suspense } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminAuthGuard />
      <Suspense fallback={null}>{children}</Suspense>
    </>
  );
}
