import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RADIUS_OPTIONS } from '../data/radiusOptions';

export default function RadiusSelector({ selected, onSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center gap-1 min-w-0 flex-1">
      {/* 左箭頭 */}
      <button
        onClick={() => scroll(-1)}
        className={`p-0.5 rounded-full shrink-0 transition-opacity ${canScrollLeft ? 'text-gray-500' : 'text-gray-200 pointer-events-none'}`}
        aria-label="向左滑動"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* 選項列 */}
      <div ref={scrollRef} className="flex gap-2 py-1 overflow-x-auto scrollbar-hide min-w-0">
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

      {/* 右箭頭 */}
      <button
        onClick={() => scroll(1)}
        className={`p-0.5 rounded-full shrink-0 transition-opacity ${canScrollRight ? 'text-primary-600 animate-pulse' : 'text-gray-200 pointer-events-none'}`}
        aria-label="向右滑動"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
