import { CATEGORIES, detectCategory } from '../data/categories';
import { calculateDistance } from '../utils/distance';

// 多個 Overpass API 節點（不重複，各自獨立）
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

// === 端點健康追蹤（Circuit Breaker）===
// 記錄每個端點最近失敗次數，連續失敗 3 次後暫時跳過 60 秒
const endpointHealth = new Map();
const HEALTH_FAIL_THRESHOLD = 3;
const HEALTH_COOLDOWN = 60 * 1000; // 60 秒冷卻

function markEndpointSuccess(ep) {
  endpointHealth.set(ep, { fails: 0, lastFail: 0 });
}

function markEndpointFail(ep) {
  const h = endpointHealth.get(ep) || { fails: 0, lastFail: 0 };
  h.fails += 1;
  h.lastFail = Date.now();
  endpointHealth.set(ep, h);
}

function isEndpointHealthy(ep) {
  const h = endpointHealth.get(ep);
  if (!h) return true;
  if (h.fails < HEALTH_FAIL_THRESHOLD) return true;
  // 冷卻期過後重新嘗試
  return Date.now() - h.lastFail > HEALTH_COOLDOWN;
}

function getHealthyEndpoints() {
  const healthy = OVERPASS_ENDPOINTS.filter(isEndpointHealthy);
  // 如果全部不健康，還是全部嘗試（避免完全無法查詢）
  return healthy.length > 0 ? healthy : OVERPASS_ENDPOINTS;
}

// === 快取機制：相同區域 + 分類 10 分鐘內不重複查詢 ===
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 分鐘（新鮮）
const CACHE_STALE_TTL = 30 * 60 * 1000; // 30 分鐘（過期但可用作 fallback）
const CACHE_MAX_SIZE = 200;

function getCacheKey(lat, lon, radius, suffix) {
  // 將座標四捨五入到小數 3 位（約 111 公尺），相近位置共用快取
  const rlat = Math.round(lat * 1000) / 1000;
  const rlon = Math.round(lon * 1000) / 1000;
  return `${rlat},${rlon},${radius},${suffix}`;
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) return null; // 過期不自動回傳
  return entry.data;
}

// 取得過期但仍可用的快取（stale-while-revalidate fallback）
function getStaleCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_STALE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  // 限制快取大小（LRU：刪最舊的）
  if (cache.size > CACHE_MAX_SIZE) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// === 全域請求佇列：避免同時發出太多 Overpass 請求 ===
let activeRequests = 0;
const MAX_CONCURRENT = 2; // 最多同時 2 組競速請求
const requestQueue = [];

function enqueueRequest(fn) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      activeRequests++;
      try {
        resolve(await fn());
      } catch (err) {
        reject(err);
      } finally {
        activeRequests--;
        if (requestQueue.length > 0) {
          const next = requestQueue.shift();
          next();
        }
      }
    };
    if (activeRequests < MAX_CONCURRENT) {
      run();
    } else {
      requestQueue.push(run);
    }
  });
}

// 單一端點 fetch（帶 timeout）
function fetchFromEndpoint(endpoint, query, timeoutMs) {
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
      markEndpointSuccess(endpoint);
      return res.json();
    })
    .catch((err) => {
      clearTimeout(timer);
      markEndpointFail(endpoint);
      throw err;
    });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 多端點並行競速：只用健康端點，最快成功的回傳
