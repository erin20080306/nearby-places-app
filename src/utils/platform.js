// 平台偵測工具

// 判斷是否為 iOS 裝置
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// 產生導航 URL
export function getNavigationUrl(lat, lon, name = '') {
  if (isIOS()) {
    return `maps://maps.apple.com/?daddr=${lat},${lon}&dirflg=d&t=m`;
  }
  const q = name ? encodeURIComponent(name) : `${lat},${lon}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=&travelmode=driving`;
}
