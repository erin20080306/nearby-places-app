import { useState, useEffect, useCallback } from 'react';

// 取得使用者定位
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const locate = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('您的瀏覽器不支援定位功能');
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
            setError('請允許定位權限以使用此功能');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('無法取得您的位置資訊');
            break;
          case err.TIMEOUT:
            setError('定位逾時，請重試');
            break;
          default:
            setError('定位失敗，請重試');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { position, error, loading, relocate: locate };
}
