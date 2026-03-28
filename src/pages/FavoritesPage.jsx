import React, { useState } from 'react';
import StoreCard from '../components/StoreCard';
import StoreDetailModal from '../components/StoreDetailModal';
import EmptyState from '../components/EmptyState';

export default function FavoritesPage({ favorites }) {
  const [detailStore, setDetailStore] = useState(null);

  return (
    <div className="py-4">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800">我的收藏</h2>
        <p className="text-xs text-gray-400 mt-1">
          {favorites.favorites.length > 0
            ? `共 ${favorites.favorites.length} 間收藏店家`
            : '尚無收藏店家'}
        </p>
      </div>

      {favorites.favorites.length === 0 ? (
        <EmptyState
          icon="heart"
          title="尚無收藏"
          description="瀏覽附近店家時，點擊愛心即可加入收藏"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-24">
          {favorites.favorites.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onDetail={setDetailStore}
              onFavorite={(s) => favorites.removeFavorite(s.id)}
              isFavorite={true}
            />
          ))}
        </div>
      )}

      {detailStore && (
        <StoreDetailModal
          store={detailStore}
          onClose={() => setDetailStore(null)}
          onFavorite={(s) => favorites.removeFavorite(s.id)}
          isFavorite={true}
        />
      )}
    </div>
  );
}
