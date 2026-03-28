import React from 'react';
import {
  UtensilsCrossed,
  Fuel,
  Coffee,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

const ICON_MAP = {
  UtensilsCrossed,
  Fuel,
  Coffee,
  Store,
  ShoppingBag,
};

export default function CategoryChips({ selected, onSelect }) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || Store;
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0
              ${isActive
                ? 'bg-primary-600 text-white shadow-md scale-105'
                : 'bg-white text-gray-600 shadow-card hover:shadow-card-hover hover:bg-primary-50'
              }`}
          >
            <Icon className="w-4 h-4" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
