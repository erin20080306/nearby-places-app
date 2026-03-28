/**
 * 簡易資料儲存抽象層
 * - 若設定 UPSTASH_REDIS_REST_URL，使用 Upstash Redis（建議正式環境）
 * - 否則使用 in-memory Map（開發用，serverless 冷啟動後會清空）
 *
 * 限制說明：
 * - In-memory 儲存在 Vercel serverless 環境中不會跨函式呼叫持久化
 * - 正式部署請務必設定 Upstash Redis（免費方案：10K commands/day）
 * - Upstash 可透過 Vercel Integration 一鍵整合
 */

const memoryStore = new Map();

// Upstash Redis REST API 簡易封裝
async function redisRequest(method, args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([method, ...args]),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

function useRedis() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function get(key) {
  if (useRedis()) {
    const val = await redisRequest('GET', [key]);
    return val ? JSON.parse(val) : null;
  }
  return memoryStore.get(key) || null;
}

async function set(key, value, ttlSeconds) {
  const serialized = JSON.stringify(value);
  if (useRedis()) {
    if (ttlSeconds) {
      await redisRequest('SETEX', [key, ttlSeconds, serialized]);
    } else {
      await redisRequest('SET', [key, serialized]);
    }
    return;
  }
  memoryStore.set(key, value);
}

async function del(key) {
  if (useRedis()) {
    await redisRequest('DEL', [key]);
    return;
  }
  memoryStore.delete(key);
}

module.exports = { get, set, del, useRedis };
