import { BMPCategory } from '@/types/checkpoint';

export const BMP_CATEGORY_LABELS: Record<BMPCategory, string> = {
  'erosion-control': 'Erosion Control',
  'sediment-control': 'Sediment Control',
  'tracking-control': 'Tracking Control',
  'wind-erosion': 'Wind Erosion',
  'materials-management': 'Materials Management',
  'non-storm-water': 'Non-Storm Water',
};

export const BMP_CATEGORY_COLORS: Record<BMPCategory, string> = {
  'erosion-control': '#3B82F6',
  'sediment-control': '#F59E0B',
  'tracking-control': '#8B5CF6',
  'wind-erosion': '#06B6D4',
  'materials-management': '#EC4899',
  'non-storm-water': '#10B981',
};

export const STATUS_COLORS = {
  compliant: '#22C55E',
  deficient: '#EF4444',
  'needs-review': '#8B5CF6',
} as const;

export const STATUS_LABELS = {
  compliant: 'Compliant',
  deficient: 'Deficient',
  'needs-review': 'Needs Review',
} as const;

export const INSPECTION_TYPE_LABELS = {
  routine: 'Routine',
  'pre-storm': 'Pre-Storm',
  'post-storm': 'Post-Storm',
  qpe: 'QPE Response',
} as const;

export const WEATHER_ICONS: Record<string, string> = {
  clear: '☀️',
  'partly-cloudy': '⛅',
  cloudy: '☁️',
  'light-rain': '🌦️',
  rain: '🌧️',
  'heavy-rain': '⛈️',
  thunderstorm: '🌩️',
  fog: '🌫️',
};

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

export const SITE_CENTER = {
  latitude: 36.7801,
  longitude: -119.4161,
  zoom: 16,
} as const;
