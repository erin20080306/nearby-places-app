import React, { useState } from 'react';
import MembershipStatusCard from '../components/MembershipStatusCard';
import PricingCard from '../components/PricingCard';
import PayPalSection from '../components/PayPalSection';
import PaymentPendingState from '../components/PaymentPendingState';
import PaymentSuccessState from '../components/PaymentSuccessState';
import { Mail, Loader2 } from 'lucide-react';
import { verifyPayment } from '../services/membershipService';

export default function UpgradePage({ membership }) {
  const {
    membership: memberData,
    trialRemaining,
    isPaid,
    startPolling,
    fetchStatus,
  } = membership;

  const [showPayPal, setShowPayPal] = useState(false);
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleManualVerify = async () => {
    if (!email.trim()) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      await verifyPayment(email.trim());
      await fetchStatus();
      setPaymentSuccess(true);
    } catch (err) {
      setVerifyError(err.message || '驗證失敗');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetryCheck = async () => {
    const data = await fetchStatus();
    if (data?.planType === 'paid') setPaymentSuccess(true);
  };

  if (paymentSuccess || isPaid) {
    return (
      <div className="py-6">
        <MembershipStatusCard membership={memberData} trialRemaining={trialRemaining} />
        <div className="mt-6">
          <PaymentSuccessState onContinue={() => setPaymentSuccess(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4 pb-24">
      {/* 會員狀態 */}
      <MembershipStatusCard membership={memberData} trialRemaining={trialRemaining} />

      {!showPayPal ? (
        /* 方案卡片 */
        <PricingCard onPayClick={() => setShowPayPal(true)} isPaid={isPaid} />
      ) : (
        /* PayPal 付款區 */
        <div className="mx-4 bg-white rounded-2xl shadow-card p-6 space-y-4 border border-gray-100">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800">使用 PayPal 付款</h3>
            <p className="text-sm text-gray-500 mt-1">安全快速完成付款</p>
          </div>

          <PayPalSection onPaymentInitiated={() => startPolling()} />

          {/* 手動驗證 */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 font-medium mb-3">付款完成？輸入 PayPal Email 驗證</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-gray-50 rounded-xl border border-gray-200 px-3">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="PayPal Email"
                  className="flex-1 px-2 py-2.5 text-sm bg-transparent outline-none"
                />
              </div>
              <button
                onClick={handleManualVerify}
                disabled={verifying || !email.trim()}
                className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors shrink-0"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : '驗證'}
              </button>
            </div>
            {verifyError && <p className="text-xs text-red-500 mt-2">{verifyError}</p>}
          </div>

          {/* 檢查付款狀態 */}
          <button
            onClick={handleRetryCheck}
            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
          >
            檢查付款狀態
          </button>
        </div>
      )}
    </div>
  );
}
