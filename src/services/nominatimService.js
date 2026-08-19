const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

// === Nominatim 快取 ===
const searchCache = new Map();
const SEARCH_CACHE_TTL = 15 * 60 * 1000; // 15 分鐘
const suggestCache = new Map();
const SUGGEST_CACHE_TTL = 5 * 60 * 1000; // 5 分鐘
const CACHE_MAX = 100;

function getCached(cacheMap, key, ttl) {
  const entry = cacheMap.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttl) {
    cacheMap.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(cacheMap, key, data) {
  cacheMap.set(key, { data, ts: Date.now() });
  if (cacheMap.size > CACHE_MAX) {
    const oldest = cacheMap.keys().next().value;
    cacheMap.delete(oldest);
  }
}

// 產生台灣地址的退化候選（由細到粗）。
// Nominatim / OSM 對台灣門牌號（「號」）覆蓋率極低，完整地址常搜不到，
// 因此逐級去掉樓層 → 門牌號 → 巷弄，最後退到「路名＋段」或純路名，
// 只要其中一層命中就能定位到街道，解決「無法搜尋定位以外地址」的問題。
export function generalizeTaiwanAddress(query) {
  const q = (query || '').trim();
  if (!q) return [];
  const cands = [q];
  const push = (s) => {
    s = (s || '').trim();
    if (s && !cands.includes(s)) cands.push(s);
  };

  // 1. 去除樓層 / 室 / 之N 結尾（可能連續，如「二段100號5樓」）
  let base = q;
  let prev;
  do {
    prev = base;
    base = base.replace(/[,，、\s]*(?:\d+\s*(?:樓|[fF]|室)|之\s*\d+)\s*$/g, '').trim();
  } while (base !== prev);
  push(base);

  // 2. 去除門牌號（100號 / 100-1號 / 100之1號）及其後文字
  const noNumber = base.replace(/\d+(?:[之\-]\d+)*\s*號.*$/, '').trim();
  push(noNumber);

  // 3. 去除巷 / 弄
  const noAlley = noNumber.replace(/\d+\s*(?:巷|弄).*$/, '').trim();
  push(noAlley);

  // 4. 退到「路名＋段」
  const segMatch = noAlley.match(/^(.*?(?:[一二三四五六七八九十\d]+段))/);
  if (segMatch) push(segMatch[1]);

  // 5. 退到純路名（路 / 街 / 大道 / 道）
  const roadMatch = noAlley.match(/^(.*?(?:大道|路|街|道))/);
  if (roadMatch) push(roadMatch[1]);

  return cands;
}

// 呼叫 Nominatim /search，回傳標準化結果
async function fetchNominatimSearch(query, signal) {
  const url = `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=zh-TW`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('搜尋服務暫時無法使用');
  const results = await response.json();
  return results.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    type: r.type,
    importance: r.importance,
  }));
}

// 搜尋地址或地名，回傳座標。含門牌的完整地址查無結果時，
// 自動由細到粗退化重試，只要有一層命中就回傳。
export async function searchLocation(query) {
  const cacheKey = query.trim().toLowerCase();
  const cached = getCached(searchCache, cacheKey, SEARCH_CACHE_TTL);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const candidates = generalizeTaiwanAddress(query);
    let parsed = [];
    let lastErr = null;

    for (const cand of candidates) {
      try {
        parsed = await fetchNominatimSearch(cand, controller.signal);
        if (parsed.length) break;
      } catch (err) {
        if (err.name === 'AbortError') throw new Error('搜尋逾時，請稍後再試');
        lastErr = err;
      }
    }

    if (!parsed.length) {
      if (lastErr) throw new Error('搜尋服務暫時無法使用，請稍後再試');
      throw new Error('找不到相關地點，請嘗試其他關鍵字');
    }

    setCached(searchCache, cacheKey, parsed);
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

// 地址自動建議（autocomplete）
export async function searchSuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = `sug:${query.trim().toLowerCase()}`;
  const cached = getCached(suggestCache, cacheKey, SUGGEST_CACHE_TTL);
  if (cached) return cached;

  const url = `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=zh-TW&countrycodes=tw&addressdetails=1`;

  const response = await fetch(url);

  if (!response.ok) return [];

  const results = await response.json();

  const parsed = results.map((r) => ({
    displayName: r.display_name,
    shortName: [r.address?.road, r.address?.suburb, r.address?.city_district, r.address?.city].filter(Boolean).join(', ') || r.display_name.split(',').slice(0, 2).join(','),
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    type: r.type,
  }));

  setCached(suggestCache, cacheKey, parsed);
  return parsed;
}

// 反向地理編碼：座標轉地址
export async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=zh-TW`;

  const response = await fetch(url);

  if (!response.ok) return null;

  const data = await response.json();
  return data.display_name || null;
}
