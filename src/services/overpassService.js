import { CATEGORIES, detectCategory } from '../data/categories';
import { calculateDistance } from '../utils/distance';

// 多個 Overpass API 節點，依序嘗試（部分 Android 手機可能擋特定節點）
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// 快取機制：相同區域 + 分類 3 分鐘內不重複查詢
const cache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 分鐘

function getCacheKey(lat, lon, radius, suffix) {
  // 將座標四捨五入到小數 3 位（約 111 公尺），相近位置共用快取
  const rlat = Math.round(lat * 1000) / 1000;
  const rlon = Math.round(lon * 1000) / 1000;
  return `${rlat},${rlon},${radius},${suffix}`;
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  // 限制快取大小
  if (cache.size > 50) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// 單一端點 fetch（帶 timeout）
function fetchFromEndpoint(endpoint, query, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: controller.signal,
  })
    .then((res) => {
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      clearTimeout(timer);
      throw err;
    });
}

// 多端點並行競速：全部同時發出，最快成功的回傳
async function fetchOverpass(query) {
  try {
    const result = await Promise.any(
      OVERPASS_ENDPOINTS.map((ep) => fetchFromEndpoint(ep, query, 10000))
    );
    return result;
  } catch {
    throw new Error('所有伺服器均無回應，請檢查網路連線後重試');
  }
}

// 從 element 取得座標（node 直接有 lat/lon，way/relation 用 center）
function getCoords(el) {
  if (el.lat && el.lon) return { lat: el.lat, lon: el.lon };
  if (el.center) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

// 將 Overpass elements 轉換為標準化店家資料
function parseElements(elements, userLat, userLon) {
  return elements
    .filter((el) => {
      if (!el.tags) return false;
      const coords = getCoords(el);
      if (!coords) return false;
      // 有名稱，或有品牌/業者名稱
      return el.tags.name || el.tags.brand || el.tags.operator;
    })
    .map((el) => {
      const tags = el.tags;
      const coords = getCoords(el);
      const dist = calculateDistance(userLat, userLon, coords.lat, coords.lon);
      return {
        id: el.id,
        name: tags.name || tags.brand || tags.operator || '未知店家',
        category: detectCategory(tags),
        lat: coords.lat,
        lon: coords.lon,
        distance: dist,
        address: tags['addr:full'] || tags['addr:street']
          ? `${tags['addr:city'] || ''}${tags['addr:district'] || ''}${tags['addr:street'] || ''}${tags['addr:housenumber'] || ''}`
          : null,
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        openingHours: tags.opening_hours || null,
        cuisine: tags.cuisine || null,
        brand: tags.brand || null,
        operator: tags.operator || null,
        osmTags: tags,
      };
    })
    .sort((a, b) => a.distance - b.distance);
}

// 根據分類 ID 建構 Overpass QL 查詢（搜 node + way + relation）
function buildQuery(categoryId, lat, lon, radius) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  const filters = category.overpassTags
    .map(({ key, values }) =>
      values.map((v) =>
        `node["${key}"="${v}"](around:${radius},${lat},${lon});\n` +
        `way["${key}"="${v}"](around:${radius},${lat},${lon});\n` +
        `relation["${key}"="${v}"](around:${radius},${lat},${lon});`
      ).join('\n')
    )
    .join('\n');

  return `
[out:json][timeout:12];
(
  ${filters}
);
out center;
  `.trim();
}

// 查詢附近店家
export async function fetchNearbyStores(categoryId, lat, lon, radius = 1000) {
  // 「全部」分類：搜尋所有類別
  if (categoryId === 'all') return fetchAllNearby(lat, lon, radius);

  // 檢查快取
  const key = getCacheKey(lat, lon, radius, categoryId);
  const cached = getCache(key);
  if (cached) return cached;

  const query = buildQuery(categoryId, lat, lon, radius);
  if (!query) throw new Error('無效的分類');

  const data = await fetchOverpass(query);
  const results = parseElements(data.elements, lat, lon);
  setCache(key, results);
  return results;
}

// 查詢所有分類（首頁用）
export async function fetchAllNearby(lat, lon, radius = 1000) {
  // 檢查快取
  const key = getCacheKey(lat, lon, radius, 'all');
  const cached = getCache(key);
  if (cached) return cached;

  const query = `
[out:json][timeout:12];
(
  node["amenity"~"restaurant|fast_food|cafe|bakery|food_court|fuel|parking"](around:${radius},${lat},${lon});
  way["amenity"~"restaurant|fast_food|cafe|bakery|food_court|fuel|parking"](around:${radius},${lat},${lon});
  node["shop"~"convenience|supermarket|mall|clothes|electronics|department_store"](around:${radius},${lat},${lon});
  way["shop"~"convenience|supermarket|mall|clothes|electronics|department_store"](around:${radius},${lat},${lon});
);
out center;
  `.trim();

  const data = await fetchOverpass(query);
  const results = parseElements(data.elements, lat, lon);
  setCache(key, results);
  return results;
}
