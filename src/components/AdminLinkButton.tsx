'use client';

import React, { useSyncExternalStore, useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

const emptySubscribe = () => () => {};

function getClientSnapshot(): boolean {
  if (typeof document === 'undefined') return false;
  const cookies = document.cookie.split('; ');
  const roleCookie = cookies.find((c) => c.startsWith('user_role='));
  if (roleCookie) {
    const role = roleCookie.split('=')[1];
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }
  return false;
}

function getServerSnapshot(): boolean {
  return false;
}

export default function AdminLinkButton() {
  const isCookieAdmin = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const role = data?.data?.user?.role;
        setIsAdmin(role === 'ADMIN' || role === 'SUPER_ADMIN');
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  const showButton = isAdmin !== null ? isAdmin : isCookieAdmin;

  if (!showButton) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="fixed top-3 right-3 z-50 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition cursor-pointer border border-slate-700/60"
    >
      <Shield className="w-3.5 h-3.5 text-red-500" />
      <span>Admin Dashboard</span>
      <span>&rarr;</span>
    </Link>
  );
}
