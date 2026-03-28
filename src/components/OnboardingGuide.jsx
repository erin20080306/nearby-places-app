import React from 'react';
import { MapPin, Search, Heart, Navigation } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';
import ContactAdmin from './ContactAdmin';

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
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* 可捲動區域 */}
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">歡迎使用熱愛生活</h1>
          <p className="text-xs text-gray-500 mt-1">
            免費查詢附近美食、加油站、便利商店等店家資訊
          </p>

          {/* 功能介紹 — 緊湊 2x2 網格 */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 w-full max-w-sm">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center bg-gray-50 rounded-xl p-3 gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{step.title}</p>
                  <p className="text-[11px] text-gray-400 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 固定底部 — 按鈕 + 聯絡管理員 */}
      <div className="shrink-0 px-6 pb-8 pt-3 bg-white border-t border-gray-100 space-y-3">
        <button
          onClick={handleDone}
          className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 text-base"
        >
          開始使用
        </button>
        <p className="text-center text-[11px] text-gray-400">
          免費試用 2 天，體驗完整功能
        </p>

        {/* 聯絡管理員 */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">聯絡管理員</p>
          <ContactAdmin />
        </div>
      </div>
    </div>
  );
}
