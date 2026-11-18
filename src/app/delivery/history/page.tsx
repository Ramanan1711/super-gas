'use client';

import React from 'react';
import DeliveryHistoryScreen from '@/components/DeliveryHistoryScreen';
import { Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeliveryHistoryRoute() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-6 sm:px-4">
      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[94vh] bg-white sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border border-slate-200/80">
        {/* Device Status Bar */}
        <div className="shrink-0 px-6 pt-3 pb-1 flex items-center justify-between text-xs font-bold text-slate-800 bg-white select-none">
          <span>9:30</span>
          {/* Camera Punch-Hole Notch */}
          <div className="w-4 h-4 rounded-full bg-black -ml-4" />
          {/* System Status Icons */}
          <div className="flex items-center gap-1.5 text-slate-800">
            <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-1.5 bg-slate-800 rounded-2xs" />
              <span className="w-0.5 h-2 bg-slate-800 rounded-2xs" />
              <span className="w-0.5 h-2.5 bg-slate-800 rounded-2xs" />
              <span className="w-0.5 h-3 bg-slate-800 rounded-2xs" />
            </div>
            <div className="w-5 h-2.5 border-1.5 border-slate-800 rounded-2xs p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-800 rounded-3xs" />
            </div>
          </div>
        </div>

        <DeliveryHistoryScreen onBack={() => router.push('/delivery/more')} />
      </div>
    </div>
  );
}
