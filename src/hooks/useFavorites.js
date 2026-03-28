import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import { getJSON, setJSON } from '../utils/storage';

// 收藏店家管理
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getJSON(STORAGE_KEYS.FAVORITES, []));
  }, []);

  const addFavorite = useCallback((store) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === store.id)) return prev;
      const updated = [...prev, { ...store, savedAt: Date.now() }];
      setJSON(STORAGE_KEYS.FAVORITES, updated);
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((storeId) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== storeId);
      setJSON(STORAGE_KEYS.FAVORITES, updated);
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (storeId) => favorites.some((f) => f.id === storeId),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
