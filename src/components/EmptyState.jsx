import React from 'react';
import { MapPin, Search, Heart } from 'lucide-react';

const ICONS = {
  map: MapPin,
  search: Search,
  heart: Heart,
};

export default function EmptyState({
  icon = 'map',
  title = '尚無資料',
  description = '請嘗試其他搜尋條件',
}) {
  const Icon = ICONS[icon] || MapPin;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs">{description}</p>
    </div>
  );
}
