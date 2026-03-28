import React, { useState } from 'react';
import { Mail, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { STORAGE_KEYS, PLAN_TYPES, PAYMENT_STATUS } from '../config/constants';
import { setJSON, getDeviceId } from '../utils/storage';

const UNLOCK_CODE = 'qwe811122';

// 簡易 email 格式驗證
function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export default function ContactAdmin() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sent | unlocked
  const [showMessage, setShowMessage] = useState(false);

  const handleSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    // 秘密解鎖碼
    if (trimmed === UNLOCK_CODE) {
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
      return;
    }

    // 驗證 email 格式
    if (!isValidEmail(trimmed)) {
      setEmailError('請輸入正確的 Email 格式');
      return;
    }

    // 用 mailto 開啟郵件 app 寄信（不會跳轉外部網站）
    const subject = encodeURIComponent('熱愛生活 APP - 使用者聯絡');
    const body = encodeURIComponent(
      `使用者 Email: ${trimmed}\n\n留言: ${message.trim() || '（未填寫）'}\n\n---\n送出時間: ${new Date().toLocaleString('zh-TW')}`
    );
    window.open(`mailto:erin20080306@gmail.com?subject=${subject}&body=${body}`, '_self');
    setStatus('sent');
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
        <p className="text-xs text-gray-500">管理員會與您聯絡</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Email 輸入 */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center bg-white rounded-xl border border-gray-200 px-3">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && !showMessage && handleSubmit()}
            placeholder="請輸入您的 Email"
            className="flex-1 px-2 py-2.5 text-sm bg-transparent outline-none"
          />
        </div>
        {!showMessage && (
          <button
            onClick={handleSubmit}
            disabled={!email.trim() || status === 'sending'}
            className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1"
          >
            {status === 'sending' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            送出
          </button>
        )}
      </div>

      {/* Email 格式錯誤提示 */}
      {emailError && (
        <p className="text-xs text-red-500 pl-1">{emailError}</p>
      )}

      {/* 留言展開/收合 */}
      {!showMessage ? (
        <button
          onClick={() => setShowMessage(true)}
          className="text-xs text-gray-400 hover:text-primary-500 transition-colors pl-1"
        >
          + 附上留言
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start bg-white rounded-xl border border-gray-200 px-3 py-2">
            <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="請輸入您的留言（選填）"
              rows={2}
              className="flex-1 px-2 text-sm bg-transparent outline-none resize-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!email.trim() || status === 'sending'}
            className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
          >
            {status === 'sending' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            送出
          </button>
        </div>
      )}
    </div>
  );
}
