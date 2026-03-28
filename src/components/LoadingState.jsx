import React from 'react';

// 全頁 loading spinner
export function LoadingSpinner({ text = '載入中...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-gray-500">{text}</p>
    </div>
  );
}

// Skeleton 卡片載入
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-8 bg-gray-100 rounded-lg flex-1" />
          <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

// Skeleton 列表
export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-4 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default LoadingSpinner;
