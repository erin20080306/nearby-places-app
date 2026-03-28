import React from 'react';
import {
  X, Navigation, MapPin, Clock, Phone, Globe, Tag,
  UtensilsCrossed, Fuel, Coffee, Store, ShoppingBag, ParkingSquare, Heart,
} from 'lucide-react';
import { getCategoryById } from '../data/categories';
import { formatDistance } from '../utils/distance';
import { getNavigationUrl } from '../utils/platform';

const ICON_MAP = { UtensilsCrossed, Fuel, Coffee, Store, ShoppingBag, ParkingSquare };

export default function StoreDetailModal({ store, onClose, onFavorite, isFavorite }) {
  if (!store) return null;
  const cat = getCategoryById(store.category);
  const Icon = ICON_MAP[cat.icon] || Store;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* 內容 */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* 封面 */}
        <div className={`h-40 bg-gradient-to-br ${cat.gradient} flex items-center justify-center relative`}>
          <Icon className="w-16 h-16 text-white/70" strokeWidth={1.2} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => onFavorite?.(store)}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-400 text-red-400' : 'text-white'}`} />
          </button>
          <span className="absolute bottom-3 right-4 bg-black/30 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
            {formatDistance(store.distance)}
          </span>
        </div>

        {/* 詳情 */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{store.name}</h2>
            <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full ${cat.lightBg} ${cat.iconColor} font-medium`}>
              {cat.label}
            </span>
          </div>

          <div className="space-y-3">
            <InfoRow icon={MapPin} label="地址" value={store.address || '無詳細地址'} />
            <InfoRow icon={Tag} label="品牌" value={store.brand || store.operator || '無更多資訊'} />
            {store.phone && <InfoRow icon={Phone} label="電話" value={store.phone} />}
            {store.openingHours && <InfoRow icon={Clock} label="營業時間" value={store.openingHours} />}
            {store.website && (
              <InfoRow
                icon={Globe}
                label="網站"
                value={
                  <a href={store.website} target="_blank" rel="noopener noreferrer"
                     className="text-primary-600 underline truncate block">{store.website}</a>
                }
              />
            )}
            {store.cuisine && <InfoRow icon={UtensilsCrossed} label="料理類型" value={store.cuisine} />}
            <InfoRow icon={MapPin} label="經緯度" value={`${store.lat.toFixed(5)}, ${store.lon.toFixed(5)}`} />
          </div>

          {/* OSM Tags */}
          {store.osmTags && (
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2">OSM 標籤</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(store.osmTags).slice(0, 8).map(([k, v]) => (
                  <span key={k} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 導航按鈕 */}
          <a
            href={getNavigationUrl(store.lat, store.lon, store.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Navigation className="w-5 h-5" /> 開始導航
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <div className="text-sm text-gray-700">{value}</div>
      </div>
    </div>
  );
}
