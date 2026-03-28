import { useState, useCallback, useRef } from 'react';
import { fetchNearbyStores } from '../services/overpassService';

// 管理店家資料狀態
export function useStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const search = useCallback(async (categoryId, lat, lon, radius) => {
    // 避免重複請求
    if (abortRef.current) abortRef.current.abort = true;
    const token = { abort: false };
    abortRef.current = token;

    setLoading(true);
    setError(null);

    try {
      const results = await fetchNearbyStores(categoryId, lat, lon, radius);
      if (!token.abort) {
        setStores(results);
      }
    } catch (err) {
      if (!token.abort) {
        setError(err.message || '搜尋失敗，請稍後再試');
        setStores([]);
      }
    } finally {
      if (!token.abort) setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setStores([]);
    setError(null);
  }, []);

  return { stores, loading, error, search, clear };
}
