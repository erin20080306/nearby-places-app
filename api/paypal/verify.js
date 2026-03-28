const { get, set } = require('../../lib/storage');

/**
 * 手動驗證付款端點
 * 使用者提供 PayPal email，後端檢查是否有對應的付款記錄
 * 若有，自動開通會員
 *
 * POST /api/paypal/verify
 * Body: { userId, email }
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
    const { userId, email } = req.body || {};

    if (!userId || !email) {
      return res.status(400).json({ error: '缺少 userId 或 email' });
    }

    const emailKey = email.toLowerCase().trim();

    // 建立 email <-> userId 關聯（供 webhook 自動開通用）
    await set(`email-link:${emailKey}`, { userId, email: emailKey });

    // 檢查是否已有此 email 的付款記錄（由 webhook 寫入）
    const paymentRecord = await get(`payment:${emailKey}`);

    if (paymentRecord && paymentRecord.status === 'completed') {
      // 付款已確認，開通會員
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const membership = (await get(`membership:${userId}`)) || { userId };
      membership.planType = 'paid';
      membership.paymentStatus = 'completed';
      membership.activatedAt = now.toISOString();
      membership.expiresAt = expiresAt.toISOString();
      membership.paypalEmail = emailKey;
      membership.paypalTransactionId = paymentRecord.transactionId || null;

      await set(`membership:${userId}`, membership);

      return res.status(200).json({
        success: true,
        message: '付款已確認，會員已開通',
        membership,
      });
    }

    // 若無 webhook 記錄，嘗試使用 PayPal API 查詢（需要 PAYPAL_CLIENT_ID + PAYPAL_SECRET）
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_SECRET;
    const paypalApiBase = process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com';

    if (paypalClientId && paypalSecret) {
      try {
        // 取得 OAuth token
        const tokenRes = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          const accessToken = tokenData.access_token;

          // 搜尋最近 24 小時的交易
          const now = new Date();
          const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          const endDate = now.toISOString();

          const txnRes = await fetch(
            `${paypalApiBase}/v1/reporting/transactions?start_date=${startDate}&end_date=${endDate}&fields=all&page_size=10`,
            {
              headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            }
          );

          if (txnRes.ok) {
            const txnData = await txnRes.json();
            const matchingTxn = (txnData.transaction_details || []).find((txn) => {
              const payerInfo = txn.payer_info || {};
              const txnInfo = txn.transaction_info || {};
              return (
                payerInfo.email_address?.toLowerCase() === emailKey &&
                txnInfo.transaction_status === 'S'
              );
            });

            if (matchingTxn) {
              const now2 = new Date();
              const expiresAt2 = new Date(now2.getTime() + 30 * 24 * 60 * 60 * 1000);

              const membership = (await get(`membership:${userId}`)) || { userId };
              membership.planType = 'paid';
              membership.paymentStatus = 'completed';
              membership.activatedAt = now2.toISOString();
              membership.expiresAt = expiresAt2.toISOString();
              membership.paypalEmail = emailKey;
              membership.paypalTransactionId =
                matchingTxn.transaction_info?.transaction_id || null;

              await set(`membership:${userId}`, membership);

              // 同時儲存付款記錄
              await set(`payment:${emailKey}`, {
                payerEmail: emailKey,
                transactionId: membership.paypalTransactionId,
                status: 'completed',
                completedAt: now2.toISOString(),
              });

              return res.status(200).json({
                success: true,
                message: '付款已透過 PayPal API 確認，會員已開通',
                membership,
              });
            }
          }
        }
      } catch (apiErr) {
        console.error('PayPal API 查詢失敗:', apiErr);
      }
    }

    // 儲存 pending 關聯，等待 webhook 觸發
    return res.status(202).json({
      success: false,
      message: '尚未找到付款記錄，已建立關聯。若已完成付款，系統將在收到通知後自動開通。',
    });
  } catch (err) {
    console.error('驗證付款失敗:', err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
};
