import { CATEGORIES, detectCategory } from '../data/categories';
import { calculateDistance } from '../utils/distance';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// 根據分類 ID 建構 Overpass QL 查詢
function buildQuery(categoryId, lat, lon, radius) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  const filters = category.overpassTags
    .map(({ key, values }) =>
      values.map((v) => `node["${key}"="${v}"](around:${radius},${lat},${lon});`).join('\n')
    )
    .join('\n');

  return `
[out:json][timeout:15];
(
  ${filters}
);
out body;
  `.trim();
}

// 查詢附近店家
export async function fetchNearbyStores(categoryId, lat, lon, radius = 1000) {
  const query = buildQuery(categoryId, lat, lon, radius);
  if (!query) throw new Error('無效的分類');

  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error('無法取得店家資料，請稍後再試');
  }

  const data = await response.json();

  // 解析並標準化店家資料
  const stores = data.elements
    .filter((el) => el.tags && el.tags.name)
    .map((el) => {
      const tags = el.tags;
      const dist = calculateDistance(lat, lon, el.lat, el.lon);
      const cat = detectCategory(tags);

      return {
        id: el.id,
        name: tags.name || '未知店家',
        category: cat,
        lat: el.lat,
        lon: el.lon,
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

  return stores;
}

// 查詢所有分類（首頁用）
export async function fetchAllNearby(lat, lon, radius = 1000) {
  const query = `
[out:json][timeout:20];
(
  node["amenity"~"restaurant|fast_food|cafe|bakery|food_court|fuel"](around:${radius},${lat},${lon});
  node["shop"~"convenience|supermarket|mall|clothes|electronics|department_store"](around:${radius},${lat},${lon});
);
out body;
  `.trim();

  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) throw new Error('無法取得店家資料');

  const data = await response.json();

  return data.elements
    .filter((el) => el.tags && el.tags.name)
    .map((el) => {
      const tags = el.tags;
      const dist = calculateDistance(lat, lon, el.lat, el.lon);
      return {
        id: el.id,
        name: tags.name || '未知店家',
        category: detectCategory(tags),
        lat: el.lat,
        lon: el.lon,
        distance: dist,
        address: tags['addr:full'] || tags['addr:street']
          ? `${tags['addr:city'] || ''}${tags['addr:district'] || ''}${tags['addr:street'] || ''}${tags['addr:housenumber'] || ''}`
          : null,
        phone: tags.phone || null,
        website: tags.website || null,
        openingHours: tags.opening_hours || null,
        cuisine: tags.cuisine || null,
        brand: tags.brand || null,
        operator: tags.operator || null,
        osmTags: tags,
      };
    })
    .sort((a, b) => a.distance - b.distance);
}
