import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Lock } from 'lucide-react';
import { STORAGE_KEYS, PLAN_TYPES, PAYMENT_STATUS } from '../config/constants';
import { setJSON } from '../utils/storage';
import { getDeviceId } from '../utils/storage';

const ADMIN_PASSWORD = '661012';

export default function AdminUnlockPage() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error

  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      // 寫入永久付費狀態
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
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* 頭部 */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold">管理後台</h1>
          <p className="text-white/60 text-sm mt-1">請輸入管理密碼</p>
        </div>

        <div className="px-6 py-8">
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">解鎖成功！</h2>
              <p className="text-sm text-gray-500">已永久啟用完整功能</p>
              <a
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                返回首頁
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus('idle'); }}
                  onKeyDown={handleKeyDown}
                  placeholder="請輸入管理密碼"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  autoFocus
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <XCircle className="w-4 h-4" />
                  密碼錯誤，請重試
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={!password.trim()}
                className="w-full py-3.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 disabled:opacity-40 transition-colors"
              >
                驗證並解鎖
              </button>

              <a
                href="/"
                className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                返回首頁
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
