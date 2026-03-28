// PayPal 設定集中管理
// 前端可公開設定使用 VITE_ 前綴環境變數
// 後端私密設定僅在 Vercel Server Environment Variables 中設定

export const PAYPAL_CONFIG = {
  // 前端可公開
  clientId:
    import.meta.env.VITE_PAYPAL_CLIENT_ID ||
    'BAAi7-8ihcRo-vkUTRkDFRprZchnEOqb6yWuSS0s0IMXP3riUHOySjXVUVviawdqC7XMKP6YLVKppzgvo0',
  hostedButtonId:
    import.meta.env.VITE_PAYPAL_HOSTED_BUTTON_ID || 'BZ35QKTX6LBF4',
  currency: 'TWD',
  planAmount: 30,

  // SDK script URL（動態組合）
  get sdkUrl() {
    return `https://www.paypal.com/sdk/js?client-id=${this.clientId}&components=hosted-buttons&disable-funding=venmo&currency=${this.currency}`;
  },

  // 備用付款連結
  get fallbackPaymentUrl() {
    return `https://www.paypal.com/ncp/payment/${this.hostedButtonId}`;
  },

  // PayPal Hosted Button 容器 ID
  containerId: 'paypal-container-BZ35QKTX6LBF4',
};
