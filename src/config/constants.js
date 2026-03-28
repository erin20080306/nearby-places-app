// localStorage key 統一管理
export const STORAGE_KEYS = {
  DEVICE_ID: 'np_device_id',
  TRIAL_START: 'np_trial_start',
  MEMBERSHIP_STATUS: 'np_membership_status',
  FAVORITES: 'np_favorites',
  SEARCH_HISTORY: 'np_search_history',
  ONBOARDING_DONE: 'np_onboarding_done',
};

// 會員狀態類型
export const PLAN_TYPES = {
  NONE: 'none',
  TRIAL: 'trial',
  PAID: 'paid',
  EXPIRED: 'expired',
};

// 付款狀態
export const PAYMENT_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// API 端點
export const API_ROUTES = {
  MEMBERSHIP_STATUS: '/api/membership/status',
  START_TRIAL: '/api/membership/start-trial',
  PAYPAL_WEBHOOK: '/api/paypal/webhook',
  PAYPAL_VERIFY: '/api/paypal/verify',
  PAYMENT_STATUS: '/api/payment/status',
};
