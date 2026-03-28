const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

// 搜尋地址或地名，回傳座標
export async function searchLocation(query) {
  const url = `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=zh-TW`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'NearbyPlacesApp/1.0' },
  });

  if (!response.ok) throw new Error('搜尋服務暫時無法使用');

  const results = await response.json();

  if (!results.length) throw new Error('找不到相關地點，請嘗試其他關鍵字');

  return results.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    type: r.type,
    importance: r.importance,
  }));
}

// 地址自動建議（autocomplete）
export async function searchSuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=zh-TW&countrycodes=tw&addressdetails=1`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'NearbyPlacesApp/1.0' },
  });

  if (!response.ok) return [];

  const results = await response.json();

  return results.map((r) => ({
    displayName: r.display_name,
    shortName: [r.address?.road, r.address?.suburb, r.address?.city_district, r.address?.city].filter(Boolean).join(', ') || r.display_name.split(',').slice(0, 2).join(','),
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    type: r.type,
  }));
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
