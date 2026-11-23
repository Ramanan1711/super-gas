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

    const roleCookie = cookies.find((c) => c.startsWith('user_role='));
    const role = roleCookie ? roleCookie.split('=')[1]?.trim() : null;

    if (!token) {
      router.replace('/login');
      return;
    }

    // If an Admin somehow lands on the root '/', route them to the Admin Dashboard flow
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      router.replace('/admin');
      return;
    }

    // Verify session validity with backend
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.replace('/login');
        }
      })
      .catch(() => {});
  }, [router]);

  return null;
}
