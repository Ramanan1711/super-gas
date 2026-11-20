'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ role: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = phoneOrEmail.trim();
    if (!cleanInput) {
      setErrorMessage('Please enter your Phone number, Email, or Partner Code (e.g. DP-006)');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: cleanInput, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || 'Invalid credentials.');
      }

      const role = data.data?.user?.role;
      const name = data.data?.user?.name || 'User';

      setSuccessInfo({ role, name });

      // Short delay for smooth UI feedback then redirect based on role
      setTimeout(() => {
        if (role === 'DELIVERY_PARTNER') {
          // Delivery Partner flow goes to Delivery Terminal (/)
          router.push('/');
        } else {
          // Admin & Super Admin flow goes to Admin Dashboard (/admin)
          router.push('/admin');
        }
        router.refresh();
      }, 700);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (type: 'ADMIN' | 'DRIVER') => {
    setErrorMessage(null);
    if (type === 'ADMIN') {
      setPhoneOrEmail('9080995108');
      setPassword('supergas123');
    } else {
      setPhoneOrEmail('DP-006');
      setPassword('supergas123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[440px] z-10 flex flex-col space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#BC0118] to-red-500 text-white shadow-xl shadow-red-900/30 border border-red-400/20 mb-1">
            <Flame className="w-8 h-8 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Super Gas <span className="text-[#BC0118]">Portal</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Single Sign-On for Operations & Fleet Delivery
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-3.5 flex items-start gap-3 text-red-200 text-xs animate-in fade-in zoom-in-95 duration-200">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {successInfo && (
            <div className="bg-emerald-950/70 border border-emerald-700/80 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-200 text-xs animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 leading-snug">
                Welcome <span className="font-bold">{successInfo.name}</span>! Redirecting to{' '}
                <span className="font-bold underline">
                  {successInfo.role === 'DELIVERY_PARTNER' ? 'Delivery Terminal' : 'Admin Dashboard'}
                </span>
                ...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Identifier */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                User ID / Phone / Email / Partner Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 stroke-[2]" />
                </div>
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="e.g. 9080995108, DP-006, or email"
                  autoComplete="username"
                  disabled={loading || Boolean(successInfo)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white rounded-xl pl-10 pr-3.5 py-3 text-sm placeholder:text-slate-500 outline-none transition font-medium"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Default: supergas123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 stroke-[2]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={loading || Boolean(successInfo)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white rounded-xl pl-10 pr-10 py-3 text-sm placeholder:text-slate-500 outline-none transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || Boolean(successInfo)}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#BC0118] to-red-600 hover:from-red-700 hover:to-red-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fillers for Testing */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 mb-2.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Login (Click to Fill)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => setDemoAccount('ADMIN')}
                className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-red-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  <span>Admin Flow</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  ID: 9080995108
                </p>
                <p className="text-[10px] text-emerald-400 font-medium">
                  &rarr; Admin Dashboard
                </p>
              </button>

              {/* Delivery Partner Button */}
              <button
                type="button"
                onClick={() => setDemoAccount('DRIVER')}
                className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-blue-400">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Delivery Partner</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  ID: DP-006 (Varun)
                </p>
                <p className="text-[10px] text-blue-400 font-medium">
                  &rarr; Delivery Terminal
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-[11px] text-slate-500 font-medium">
          Protected by Super Gas RBAC Authorization.
          <br />
          Delivery partner accounts are restricted from accessing administrative records.
        </div>
      </div>
    </div>
  );
}
