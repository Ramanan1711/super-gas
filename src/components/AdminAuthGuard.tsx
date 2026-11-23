'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((c) => c.startsWith('auth_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1]?.trim() : null;

    const roleCookie = cookies.find((c) => c.startsWith('user_role='));
    const role = roleCookie ? roleCookie.split('=')[1]?.trim() : null;

    if (!token) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname || '/admin')}`);
      return;
    }

    if (role === 'DELIVERY_PARTNER') {
      router.replace('/?access_denied=admin');
    }
  }, [router, pathname]);

  return null;
}
