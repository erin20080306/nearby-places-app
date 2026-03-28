const { get } = require('../../lib/storage');

/**
 * 查詢付款狀態端點
 * 前端輪詢此端點，確認付款是否已被 webhook 處理
 *
 * GET /api/payment/status?userId=xxx
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: '缺少 userId' });
  }

  try {
    const membership = await get(`membership:${userId}`);

    if (!membership) {
      return res.status(200).json({
        userId,
        paymentStatus: 'none',
        planType: 'none',
      });
    }

    return res.status(200).json({
      userId: membership.userId,
      paymentStatus: membership.paymentStatus || 'none',
      planType: membership.planType || 'none',
      activatedAt: membership.activatedAt || null,
      expiresAt: membership.expiresAt || null,
    });
  } catch (err) {
    console.error('查詢付款狀態失敗:', err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
};
