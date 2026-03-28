import React from 'react';
import {
  UtensilsCrossed,
  Fuel,
  Coffee,
  Store,
  ShoppingBag,
  ParkingSquare,
  LayoutGrid,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

const ICON_MAP = {
  LayoutGrid,
  UtensilsCrossed,
  Fuel,
  Coffee,
  Store,
  ShoppingBag,
  ParkingSquare,
};

export default function CategoryChips({ selected, onSelect }) {
  return (
    <div className="px-4 py-2">
      <p className="text-xs text-gray-400 mb-2 font-medium">搜尋分類（點擊重新搜尋）</p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Store;
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                ${isActive
                  ? `bg-gradient-to-r ${cat.gradient} text-white shadow-md`
                  : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-primary-200 hover:bg-primary-50'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
