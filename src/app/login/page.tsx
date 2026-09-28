import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F6FC] flex items-center justify-center p-8">
        <div className="p-8 bg-white border border-[#D0DFEE] rounded-[16px] text-center font-mono text-xs text-slate-500 shadow-sm animate-pulse">
          Loading Railway Officer Authentication Portal...
        </div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
