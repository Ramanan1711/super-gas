import React, { Suspense } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthGuard />
      <Suspense fallback={null}>{children}</Suspense>
    </>
  );
}
