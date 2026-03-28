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
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 w-max">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Store;
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
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
    </div>
  );
}
