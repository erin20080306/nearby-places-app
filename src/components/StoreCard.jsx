import React from 'react';
import {
  UtensilsCrossed, Fuel, Coffee, Store, ShoppingBag, ParkingSquare,
  Navigation, Info, Heart,
} from 'lucide-react';
import { getCategoryById } from '../data/categories';
import { formatDistance } from '../utils/distance';
import { getNavigationUrl } from '../utils/platform';

const ICON_MAP = {
  UtensilsCrossed, Fuel, Coffee, Store, ShoppingBag, ParkingSquare,
};

export default function StoreCard({ store, onDetail, onFavorite, isFavorite, onMapFocus }) {
  const cat = getCategoryById(store.category);
  const Icon = ICON_MAP[cat.icon] || Store;

  return (
    <div
      className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 cursor-pointer"
      onClick={() => onMapFocus?.(store)}
    >
      {/* 替代封面 */}
      <div className={`h-28 bg-gradient-to-br ${cat.gradient} flex items-center justify-center relative`}>
        <Icon className="w-12 h-12 text-white/80" strokeWidth={1.5} />
        {/* 收藏按鈕 */}
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite?.(store); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-red-400 text-red-400' : 'text-white'}`}
          />
        </button>
        {/* 距離標籤 */}
        <span className="absolute bottom-2 right-3 bg-black/30 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full">
          {formatDistance(store.distance)}
        </span>
      </div>

      {/* 卡片內容 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-base truncate">{store.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${cat.lightBg} ${cat.iconColor} font-medium`}>
            {cat.label}
          </span>
          {store.brand && (
            <span className="text-xs text-gray-400">{store.brand}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 truncate">
          {store.address || '無詳細地址'}
        </p>

        {/* 按鈕列 */}
        <div className="flex gap-2 mt-3">
          <a
            href={getNavigationUrl(store.lat, store.lon, store.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 text-white text-xs font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" /> 導航
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); onDetail?.(store); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Info className="w-3.5 h-3.5" /> 詳情
          </button>
        </div>
      </div>
    </div>
  );
}
