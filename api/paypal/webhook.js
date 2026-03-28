const { get, set } = require('../../lib/storage');

/**
 * PayPal Webhook 端點
 * 接收 PayPal 付款完成事件，自動開通會員
 *
 * 設定方式：
 * 1. 登入 PayPal Developer Dashboard
 * 2. 建立 Webhook，URL 設定為 https://your-domain.vercel.app/api/paypal/webhook
 * 3. 訂閱事件：PAYMENT.CAPTURE.COMPLETED, CHECKOUT.ORDER.COMPLETED
 * 4. 取得 Webhook ID，設定為 Vercel 環境變數 PAYPAL_WEBHOOK_ID
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    const event = req.body;
    console.log('PayPal Webhook 收到事件:', event?.event_type);

    // 驗證 webhook 簽名（正式環境應驗證）
    // TODO: 使用 PAYPAL_WEBHOOK_ID 驗證簽名
    // const isValid = await verifyWebhookSignature(req.headers, req.body);

    const eventType = event?.event_type;

    if (
      eventType === 'PAYMENT.CAPTURE.COMPLETED' ||
      eventType === 'CHECKOUT.ORDER.COMPLETED'
    ) {
      const resource = event.resource || {};
      const payerEmail =
        resource.payer?.email_address ||
        resource.purchase_units?.[0]?.payee?.email_address ||
        null;
      const amount =
        resource.amount?.value ||
        resource.purchase_units?.[0]?.amount?.value ||
        null;
      const transactionId = resource.id || null;

      console.log('付款完成:', { payerEmail, amount, transactionId });

      // 儲存付款記錄（以 email 為 key）
      if (payerEmail) {
        const paymentRecord = {
          payerEmail,
          amount,
          transactionId,
          eventType,
          completedAt: new Date().toISOString(),
          status: 'completed',
        };

        await set(`payment:${payerEmail.toLowerCase()}`, paymentRecord);

        // 嘗試尋找已關聯此 email 的使用者並自動開通
        const userLink = await get(`email-link:${payerEmail.toLowerCase()}`);
        if (userLink && userLink.userId) {
          const membership = await get(`membership:${userLink.userId}`);
          if (membership) {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            membership.planType = 'paid';
            membership.paymentStatus = 'completed';
            membership.activatedAt = now.toISOString();
            membership.expiresAt = expiresAt.toISOString();
            membership.paypalTransactionId = transactionId;
            await set(`membership:${userLink.userId}`, membership);
            console.log('自動開通成功:', userLink.userId);
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook 處理失敗:', err);
    return res.status(200).json({ received: true }); // 回傳 200 避免 PayPal 重試
  }
};
