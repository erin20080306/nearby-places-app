// 多層快取策略
const STATIC_CACHE = 'nearby-places-static-v2';
const TILE_CACHE = 'nearby-places-tiles-v1';   // OSM 地圖圖磚（cache-first，久存）
const API_CACHE = 'nearby-places-api-v1';      // API 回應（stale-while-revalidate）

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
];

const TILE_CACHE_MAX = 300;         // 最多快取 300 張圖磚
const API_CACHE_MAX = 100;          // 最多快取 100 筆 API 回應

// 判斷是否為 OSM tile 請求
function isOSMTile(url) {
  return /tile\.openstreetmap\.org|tile-[a-z]\.openstreetmap\.org|[abc]\.tile\.openstreetmap\.org/.test(url);
}

// 判斷是否為 Overpass / Nominatim API 請求
function isMapAPI(url) {
  return url.includes('overpass') || url.includes('nominatim');
}

// LRU 修剪：超過上限時刪除最舊的項目
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const removeCount = keys.length - maxItems;
    await Promise.all(keys.slice(0, removeCount).map((k) => cache.delete(k)));
  }
}

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 啟用並清除舊版本快取
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, TILE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !validCaches.includes(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 三層 fetch 策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = request.url;

  // === 1. OSM 地圖圖磚：cache-first（圖磚很少變動，命中即用） ===
  if (isOSMTile(url)) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) {
            // 背景更新（不阻塞）
            fetch(request).then((res) => {
              if (res && res.ok) {
                cache.put(request, res.clone());
                trimCache(TILE_CACHE, TILE_CACHE_MAX);
              }
            }).catch(() => {});
            return cached;
          }
          return fetch(request).then((res) => {
            if (res && res.ok) {
              cache.put(request, res.clone());
              trimCache(TILE_CACHE, TILE_CACHE_MAX);
            }
            return res;
          });
        })
      )
    );
    return;
  }

  // === 2. 地圖 API（Overpass / Nominatim）：stale-while-revalidate ===
  if (isMapAPI(url)) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkPromise = fetch(request).then((res) => {
            if (res && res.ok) {
              cache.put(request, res.clone());
              trimCache(API_CACHE, API_CACHE_MAX);
            }
            return res;
          }).catch(() => cached || Promise.reject());
          // 有快取就立即回，背景更新
          return cached || networkPromise;
        })
      )
    );
    return;
  }

  // === 3. 自家 API（/api/）：永遠走網路 ===
  if (url.includes('/api/')) return;

  // === 4. 靜態資源：network-first，失敗時用快取 ===
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
