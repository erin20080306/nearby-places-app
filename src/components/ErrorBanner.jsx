import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="mx-4 my-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in">
      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
      <p className="text-sm text-red-600 flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-300 hover:text-red-500">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
