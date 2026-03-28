import React from 'react';
import StoreCard from './StoreCard';
import EmptyState from './EmptyState';

export default function StoreList({ stores, onDetail, onFavorite, isFavorite, onMapFocus }) {
  return (
    <div className="pb-24">
      {/* 結果數量 */}
      <div className="px-4 py-2">
        <p className="text-xs text-gray-400">找到 {stores.length} 間店家</p>
      </div>

      {/* 卡片列表 */}
      {stores.length === 0 ? (
        <EmptyState
          icon="search"
          title="沒有找到店家"
          description="請嘗試擴大搜尋範圍或切換分類"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onDetail={onDetail}
              onFavorite={onFavorite}
              isFavorite={isFavorite?.(store.id)}
              onMapFocus={onMapFocus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
