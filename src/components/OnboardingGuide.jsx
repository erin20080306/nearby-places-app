import React from 'react';
import { MapPin, Search, Heart, Navigation } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';

const STEPS = [
  { icon: MapPin, title: '即時定位', desc: '自動取得您的位置，顯示附近店家' },
  { icon: Search, title: '分類搜尋', desc: '美食、加油站、咖啡廳一鍵查詢' },
  { icon: Navigation, title: '導航功能', desc: '一鍵開啟地圖導航到目的地' },
  { icon: Heart, title: '收藏管理', desc: '收藏喜愛的店家，隨時查看' },
];

export default function OnboardingGuide({ onComplete }) {
  const handleDone = () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-teal-600 flex items-center justify-center mb-8 shadow-lg">
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">歡迎使用附近探索</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          免費查詢附近美食、加油站、便利商店等店家資訊
        </p>

        {/* 功能介紹 */}
        <div className="mt-10 space-y-4 w-full max-w-sm">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="px-8 pb-12 pt-4">
        <button
          onClick={handleDone}
          className="w-full py-4 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 text-lg"
        >
          開始使用
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          免費試用 2 天，體驗完整功能
        </p>
      </div>
    </div>
  );
}
