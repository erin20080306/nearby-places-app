import { API_ROUTES } from '../config/constants';
import { getDeviceId } from '../utils/storage';

const BASE = '';

// 取得會員狀態
export async function getMembershipStatus() {
  const userId = getDeviceId();
  const res = await fetch(`${BASE}${API_ROUTES.MEMBERSHIP_STATUS}?userId=${userId}`);
  if (!res.ok) throw new Error('無法取得會員狀態');
  return res.json();
}

// 啟動免費試用
export async function startTrial() {
  const userId = getDeviceId();
  const res = await fetch(`${BASE}${API_ROUTES.START_TRIAL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('無法啟動試用');
  return res.json();
}

// 手動驗證付款（使用者提供 PayPal email）
export async function verifyPayment(email) {
  const userId = getDeviceId();
  const res = await fetch(`${BASE}${API_ROUTES.PAYPAL_VERIFY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || '付款驗證失敗');
  }
  return res.json();
}

// 查詢付款狀態
export async function getPaymentStatus() {
  const userId = getDeviceId();
  const res = await fetch(`${BASE}${API_ROUTES.PAYMENT_STATUS}?userId=${userId}`);
  if (!res.ok) throw new Error('無法查詢付款狀態');
  return res.json();
}
