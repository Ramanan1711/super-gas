'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((c) => c.startsWith('auth_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1]?.trim() : null;

    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return null;
}
