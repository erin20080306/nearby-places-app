import React, { useState } from 'react';
import StoreCard from './StoreCard';
import EmptyState from './EmptyState';
import { FILTER_OPTIONS } from '../data/categories';

export default function StoreList({ stores, onDetail, onFavorite, isFavorite, onMapFocus }) {
  const [filter, setFilter] = useState('all');

  const filtered = stores.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'nearest') return true; // 已按距離排序
    return s.category === filter;
  });

  const sorted = filter === 'nearest' ? [...filtered].sort((a, b) => a.distance - b.distance) : filtered;

  return (
    <div className="pb-24">
      {/* 篩選標籤 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0
              ${filter === opt.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-500 shadow-sm hover:bg-primary-50'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 結果數量 */}
      <div className="px-4 pb-2">
        <p className="text-xs text-gray-400">找到 {sorted.length} 間店家</p>
      </div>

      {/* 卡片列表 */}
      {sorted.length === 0 ? (
        <EmptyState
          icon="search"
          title="沒有找到店家"
          description="請嘗試擴大搜尋範圍或切換分類"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {sorted.map((store) => (
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
