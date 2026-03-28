import React, { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { STORAGE_KEYS, PLAN_TYPES, PAYMENT_STATUS } from '../config/constants';
import { setJSON, getDeviceId } from '../utils/storage';

const UNLOCK_CODE = 'qwe811122';

export default function ContactAdmin() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sent | unlocked

  const handleSubmit = () => {
    if (!value.trim()) return;
    if (value.trim() === UNLOCK_CODE) {
      // 秘密解鎖碼 → 永久免費
      const unlocked = {
        userId: getDeviceId(),
        planType: PLAN_TYPES.PAID,
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        trialStartAt: null,
        trialEndAt: null,
        activatedAt: new Date().toISOString(),
        expiresAt: null,
        adminUnlock: true,
      };
      setJSON(STORAGE_KEYS.MEMBERSHIP_STATUS, unlocked);
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
      setStatus('unlocked');
      setTimeout(() => window.location.reload(), 1200);
    } else {
      // 一般 email → 顯示感謝訊息
      setStatus('sent');
    }
  };

  if (status === 'unlocked') {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-green-600 text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        開通成功！正在重新載入...
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-3 space-y-1">
        <p className="text-sm font-medium text-primary-600">感謝您！</p>
        <p className="text-xs text-gray-500">我們會盡快與您聯絡</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center bg-white rounded-xl border border-gray-200 px-3">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="請輸入您的 Email"
            className="flex-1 px-2 py-2.5 text-sm bg-transparent outline-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          送出
        </button>
      </div>
    </div>
  );
}
