// 店家分類定義與 Overpass 查詢對照表
// icon 使用 lucide-react 圖示名稱

export const CATEGORIES = [
  {
    id: 'all',
    label: '全部',
    icon: 'LayoutGrid',
    gradient: 'from-gray-500 to-gray-600',
    lightBg: 'bg-gray-50',
    iconColor: 'text-gray-500',
    overpassTags: [],
  },
  {
    id: 'food',
    label: '美食',
    icon: 'UtensilsCrossed',
    gradient: 'from-orange-400 to-amber-500',
    lightBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    overpassTags: [
      { key: 'amenity', values: ['restaurant', 'fast_food', 'cafe', 'bakery', 'food_court'] },
    ],
  },
  {
    id: 'fuel',
    label: '加油站',
    icon: 'Fuel',
    gradient: 'from-blue-400 to-slate-500',
    lightBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    overpassTags: [{ key: 'amenity', values: ['fuel'] }],
  },
  {
    id: 'cafe',
    label: '咖啡廳',
    icon: 'Coffee',
    gradient: 'from-amber-600 to-yellow-700',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    overpassTags: [{ key: 'amenity', values: ['cafe'] }],
  },
  {
    id: 'convenience',
    label: '便利商店',
    icon: 'Store',
    gradient: 'from-emerald-400 to-teal-500',
    lightBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    overpassTags: [{ key: 'shop', values: ['convenience', 'supermarket'] }],
  },
  {
    id: 'parking',
    label: '停車場',
    icon: 'ParkingSquare',
    gradient: 'from-sky-400 to-cyan-500',
    lightBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    overpassTags: [{ key: 'amenity', values: ['parking'] }],
  },
  {
    id: 'shop',
    label: '一般店家',
    icon: 'ShoppingBag',
    gradient: 'from-violet-400 to-indigo-500',
    lightBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    overpassTags: [
      { key: 'shop', values: ['mall', 'clothes', 'electronics', 'department_store', 'yes'] },
    ],
  },
  {
    id: 'clinic',
    label: '診所',
    icon: 'Stethoscope',
    gradient: 'from-red-400 to-rose-500',
    lightBg: 'bg-red-50',
    iconColor: 'text-red-500',
    overpassTags: [
      { key: 'amenity', values: ['clinic', 'doctors', 'dentist', 'pharmacy', 'hospital'] },
    ],
  },
  {
    id: 'hotel',
    label: '旅社',
    icon: 'BedDouble',
    gradient: 'from-purple-400 to-fuchsia-500',
    lightBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    overpassTags: [
      { key: 'tourism', values: ['hotel', 'motel', 'hostel', 'guest_house'] },
    ],
  },
  {
    id: 'ktv',
    label: 'KTV',
    icon: 'Mic2',
    gradient: 'from-pink-400 to-rose-500',
    lightBg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    overpassTags: [
      { key: 'amenity', values: ['karaoke_box', 'karaoke'] },
      { key: 'leisure', values: ['karaoke'] },
    ],
  },
];

// 列表篩選選項
export const FILTER_OPTIONS = [
  { id: 'all', label: '全部' },
  { id: 'nearest', label: '最近' },
  { id: 'food', label: '美食' },
  { id: 'fuel', label: '加油站' },
  { id: 'cafe', label: '咖啡' },
  { id: 'convenience', label: '超商' },
  { id: 'parking', label: '停車場' },
  { id: 'shop', label: '店家' },
  { id: 'clinic', label: '診所' },
  { id: 'hotel', label: '旅社' },
  { id: 'ktv', label: 'KTV' },
];

// 根據 category ID 取得分類資訊
export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

// 根據 OSM tags 判斷分類
export function detectCategory(tags) {
  if (!tags) return 'shop';
  const amenity = tags.amenity || '';
  const shop = tags.shop || '';

  const tourism = tags.tourism || '';
  const leisure = tags.leisure || '';

  if (['restaurant', 'fast_food', 'bakery', 'food_court'].includes(amenity)) return 'food';
  if (amenity === 'cafe') return 'cafe';
  if (amenity === 'fuel') return 'fuel';
  if (amenity === 'parking') return 'parking';
  if (['convenience', 'supermarket'].includes(shop)) return 'convenience';
  if (['clinic', 'doctors', 'dentist', 'pharmacy', 'hospital'].includes(amenity)) return 'clinic';
  if (['hotel', 'motel', 'hostel', 'guest_house'].includes(tourism)) return 'hotel';
  if (['karaoke_box', 'karaoke'].includes(amenity) || leisure === 'karaoke') return 'ktv';
  return 'shop';
}
