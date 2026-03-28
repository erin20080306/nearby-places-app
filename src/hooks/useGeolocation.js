import { useState, useEffect, useCallback } from 'react';

// 錯誤類型常數
export const GEO_ERROR = {
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
  TIMEOUT: 'timeout',
  NOT_SUPPORTED: 'not_supported',
  UNKNOWN: 'unknown',
};

// 取得使用者定位
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [loading, setLoading] = useState(true);

  const locate = useCallback(() => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    if (!navigator.geolocation) {
      setError('您的瀏覽器不支援定位功能');
      setErrorType(GEO_ERROR.NOT_SUPPORTED);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('定位權限未開啟');
            setErrorType(GEO_ERROR.DENIED);
            break;
          case err.POSITION_UNAVAILABLE:
            setError('無法取得您的位置資訊');
            setErrorType(GEO_ERROR.UNAVAILABLE);
            break;
          case err.TIMEOUT:
            setError('定位逾時，請重試');
            setErrorType(GEO_ERROR.TIMEOUT);
            break;
          default:
            setError('定位失敗，請重試');
            setErrorType(GEO_ERROR.UNKNOWN);
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { position, error, errorType, loading, relocate: locate };
}
