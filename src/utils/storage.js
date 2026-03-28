import { STORAGE_KEYS } from '../config/constants';

// 產生唯一裝置 ID
export function getDeviceId() {
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

// 安全讀取 JSON
export function getJSON(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

// 安全寫入 JSON
export function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage 滿或不可用時靜默失敗
  }
}

// 移除
export function removeItem(key) {
  localStorage.removeItem(key);
}
