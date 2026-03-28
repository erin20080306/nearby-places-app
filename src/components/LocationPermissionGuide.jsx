import React, { useState } from 'react';
import { MapPin, Settings, RefreshCw, Smartphone, Globe, ChevronDown, ChevronUp, Search } from 'lucide-react';

// 偵測裝置類型
function getDevice() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

const GUIDES = {
  ios: {
    title: 'iPhone / iPad',
    icon: Smartphone,
    steps: [
      '打開「設定」App',
      '向下滑動找到「隱私權與安全性」',
      '點擊「定位服務」→ 確認已開啟',
      '向下找到您使用的瀏覽器（Safari / Chrome）',
      '選擇「使用 App 期間」或「下次詢問」',
      '回到本頁面，點擊下方「重新定位」按鈕',
    ],
  },
  android: {
    title: 'Android 手機',
    icon: Smartphone,
    steps: [
      '打開「設定」→「位置資訊」→ 確認已開啟',
      '或：「設定」→「應用程式」→ 找到您的瀏覽器',
      '點擊「權限」→「位置」→ 選擇「僅在使用時允許」',
      '回到本頁面，點擊下方「重新定位」按鈕',
    ],
  },
  desktop: {
    title: '電腦瀏覽器',
    icon: Globe,
    steps: [
      '點擊網址列左側的鎖頭 🔒 或資訊圖示',
      '找到「位置」或「Location」權限',
      '設定為「允許」',
      '重新整理頁面，或點擊下方「重新定位」按鈕',
    ],
  },
};

export default function LocationPermissionGuide({ errorType, onRetry, onManualSearch }) {
  const [expanded, setExpanded] = useState(true);
  const device = getDevice();
  const guide = GUIDES[device];
  const DeviceIcon = guide.icon;

  const isDenied = errorType === 'denied';

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-white shadow-lg border border-orange-100 overflow-hidden">
      {/* 頭部 */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">
              {isDenied ? '需要開啟定位權限' : '無法取得您的位置'}
            </h3>
            <p className="text-white/80 text-xs mt-0.5">
              {isDenied
                ? '本 App 需要您的位置來搜尋附近店家'
                : '請確認定位功能已開啟，或手動搜尋地址'}
            </p>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="px-5 py-4 space-y-3">
        {/* 重新定位 */}
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重新定位
        </button>

        {/* 手動搜尋 */}
        <button
          onClick={onManualSearch}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          改用手動搜尋地址
        </button>
      </div>

      {/* 開啟權限教學（可收合） */}
      {isDenied && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-5 py-3 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <Settings className="w-4 h-4 text-gray-400" />
              如何開啟定位權限？（{guide.title}）
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="px-5 pb-4">
              <ol className="space-y-2.5">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600 leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>

              {/* 額外提示 */}
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  💡 <strong>提示：</strong>更改權限後，請回到此頁面點擊「重新定位」。若仍無法定位，請嘗試重新整理頁面。
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
