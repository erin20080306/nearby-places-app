import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

export default function PaymentPendingState({ onRetry }) {
  return (
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-gray-800">正在確認付款</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        付款已收到，正在開通您的會員權限，請稍候...
      </p>
      <p className="text-xs text-gray-400 mt-4">
        通常在 1-2 分鐘內完成確認
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <RefreshCw className="w-4 h-4" /> 重新檢查付款狀態
        </button>
      )}
    </div>
  );
}
