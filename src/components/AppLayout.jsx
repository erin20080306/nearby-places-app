import React from 'react';
import { MapPin } from 'lucide-react';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream max-w-lg mx-auto relative">
      {/* App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-600 flex items-center justify-center shadow-sm">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800 leading-tight">熱愛生活</h1>
          <p className="text-[10px] text-gray-400">美食 · 加油站 · 店家</p>
        </div>
      </header>
      {/* 主內容 */}
      <main className="pb-20">{children}</main>
    </div>
  );
}
