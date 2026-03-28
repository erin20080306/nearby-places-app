import React, { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import BottomNav from './components/BottomNav';
import OnboardingGuide from './components/OnboardingGuide';
import UpgradeModal from './components/UpgradeModal';
import HomePage from './pages/HomePage';
import NearbyPage from './pages/NearbyPage';
import FavoritesPage from './pages/FavoritesPage';
import UpgradePage from './pages/UpgradePage';
import { useGeolocation } from './hooks/useGeolocation';
import { useStores } from './hooks/useStores';
import { useFavorites } from './hooks/useFavorites';
import { useMembership } from './hooks/useMembership';
import { STORAGE_KEYS } from './config/constants';
import { LoadingSpinner } from './components/LoadingState';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const geo = useGeolocation();
  const storeHook = useStores();
  const favorites = useFavorites();
  const membership = useMembership();

  // 首次使用引導（已付費用戶跳過）
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
    if (!done && !membership.isPaid) {
      setShowOnboarding(true);
    } else if (!done && membership.isPaid) {
      // admin 解鎖用戶：自動標記引導完成
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    }
  }, [membership.isPaid]);

  // 引導完成後自動啟動試用
  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    if (!membership.isTrialActive && !membership.isPaid) {
      await membership.startTrial();
    }
  };

  // 試用到期時顯示升級遮罩
  useEffect(() => {
    if (membership.isExpired && !membership.isPaid) {
      setShowUpgradeModal(true);
    }
  }, [membership.isExpired, membership.isPaid]);

  // 會員資訊傳給子頁面
  const membershipProps = {
    ...membership,
    onUpgrade: () => setShowUpgradeModal(true),
  };

  // 會員初始化中
  if (membership.loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingSpinner text="正在載入..." />
      </div>
    );
  }

  // 首次使用引導
  if (showOnboarding) {
    return <OnboardingGuide onComplete={handleOnboardingComplete} />;
  }

  return (
    <AppLayout>
      {/* 主要頁面切換 */}
      {activeTab === 'map' && (
        <HomePage
          position={geo.position}
          geoError={geo.error}
          geoErrorType={geo.errorType}
          geoLoading={geo.loading}
          relocate={geo.relocate}
          stores={storeHook.stores}
          storesLoading={storeHook.loading}
          storesError={storeHook.error}
          searchStores={storeHook.search}
          favorites={favorites}
          membership={membershipProps}
        />
      )}

      {activeTab === 'nearby' && (
        <NearbyPage
          stores={storeHook.stores}
          loading={storeHook.loading}
          favorites={favorites}
        />
      )}

      {activeTab === 'favorites' && (
        <FavoritesPage favorites={favorites} />
      )}

      {activeTab === 'upgrade' && (
        <UpgradePage membership={membershipProps} />
      )}

      {/* 底部導覽列 */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* 升級遮罩（到期時觸發） */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => {
            // 到期且未付費 → 不允許關閉
            if (membership.isExpired && !membership.isPaid) return;
            setShowUpgradeModal(false);
          }}
          isPaid={membership.isPaid}
          isExpired={membership.isExpired}
          polling={membership.polling}
          startPolling={membership.startPolling}
          fetchStatus={membership.fetchStatus}
        />
      )}
    </AppLayout>
  );
}
