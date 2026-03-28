import React from 'react';
import StoreList from '../components/StoreList';
import { SkeletonList } from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function NearbyPage({ stores, loading, favorites, onDetail, onMapFocus }) {
  return (
    <div className="py-4">
      <div className="px-4 mb-3">
        <h2 className="text-lg font-bold text-gray-800">附近店家</h2>
        <p className="text-xs text-gray-400 mt-1">依距離排序，由近到遠</p>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : stores.length === 0 ? (
        <EmptyState
          icon="search"
          title="附近沒有找到店家"
          description="請嘗試擴大搜尋範圍或切換分類"
        />
      ) : (
        <StoreList
          stores={stores}
          onDetail={onDetail}
          onFavorite={(store) =>
            favorites.isFavorite(store.id)
              ? favorites.removeFavorite(store.id)
              : favorites.addFavorite(store)
          }
          isFavorite={favorites.isFavorite}
          onMapFocus={onMapFocus}
        />
      )}
    </div>
  );
}
