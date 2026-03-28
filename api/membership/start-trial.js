const { get, set } = require('../../lib/storage');

const TRIAL_DAYS = 2;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: '缺少 userId' });
    }

    // 檢查是否已有會員資料
    const existing = await get(`membership:${userId}`);
    if (existing && (existing.planType === 'paid' || existing.planType === 'trial')) {
      return res.status(200).json(existing);
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const membership = {
      userId,
      planType: 'trial',
      paymentStatus: 'none',
      trialStartAt: now.toISOString(),
      trialEndAt: trialEnd.toISOString(),
      activatedAt: null,
      expiresAt: null,
    };

    await set(`membership:${userId}`, membership);

    return res.status(200).json(membership);
  } catch (err) {
    console.error('啟動試用失敗:', err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
};
