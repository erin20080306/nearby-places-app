import React from 'react';
import { Clock, Crown } from 'lucide-react';

export default function TrialBanner({ trialRemaining, isExpired, onUpgrade }) {
  if (!trialRemaining && !isExpired) return null;

  if (isExpired) {
    return (
      <div className="mx-4 my-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <Crown className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-700">試用已結束</p>
          <p className="text-xs text-amber-600 mt-0.5">立即升級月付方案，解鎖完整功能</p>
        </div>
        <button
          onClick={onUpgrade}
          className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors shrink-0"
        >
          升級
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 my-2 bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <Clock className="w-5 h-5 text-primary-500 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-primary-700">免費試用中</p>
        <p className="text-xs text-primary-600 mt-0.5">{trialRemaining}</p>
      </div>
    </div>
  );
}
