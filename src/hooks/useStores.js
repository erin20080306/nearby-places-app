import { useState, useCallback, useRef } from 'react';
import { fetchNearbyStores } from '../services/overpassService';

// 管理店家資料狀態（含 debounce 節流）
export function useStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const lastArgsRef = useRef(null);

  const timeoutRef = useRef(null);

  // 內部實際執行搜尋（含 20 秒整體超時）
  const executeSearch = useCallback(async (categoryId, lat, lon, radius) => {
    // 取消前一個進行中的請求
    if (abortRef.current) abortRef.current.abort = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const token = { abort: false };
    abortRef.current = token;

    setLoading(true);
    setError(null);

    // 20 秒整體超時，避免無限等待
    const timeoutPromise = new Promise((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject(new Error('搜尋超時，請點擊重新搜尋或縮小搜尋範圍'));
      }, 20000);
    });

    try {
      const results = await Promise.race([
        fetchNearbyStores(categoryId, lat, lon, radius),
        timeoutPromise,
      ]);
      if (!token.abort) {
        setStores(results);
      }
    } catch (err) {
      if (!token.abort) {
        setError(err.message || '搜尋失敗，請稍後再試');
        setStores([]);
      }
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!token.abort) setLoading(false);
    }
  }, []);

  // 對外 search：300ms debounce，快速切換分類/半徑時只發最後一次
  const search = useCallback((categoryId, lat, lon, radius) => {
    lastArgsRef.current = [categoryId, lat, lon, radius];
    setLoading(true); // 立即顯示 loading

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const args = lastArgsRef.current;
      if (args) executeSearch(...args);
    }, 300);
  }, [executeSearch]);

  // 立即搜尋（不 debounce，用於手動重新搜尋按鈕）
  const searchImmediate = useCallback((categoryId, lat, lon, radius) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    executeSearch(categoryId, lat, lon, radius);
  }, [executeSearch]);

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStores([]);
    setError(null);
  }, []);

  return { stores, loading, error, search, searchImmediate, clear };
}
