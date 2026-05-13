import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss, onRetry }) {
  if (!message) return null;
  return (
    <div className="mx-4 my-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in">
      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-600">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重新搜尋
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-300 hover:text-red-500">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
