'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { ArrowLeft, Minimize2, Maximize2 } from 'lucide-react';

export default function AdminSidebarPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Top Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 w-full max-w-md">
        <Link
          href="/admin"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Minimized / Maximized Toggle Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              !collapsed
                ? 'bg-[#E81B24] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Maximize View</span>
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              collapsed
                ? 'bg-[#E81B24] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minimize View</span>
          </button>
        </div>
      </div>

      {/* Standalone Sidebar Presentation Box */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-visible transition-all duration-300">
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={setCollapsed}
          className="border-none rounded-2xl min-h-[700px]"
        />
      </div>

      <p className="text-xs text-slate-400 font-medium mt-4 text-center">
        Click the toggle button on the sidebar edge or the buttons above to switch between views.
      </p>
    </div>
  );
}
