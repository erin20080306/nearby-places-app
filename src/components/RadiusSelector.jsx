import React from 'react';
import { RADIUS_OPTIONS } from '../data/radiusOptions';

export default function RadiusSelector({ selected, onSelect }) {
  return (
    <div className="flex gap-2 py-1 overflow-x-auto scrollbar-hide">
      <span className="text-xs text-gray-400 self-center shrink-0 mr-1">範圍</span>
      {RADIUS_OPTIONS.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 shrink-0
              ${isActive
                ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
