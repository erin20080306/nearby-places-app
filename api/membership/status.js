const { get } = require('../../lib/storage');

module.exports = async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 參數' });
  }

  try {
    const membership = await get(`membership:${userId}`);

    if (!membership) {
      return res.status(200).json({
        userId,
        planType: 'none',
        paymentStatus: 'none',
        trialStartAt: null,
        trialEndAt: null,
        activatedAt: null,
        expiresAt: null,
      });
    }

    // 檢查試用是否過期
    if (membership.planType === 'trial' && membership.trialEndAt) {
      if (new Date(membership.trialEndAt) <= new Date()) {
        membership.planType = 'expired';
      }
    }

    return res.status(200).json(membership);
  } catch (err) {
    console.error('取得會員狀態失敗:', err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
};
