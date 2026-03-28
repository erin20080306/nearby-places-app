import { useState, useEffect, useCallback, useRef } from 'react';
import { PAYPAL_CONFIG } from '../config/paypal';

// PayPal SDK script 動態載入 hook
export function usePayPalScript() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // 已載入過
    if (window.paypal?.HostedButtons) {
      setLoaded(true);
      return;
    }

    // 正在載入中
    if (loadingRef.current) return;

    // 檢查是否已有 script tag
    const existing = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
    if (existing) {
      existing.addEventListener('load', () => setLoaded(true));
      existing.addEventListener('error', () => setError('PayPal SDK 載入失敗'));
      return;
    }

    loadingRef.current = true;
    const script = document.createElement('script');
    script.src = PAYPAL_CONFIG.sdkUrl;
    script.async = true;

    script.onload = () => {
      loadingRef.current = false;
      setLoaded(true);
    };

    script.onerror = () => {
      loadingRef.current = false;
      setError('PayPal SDK 載入失敗，請稍後再試');
    };

    document.head.appendChild(script);
  }, []);

  // 渲染 Hosted Button 到指定容器
  const renderButton = useCallback(
    (containerId) => {
      if (!loaded || !window.paypal?.HostedButtons) return false;
      try {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
        window.paypal
          .HostedButtons({ hostedButtonId: PAYPAL_CONFIG.hostedButtonId })
          .render(`#${containerId}`);
        return true;
      } catch (err) {
        setError('PayPal 按鈕渲染失敗');
        return false;
      }
    },
    [loaded]
  );

  return { loaded, error, renderButton };
}
