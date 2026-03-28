import React from 'react';
import { Check, Crown, Sparkles } from 'lucide-react';
import { MEMBERSHIP_CONFIG } from '../config/membership';

export default function PricingCard({ onPayClick, isPaid }) {
  if (isPaid) {
    return (
      <div className="mx-4 p-6 bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-200 rounded-2xl text-center">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
          <Crown className="w-7 h-7 text-primary-600" />
        </div>
        <h3 className="text-lg font-bold text-primary-800">付費會員已開通</h3>
        <p className="text-sm text-primary-600 mt-1">感謝您的支持，享受完整功能！</p>
      </div>
    );
  }

  return (
    <div className="mx-4 bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
      {/* 標頭 */}
      <div className="bg-gradient-to-r from-primary-600 to-teal-600 px-6 py-5 text-center">
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" /> 推薦方案
        </div>
        <h3 className="text-xl font-bold text-white">月付方案</h3>
        <div className="mt-2 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-extrabold text-white">NT${MEMBERSHIP_CONFIG.monthlyPrice}</span>
          <span className="text-white/70 text-sm">/月</span>
        </div>
        <p className="text-white/80 text-xs mt-2">免費試用 {MEMBERSHIP_CONFIG.trialDays} 天，到期後自動續約</p>
      </div>

      {/* 功能列表 */}
      <div className="px-6 py-5 space-y-3">
        {MEMBERSHIP_CONFIG.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-primary-600" />
            </div>
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={onPayClick}
          className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-teal-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-teal-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98]"
        >
          立即升級
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">使用 PayPal 安全付款</p>
      </div>
    </div>
  );
}
