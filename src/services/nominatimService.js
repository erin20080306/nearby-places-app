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

// 搜尋地址或地名，回傳座標
export async function searchLocation(query) {
  const cacheKey = query.trim().toLowerCase();
  const cached = getCached(searchCache, cacheKey, SEARCH_CACHE_TTL);
  if (cached) return cached;

  const url = `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=zh-TW`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(url, {
    headers: { 'User-Agent': 'NearbyPlacesApp/1.0' },
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (!response.ok) throw new Error('搜尋服務暫時無法使用');

  const results = await response.json();

  if (!results.length) throw new Error('找不到相關地點，請嘗試其他關鍵字');

  const parsed = results.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    type: r.type,
    importance: r.importance,
  }));

  setCached(searchCache, cacheKey, parsed);
  return parsed;
}

// 地址自動建議（autocomplete）
export async function searchSuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = `sug:${query.trim().toLowerCase()}`;
  const cached = getCached(suggestCache, cacheKey, SUGGEST_CACHE_TTL);
  if (cached) return cached;

  const url = `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=zh-TW&countrycodes=tw&addressdetails=1`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'NearbyPlacesApp/1.0' },
  });

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

  const response = await fetch(url, {
    headers: { 'User-Agent': 'NearbyPlacesApp/1.0' },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.display_name || null;
}
