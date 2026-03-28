import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessState({ onContinue }) {
  return (
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4 animate-bounce-once">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800">已成功升級月付方案</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        付費會員已開通，您現在可以使用所有完整功能！
      </p>
      <button
        onClick={onContinue}
        className="mt-8 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
      >
        開始探索
      </button>
    </div>
  );
}
