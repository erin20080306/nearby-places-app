import React, { useEffect, useRef, useCallback, useState } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryChips from '../components/CategoryChips';
import RadiusSelector from '../components/RadiusSelector';
import MapView from '../components/MapView';
import StoreList from '../components/StoreList';
import StoreDetailModal from '../components/StoreDetailModal';
import TrialBanner from '../components/TrialBanner';
import ErrorBanner from '../components/ErrorBanner';
import { SkeletonList } from '../components/LoadingState';
import { DEFAULT_RADIUS } from '../data/radiusOptions';
import { searchLocation } from '../services/nominatimService';
import { Crosshair, RefreshCw } from 'lucide-react';

export default function HomePage({
  position,
  geoError,
  geoLoading,
  relocate,
  stores,
  storesLoading,
  storesError,
  searchStores,
  favorites,
  membership,
}) {
  const [category, setCategory] = useState('food');
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [mapCenter, setMapCenter] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [detailStore, setDetailStore] = useState(null);
  const flyToRef = useRef(null);

  // 定位成功後搜尋附近店家
  useEffect(() => {
    if (position) {
      setMapCenter(position);
      searchStores(category, position.lat, position.lon, radius);
    }
  }, [position]); // eslint-disable-line react-hooks/exhaustive-deps

  // 分類或半徑變更時重新搜尋
  useEffect(() => {
    if (mapCenter) {
      searchStores(category, mapCenter.lat, mapCenter.lon, radius);
    }
  }, [category, radius]); // eslint-disable-line react-hooks/exhaustive-deps

  // 搜尋地點
  const handleSearch = useCallback(async (query) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const results = await searchLocation(query);
      if (results.length > 0) {
        const loc = { lat: results[0].lat, lon: results[0].lon };
        setMapCenter(loc);
        flyToRef.current?.(loc.lat, loc.lon, 15);
        searchStores(category, loc.lat, loc.lon, radius);
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  }, [category, radius, searchStores]);

  // 重新定位
  const handleRelocate = () => {
    relocate();
  };

  // 重新搜尋目前位置
  const handleRefresh = () => {
    if (mapCenter) {
      searchStores(category, mapCenter.lat, mapCenter.lon, radius);
    }
  };

  // 點擊卡片聚焦地圖
  const handleMapFocus = (store) => {
    flyToRef.current?.(store.lat, store.lon, 17);
  };

  return (
    <div className="space-y-2">
      {/* 試用狀態 */}
      <TrialBanner
        trialRemaining={membership.trialRemaining}
        isExpired={membership.isExpired}
        onUpgrade={() => membership.onUpgrade?.()}
      />

      {/* 搜尋列 */}
      <SearchBar onSearch={handleSearch} loading={searchLoading} />

      {/* 錯誤提示 */}
      <ErrorBanner message={geoError || searchError || storesError} onDismiss={() => setSearchError(null)} />

      {/* 分類按鈕 */}
      <CategoryChips selected={category} onSelect={setCategory} />

      {/* 半徑選擇 + 操作按鈕 */}
      <div className="flex items-center justify-between px-4">
        <RadiusSelector selected={radius} onSelect={setRadius} />
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            onClick={handleRelocate}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-primary-50 transition-colors"
            title="重新定位"
          >
            <Crosshair className="w-4 h-4 text-primary-600" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-primary-50 transition-colors"
            title="重新搜尋"
          >
            <RefreshCw className="w-4 h-4 text-primary-600" />
          </button>
        </div>
      </div>

      {/* 地圖 */}
      {mapCenter && (
        <MapView
          center={mapCenter}
          stores={stores}
          userPosition={position}
          flyToRef={flyToRef}
          onStoreClick={(store) => setDetailStore(store)}
          selectedStoreId={detailStore?.id}
        />
      )}

      {/* 定位中 / 載入中 */}
      {(geoLoading || !mapCenter) && !geoError && (
        <div className="flex flex-col items-center py-12">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">正在取得您的位置...</p>
        </div>
      )}

      {/* 店家列表 */}
      {storesLoading ? (
        <SkeletonList count={3} />
      ) : (
        <StoreList
          stores={stores}
          onDetail={setDetailStore}
          onFavorite={(store) =>
            favorites.isFavorite(store.id)
              ? favorites.removeFavorite(store.id)
              : favorites.addFavorite(store)
          }
          isFavorite={favorites.isFavorite}
          onMapFocus={handleMapFocus}
        />
      )}

      {/* 詳情彈窗 */}
      {detailStore && (
        <StoreDetailModal
          store={detailStore}
          onClose={() => setDetailStore(null)}
          onFavorite={(store) =>
            favorites.isFavorite(store.id)
              ? favorites.removeFavorite(store.id)
              : favorites.addFavorite(store)
          }
          isFavorite={favorites.isFavorite(detailStore.id)}
        />
      )}
    </div>
  );
}
