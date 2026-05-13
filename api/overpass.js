// Vercel Edge Function：Overpass API 代理 + 邊緣快取
// 將請求轉為 GET（URL query），讓 Vercel Edge Network 自動 CDN 快取
// 同一區域、同一查詢的不同用戶共享快取 → 大幅減少 Overpass 流量、加速回應

export const config = {
  runtime: 'edge',
};

// 多個 Overpass 端點，循環嘗試
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

// 單一端點 fetch + timeout
async function fetchFromEndpoint(endpoint, query, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// 多端點並行競速
async function raceOverpass(query, timeoutMs) {
  return Promise.any(
    OVERPASS_ENDPOINTS.map((ep) => fetchFromEndpoint(ep, query, timeoutMs))
  );
}

export default async function handler(req) {
  // 支援 GET（讓 Vercel Edge 快取生效）和 POST（向後相容）
  let query;
  if (req.method === 'GET') {
    const url = new URL(req.url);
    query = url.searchParams.get('q');
  } else if (req.method === 'POST') {
    const body = await req.text();
    // 解析 form-urlencoded data=... 格式
    const params = new URLSearchParams(body);
    query = params.get('data') || body;
  } else {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter "q"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 第一輪 8 秒 timeout
    let upstream;
    try {
      upstream = await raceOverpass(query, 8000);
    } catch {
      // 第二輪 12 秒 timeout
      upstream = await raceOverpass(query, 12000);
    }

    const data = await upstream.text();

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // CDN 快取 10 分鐘新鮮，1 小時內可用過期版本（同時觸發背景更新）
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
        // CORS（前端從同源呼叫不需要，但保險）
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Overpass upstream failed', detail: String(err) }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          // 錯誤不快取
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
