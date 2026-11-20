'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

function getInitialAdminState(): boolean {
  if (typeof document === 'undefined') return false;
  const cookies = document.cookie.split('; ');
  const roleCookie = cookies.find((c) => c.startsWith('user_role='));
  if (roleCookie) {
    const role = roleCookie.split('=')[1];
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }
  return false;
}

export default function AdminLinkButton() {
  const [isAdmin, setIsAdmin] = useState<boolean>(getInitialAdminState);

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

  if (!isAdmin) {
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
