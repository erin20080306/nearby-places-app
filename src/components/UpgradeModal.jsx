import React, { useState, useEffect } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import PricingCard from './PricingCard';
import PayPalSection from './PayPalSection';
import PaymentPendingState from './PaymentPendingState';
import PaymentSuccessState from './PaymentSuccessState';
import { verifyPayment } from '../services/membershipService';

// 升級遮罩 / 彈窗
export default function UpgradeModal({ onClose, isPaid, polling, startPolling, fetchStatus }) {
  const [step, setStep] = useState(isPaid ? 'success' : 'pricing'); // pricing | paypal | verify | pending | success
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  const handlePayClick = () => setStep('paypal');

  const handlePaymentInitiated = () => {
    startPolling?.();
  };

  const handleManualVerify = async () => {
    if (!email.trim()) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      await verifyPayment(email.trim());
      await fetchStatus?.();
      setStep('success');
    } catch (err) {
      setVerifyError(err.message || '驗證失敗，請確認付款是否完成');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetryCheck = async () => {
    try {
      const data = await fetchStatus?.();
      if (data?.planType === 'paid') {
        setStep('success');
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (isPaid && step !== 'success') setStep('success');
  }, [isPaid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === 'success' ? onClose : undefined} />
      <div className="relative w-full max-w-md mx-4 bg-cream rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="py-6">
          {step === 'pricing' && (
            <div className="space-y-4">
              <div className="text-center px-6 pt-2 pb-4">
                <h2 className="text-xl font-bold text-gray-800">升級方案</h2>
                <p className="text-sm text-gray-500 mt-1">解鎖完整附近探索功能</p>
              </div>
              <PricingCard onPayClick={handlePayClick} isPaid={false} />
            </div>
          )}

          {step === 'paypal' && (
            <div className="space-y-4 px-6">
              <div className="text-center pt-2 pb-4">
                <h2 className="text-xl font-bold text-gray-800">使用 PayPal 付款</h2>
                <p className="text-sm text-gray-500 mt-1">安全快速完成付款</p>
              </div>
              <PayPalSection onPaymentInitiated={handlePaymentInitiated} />

              {/* 付款完成後驗證區 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-3">付款完成了？輸入 PayPal Email 驗證</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-white rounded-xl border border-gray-200 px-3">
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
                {verifyError && (
                  <p className="text-xs text-red-500 mt-2">{verifyError}</p>
                )}
                <button
                  onClick={() => setStep('pending')}
                  className="w-full mt-3 text-xs text-gray-400 hover:text-primary-600 underline"
                >
                  我已付款但還未收到確認
                </button>
              </div>
            </div>
          )}

          {step === 'pending' && (
            <PaymentPendingState onRetry={handleRetryCheck} />
          )}

          {step === 'success' && (
            <PaymentSuccessState onContinue={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
