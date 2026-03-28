import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { usePayPalScript } from '../hooks/usePayPalScript';
import { PAYPAL_CONFIG } from '../config/paypal';

export default function PayPalSection({ onPaymentInitiated }) {
  const { loaded, error, renderButton } = usePayPalScript();
  const containerRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (loaded && !rendered && containerRef.current) {
      const success = renderButton(PAYPAL_CONFIG.containerId);
      if (success) {
        setRendered(true);
        onPaymentInitiated?.();
      } else {
        setRenderError(true);
      }
    }
  }, [loaded, rendered, renderButton, onPaymentInitiated]);

  // 載入中
  if (!loaded && !error) {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-sm text-gray-500 mt-3">正在載入付款元件...</p>
      </div>
    );
  }

  // 載入失敗：顯示備用連結
  if (error || renderError) {
    return (
      <div className="space-y-4 px-2">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700">付款按鈕暫時無法載入</p>
            <p className="text-xs text-amber-600 mt-1">請稍後重試，或使用備用付款連結</p>
          </div>
        </div>
        <a
          href={PAYPAL_CONFIG.fallbackPaymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#0070ba] text-white font-medium rounded-xl hover:bg-[#005ea6] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          使用 PayPal 付款（備用連結）
        </a>
      </div>
    );
  }

  // 正常渲染 Hosted Button
  return (
    <div className="px-2">
      <div
        id={PAYPAL_CONFIG.containerId}
        ref={containerRef}
        className="min-h-[50px] flex items-center justify-center"
      />
      {/* 備用連結（總是可用） */}
      <div className="mt-4 text-center">
        <a
          href={PAYPAL_CONFIG.fallbackPaymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-primary-600 underline inline-flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          使用備用付款連結
        </a>
      </div>
    </div>
  );
}
