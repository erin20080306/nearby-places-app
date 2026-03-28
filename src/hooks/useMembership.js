import { useState, useEffect, useCallback, useRef } from 'react';
import { PLAN_TYPES, PAYMENT_STATUS, STORAGE_KEYS } from '../config/constants';
import { MEMBERSHIP_CONFIG } from '../config/membership';
import { getMembershipStatus, startTrial, getPaymentStatus } from '../services/membershipService';
import { getDeviceId, getJSON, setJSON } from '../utils/storage';

// 計算試用剩餘時間
function getTrialRemaining(endAt) {
  if (!endAt) return null;
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return '試用已到期';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours >= 24) return `尚餘 ${Math.ceil(hours / 24)} 天`;
  if (hours > 0) return `尚餘 ${hours} 小時`;
  const mins = Math.floor(diff / (1000 * 60));
  return `尚餘 ${mins} 分鐘`;
}

// 會員狀態管理
// 同步讀取 localStorage 快取，讓首次渲染就有正確狀態
function getInitialMembership() {
  const cached = getJSON(STORAGE_KEYS.MEMBERSHIP_STATUS);
  if (cached && cached.planType) return { ...cached, userId: getDeviceId() };
  return {
    userId: getDeviceId(),
    planType: PLAN_TYPES.NONE,
    paymentStatus: PAYMENT_STATUS.NONE,
    trialStartAt: null,
    trialEndAt: null,
    activatedAt: null,
    expiresAt: null,
  };
}

export function useMembership() {
  const [membership, setMembership] = useState(getInitialMembership);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  // 從後端取得狀態
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getMembershipStatus();
      setMembership((prev) => ({ ...prev, ...data }));
      setJSON(STORAGE_KEYS.MEMBERSHIP_STATUS, data);
      return data;
    } catch {
      // 後端不可用時使用本地快取
      const cached = getJSON(STORAGE_KEYS.MEMBERSHIP_STATUS);
      if (cached) {
        setMembership((prev) => ({ ...prev, ...cached }));
        return cached;
      }
      return null;
    }
  }, []);

  // 初始化
  useEffect(() => {
    fetchStatus().finally(() => setLoading(false));
  }, [fetchStatus]);

  // 啟動試用
  const handleStartTrial = useCallback(async () => {
    try {
      const data = await startTrial();
      setMembership((prev) => ({ ...prev, ...data }));
      setJSON(STORAGE_KEYS.MEMBERSHIP_STATUS, data);
      return data;
    } catch (err) {
      // 後端不可用時做前端本地試用
      const now = new Date();
      const endAt = new Date(now.getTime() + MEMBERSHIP_CONFIG.trialDays * 24 * 60 * 60 * 1000);
      const localTrial = {
        userId: getDeviceId(),
        planType: PLAN_TYPES.TRIAL,
        paymentStatus: PAYMENT_STATUS.NONE,
        trialStartAt: now.toISOString(),
        trialEndAt: endAt.toISOString(),
        activatedAt: null,
        expiresAt: null,
      };
      setMembership(localTrial);
      setJSON(STORAGE_KEYS.MEMBERSHIP_STATUS, localTrial);
      return localTrial;
    }
  }, []);

  // 開始輪詢付款狀態
  const startPolling = useCallback(() => {
    setPolling(true);
    pollCountRef.current = 0;

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current > MEMBERSHIP_CONFIG.maxPollAttempts) {
        clearInterval(pollRef.current);
        setPolling(false);
        return;
      }
      try {
        const data = await getPaymentStatus();
        if (data.paymentStatus === PAYMENT_STATUS.COMPLETED) {
          clearInterval(pollRef.current);
          setPolling(false);
          setMembership((prev) => ({ ...prev, ...data, planType: PLAN_TYPES.PAID }));
          setJSON(STORAGE_KEYS.MEMBERSHIP_STATUS, { ...data, planType: PLAN_TYPES.PAID });
        }
      } catch {
        // 輪詢錯誤靜默處理
      }
    }, MEMBERSHIP_CONFIG.pollInterval);
  }, []);

  // 停止輪詢
  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPolling(false);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // 計算當前有效狀態
  const isTrialActive =
    membership.planType === PLAN_TYPES.TRIAL &&
    membership.trialEndAt &&
    new Date(membership.trialEndAt) > new Date();

  const isPaid = membership.planType === PLAN_TYPES.PAID;

  const isExpired =
    membership.planType === PLAN_TYPES.TRIAL &&
    membership.trialEndAt &&
    new Date(membership.trialEndAt) <= new Date();

  const hasAccess = isPaid || isTrialActive;

  const trialRemaining = getTrialRemaining(membership.trialEndAt);

  return {
    membership,
    loading,
    polling,
    isTrialActive,
    isPaid,
    isExpired,
    hasAccess,
    trialRemaining,
    startTrial: handleStartTrial,
    fetchStatus,
    startPolling,
    stopPolling,
  };
}
