import React from 'react';
import { Map, Compass, Heart, Crown } from 'lucide-react';

const TABS = [
  { id: 'map', label: '地圖', icon: Map },
  { id: 'nearby', label: '附近', icon: Compass },
  { id: 'favorites', label: '收藏', icon: Heart },
  { id: 'upgrade', label: '方案', icon: Crown },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
