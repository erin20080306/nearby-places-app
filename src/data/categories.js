// 店家分類定義與 Overpass 查詢對照表
// icon 使用 lucide-react 圖示名稱

export const CATEGORIES = [
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
];

// 列表篩選選項
export const FILTER_OPTIONS = [
  { id: 'all', label: '全部' },
  { id: 'nearest', label: '最近' },
  { id: 'food', label: '美食' },
  { id: 'fuel', label: '加油站' },
  { id: 'cafe', label: '咖啡' },
  { id: 'convenience', label: '超商' },
  { id: 'shop', label: '店家' },
];

// 根據 category ID 取得分類資訊
export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[4];
}

// 根據 OSM tags 判斷分類
export function detectCategory(tags) {
  if (!tags) return 'shop';
  const amenity = tags.amenity || '';
  const shop = tags.shop || '';

  if (['restaurant', 'fast_food', 'bakery', 'food_court'].includes(amenity)) return 'food';
  if (amenity === 'cafe') return 'cafe';
  if (amenity === 'fuel') return 'fuel';
  if (['convenience', 'supermarket'].includes(shop)) return 'convenience';
  if (amenity === 'cafe' && !shop) return 'cafe';
  return 'shop';
}
