import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import { getCategoryById } from '../data/categories';
import { formatDistance } from '../utils/distance';
import { getNavigationUrl } from '../utils/platform';

// 自訂使用者位置 icon
const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="width:20px;height:20px;background:#0d9488;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 店家 marker icon（依分類顏色）
const MARKER_COLORS = {
  food: '#f97316',
  fuel: '#3b82f6',
  cafe: '#d97706',
  convenience: '#10b981',
  parking: '#0ea5e9',
  shop: '#8b5cf6',
};

function getStoreIcon(category) {
  const color = MARKER_COLORS[category] || '#6b7280';
  return L.divIcon({
    className: 'store-marker',
    html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// 地圖中心移動元件
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

// 處理外部觸發的 flyTo（透過 ref）
function FlyToHandler({ flyToRef }) {
  const map = useMap();
  useEffect(() => {
    if (flyToRef) {
      flyToRef.current = (lat, lon, zoomLevel = 16) => {
        map.flyTo([lat, lon], zoomLevel, { duration: 0.8 });
      };
    }
  }, [map, flyToRef]);
  return null;
}

export default function MapView({
  center,
  stores = [],
  onStoreClick,
  selectedStoreId,
  flyToRef,
  userPosition,
}) {
  const mapCenter = center ? [center.lat, center.lon] : [25.033, 121.5654];

  return (
    <div className="relative w-full h-[28vh] min-h-[180px] max-h-[320px] rounded-2xl overflow-hidden shadow-card mx-4 border border-gray-100"
         style={{ width: 'calc(100% - 2rem)' }}>
      <MapContainer
        center={mapCenter}
        zoom={15}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ background: '#f0f0f0' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center ? [center.lat, center.lon] : null} />
        <FlyToHandler flyToRef={flyToRef} />

        {/* 使用者位置 */}
        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lon]} icon={userIcon}>
            <Popup className="custom-popup">
              <span className="text-sm font-medium text-primary-700">📍 我的位置</span>
            </Popup>
          </Marker>
        )}

        {/* 店家 markers */}
        {stores.map((store) => {
          const cat = getCategoryById(store.category);
          return (
            <Marker
              key={store.id}
              position={[store.lat, store.lon]}
              icon={getStoreIcon(store.category)}
              eventHandlers={{ click: () => onStoreClick?.(store) }}
            >
              <Popup className="custom-popup" maxWidth={260}>
                <div className="p-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{store.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.label} · {formatDistance(store.distance)}</p>
                  {store.address && (
                    <p className="text-xs text-gray-400 mt-1">{store.address}</p>
                  )}
                  <a
                    href={getNavigationUrl(store.lat, store.lon, store.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-primary-600 text-white text-xs rounded-full hover:bg-primary-700 transition-colors"
                  >
                    <Navigation className="w-3 h-3" /> 導航
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
