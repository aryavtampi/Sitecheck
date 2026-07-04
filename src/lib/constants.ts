import { BMPCategory } from '@/types/checkpoint';

export const BMP_CATEGORY_LABELS: Record<BMPCategory, string> = {
  'erosion-control': 'Erosion control',
  'sediment-control': 'Sediment control',
  'tracking-control': 'Tracking control',
  'wind-erosion': 'Wind erosion',
  'materials-management': 'Materials management',
  'non-storm-water': 'Non-storm water',
  // Linear infrastructure BMPs
  'trench-plug': 'Trench plug',
  'slope-breaker': 'Slope breaker',
  'water-bar': 'Water bar',
  'hdd-containment': 'HDD containment',
  'stream-crossing-erosion': 'Stream crossing erosion',
};

// Categorical identity colors for BMP types. Dual-purpose: map marker fills
// on satellite imagery and text/chip identity colors in lists, so hues are
// 600/700-weight — dark enough to read on white, saturated enough on imagery.
export const BMP_CATEGORY_COLORS: Record<BMPCategory, string> = {
  'erosion-control': '#2563EB',
  'sediment-control': '#A16207',
  'tracking-control': '#7C3AED',
  'wind-erosion': '#0E7490',
  'materials-management': '#BE185D',
  'non-storm-water': '#047857',
  // Linear infrastructure BMPs
  'trench-plug': '#92400E',
  'slope-breaker': '#0F766E',
  'water-bar': '#0369A1',
  'hdd-containment': '#C2410C',
  'stream-crossing-erosion': '#9333EA',
};

// High-visibility marker fills for satellite imagery (mapbox layer paint).
export const STATUS_COLORS = {
  compliant: '#22C55E',
  deficient: '#EF4444',
  'needs-review': '#A78BFA',
} as const;

export const STATUS_LABELS = {
  compliant: 'Compliant',
  deficient: 'Deficient',
  'needs-review': 'Needs review',
} as const;

export const INSPECTION_TYPE_LABELS = {
  routine: 'Routine',
  'pre-storm': 'Pre-storm',
  'post-storm': 'Post-storm',
  qpe: 'QPE response',
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

// --- Phase 16: Drone mission constants ---

import type {
  MissionScope,
  MissionStatus,
  EndOfMissionAction,
  CaptureMode,
  WaypointOutcome,
  ManualOverrideAction,
  QSPReviewDecision,
  ReportReadiness,
} from '@/types/drone';

export const MISSION_SCOPE_LABELS: Record<MissionScope, string> = {
  full: 'Full project',
  'selected-bmps': 'Selected BMPs',
  priority: 'Priority only',
  deficient: 'Deficient only',
  reinspection: 'Reinspection',
  'ad-hoc': 'Ad hoc',
  segment: 'Corridor segment',
};

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In progress',
  paused: 'Paused',
  completed: 'Completed',
  aborted: 'Aborted',
  'returning-home': 'Returning home',
};

export const MISSION_STATUS_COLORS: Record<MissionStatus, { bg: string; text: string; border: string }> = {
  planned: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  'in-progress': { bg: 'bg-accent', text: 'text-accent-foreground', border: 'border-primary/20' },
  paused: { bg: 'bg-status-warning-bg', text: 'text-status-warning', border: 'border-status-warning/20' },
  completed: { bg: 'bg-status-compliant-bg', text: 'text-status-compliant', border: 'border-status-compliant/20' },
  aborted: { bg: 'bg-status-deficient-bg', text: 'text-status-deficient', border: 'border-status-deficient/20' },
  'returning-home': { bg: 'bg-status-review-bg', text: 'text-status-review', border: 'border-status-review/20' },
};

export const END_OF_MISSION_LABELS: Record<EndOfMissionAction, string> = {
  'return-home': 'Return to home',
  'hover-final': 'Hover at final waypoint',
  'land-safe-point': 'Land at safe point',
  'wait-for-input': 'Wait for operator input',
};

export const CAPTURE_MODE_LABELS: Record<CaptureMode, string> = {
  auto: 'Auto capture',
  'photo-only': 'Photo only',
  'video-pass': 'Video pass',
  'manual-review': 'Manual review',
  'hover-inspect': 'Hover & inspect',
};

export const WAYPOINT_OUTCOME_LABELS: Record<WaypointOutcome, string> = {
  pending: 'Pending',
  captured: 'Captured',
  missed: 'Missed',
  skipped: 'Skipped',
  compliant: 'Compliant',
  deficient: 'Deficient',
  'needs-maintenance': 'Needs maintenance',
  'not-visible': 'Not visible',
  blocked: 'Blocked',
  unsafe: 'Unsafe',
  'ground-follow-up': 'Ground follow-up',
};

export const WAYPOINT_OUTCOME_COLORS: Record<WaypointOutcome, string> = {
  pending: 'text-muted-foreground bg-muted',
  captured: 'text-accent-foreground bg-accent',
  missed: 'text-status-warning bg-status-warning-bg',
  skipped: 'text-muted-foreground bg-muted',
  compliant: 'text-status-compliant bg-status-compliant-bg',
  deficient: 'text-status-deficient bg-status-deficient-bg',
  'needs-maintenance': 'text-status-warning bg-status-warning-bg',
  'not-visible': 'text-status-review bg-status-review-bg',
  blocked: 'text-status-deficient bg-status-deficient-bg',
  unsafe: 'text-status-deficient bg-status-deficient-bg',
  'ground-follow-up': 'text-status-warning bg-status-warning-bg',
};

// --- Mission Control constants ---

export const MANUAL_OVERRIDE_ACTION_LABELS: Record<ManualOverrideAction, string> = {
  'reposition': 'Reposition',
  'hover-longer': 'Hover longer',
  'retake-photo': 'Retake photo',
  'adjust-camera-angle': 'Adjust camera',
  'resume-mission': 'Resume mission',
};

export const REPORT_READINESS_LABELS: Record<ReportReadiness, string> = {
  'not-ready': 'Not ready',
  'partially-reviewed': 'Partially reviewed',
  'ready': 'Ready for report',
};

export const REPORT_READINESS_COLORS: Record<ReportReadiness, { bg: string; text: string; border: string }> = {
  'not-ready': { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  'partially-reviewed': { bg: 'bg-status-warning-bg', text: 'text-status-warning', border: 'border-status-warning/20' },
  'ready': { bg: 'bg-status-compliant-bg', text: 'text-status-compliant', border: 'border-status-compliant/20' },
};

export const QSP_DECISION_LABELS: Record<QSPReviewDecision, string> = {
  'accept': 'Accept',
  'override': 'Override',
  'pending': 'Pending',
};

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

export const SITE_CENTER = {
  latitude: 36.7801,
  longitude: -119.4161,
  zoom: 16,
} as const;
