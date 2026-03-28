// 會員方案設定集中管理
export const MEMBERSHIP_CONFIG = {
  // 試用天數
  trialDays: 2,

  // 月付價格（TWD）
  monthlyPrice: 30,

  // 方案名稱
  planName: '月付方案',

  // 方案功能列表（用於 PricingCard 顯示）
  features: [
    '完整附近店家搜尋功能',
    '即時地圖定位與導航',
    '收藏喜愛的店家',
    '無限次搜尋與篩選',
    '優先體驗新功能',
  ],

  // 試用功能列表
  trialFeatures: ['免費試用 2 天', '體驗完整功能', '到期後可選擇升級'],

  // 會員狀態輪詢間隔（毫秒）
  pollInterval: 5000,

  // 最大輪詢次數
  maxPollAttempts: 60,
};