// 第一輪 12 秒，等待 2 秒後重試第二輪 20 秒
async function fetchOverpass(query) {
  return enqueueRequest(async () => {
    const endpoints = getHealthyEndpoints();
    // 第一輪：12 秒 timeout
    try {
      return await Promise.any(
        endpoints.map((ep) => fetchFromEndpoint(ep, query, 12000))
      );
    } catch {
      console.warn('Overpass 第一輪全部失敗，等待後重試...');
    }
    // 延遲 2 秒再重試，避免連續轟炸
    await delay(2000);
    // 第二輪：20 秒 timeout，使用所有端點（含不健康的）
    try {
      return await Promise.any(
        OVERPASS_ENDPOINTS.map((ep) => fetchFromEndpoint(ep, query, 20000))
      );
    } catch {
      throw new Error('伺服器忙碌中，請稍後再試');
    }
  });
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
[out:json][timeout:20];
(
  ${filters}
);
out center;
  `.trim();
}

// 查詢附近店家（搜不到時自動擴大範圍一次）
export async function fetchNearbyStores(categoryId, lat, lon, radius = 1000) {
  // 「全部」分類：搜尋所有類別
  if (categoryId === 'all') return fetchAllNearby(lat, lon, radius);

  // 檢查快取
  const key = getCacheKey(lat, lon, radius, categoryId);
  const cached = getCache(key);
  if (cached) return cached;

  const query = buildQuery(categoryId, lat, lon, radius);
  if (!query) throw new Error('無效的分類');

  let data;
  try {
    data = await fetchOverpass(query);
  } catch (err) {
    // 伺服器失敗時嘗試返回過期快取（stale-while-revalidate）
    const stale = getStaleCache(key);
    if (stale) return stale;
    throw err;
  }
  let results = parseElements(data.elements, lat, lon);

  // 搜不到時自動擴大 1.5 倍範圍重試一次（上限 20km）
  if (results.length === 0 && radius < 20000) {
    const expanded = Math.min(Math.round(radius * 1.5), 20000);
    const retryQuery = buildQuery(categoryId, lat, lon, expanded);
    if (retryQuery) {
      try {
        const retryData = await fetchOverpass(retryQuery);
        results = parseElements(retryData.elements, lat, lon);
      } catch {
        // 擴大範圍失敗不拋出，回傳空結果即可
      }
    }
  }

  setCache(key, results);
  return results;
}

// 查詢所有分類（首頁用）
export async function fetchAllNearby(lat, lon, radius = 1000) {
  // 檢查快取
  const key = getCacheKey(lat, lon, radius, 'all');
  const cached = getCache(key);
  if (cached) return cached;

  const allQuery = (r) => `
[out:json][timeout:20];
(
  node["amenity"~"restaurant|fast_food|cafe|bakery|food_court|fuel|parking|clinic|doctors|dentist|pharmacy|hospital|karaoke_box|karaoke"](around:${r},${lat},${lon});
  way["amenity"~"restaurant|fast_food|cafe|bakery|food_court|fuel|parking|clinic|doctors|dentist|pharmacy|hospital|karaoke_box|karaoke"](around:${r},${lat},${lon});
  node["shop"~"convenience|supermarket|mall|clothes|electronics|department_store"](around:${r},${lat},${lon});
  way["shop"~"convenience|supermarket|mall|clothes|electronics|department_store"](around:${r},${lat},${lon});
  node["tourism"~"hotel|motel|hostel|guest_house"](around:${r},${lat},${lon});
  way["tourism"~"hotel|motel|hostel|guest_house"](around:${r},${lat},${lon});
  node["leisure"="karaoke"](around:${r},${lat},${lon});
  way["leisure"="karaoke"](around:${r},${lat},${lon});
);
out center;
  `.trim();

  let data;
  try {
    data = await fetchOverpass(allQuery(radius));
  } catch (err) {
    // 伺服器失敗時嘗試返回過期快取
    const stale = getStaleCache(key);
    if (stale) return stale;
    throw err;
  }
  let results = parseElements(data.elements, lat, lon);

  // 搜不到時自動擴大 1.5 倍範圍重試一次（上限 20km）
  if (results.length === 0 && radius < 20000) {
    const expanded = Math.min(Math.round(radius * 1.5), 20000);
    try {
      const retryData = await fetchOverpass(allQuery(expanded));
      results = parseElements(retryData.elements, lat, lon);
    } catch {
      // 擴大範圍失敗不拋出，回傳空結果即可
    }
  }

  setCache(key, results);
  return results;
}
