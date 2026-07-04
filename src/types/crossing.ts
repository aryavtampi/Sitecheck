/**
 * Crossing types for linear infrastructure projects.
 *
 * A "crossing" is a specific point along a corridor where the infrastructure
 * intersects another linear feature (waterway, road, utility, etc.) and
 * typically requires special permits, construction methods (HDD, bore, etc.),
 * and additional inspection.
 */

export type CrossingType =
  | 'stream'
  | 'road'
  | 'utility'
  | 'railroad'
  | 'wetland';

export type CrossingStatus =
  | 'pending'
  | 'approved'
  | 'in-progress'
  | 'completed'
  | 'flagged';

export interface Crossing {
  id: string;
  projectId: string;
  /** Optional segment this crossing belongs to */
  segmentId?: string;
  crossingType: CrossingType;
  name: string;
  /** Station number along the corridor centerline (in project linear units) */
  stationNumber?: number;
  /** Pre-formatted station label, e.g. "STA 15+50" */
  stationLabel?: string;
  /** GeoJSON-style point: [lng, lat] */
  location?: [number, number];
  description?: string;
  /** List of permit type strings required for this crossing (e.g. ['404', '401']) */
  permitsRequired: string[];
  status: CrossingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const CROSSING_TYPE_LABELS: Record<CrossingType, string> = {
  stream: 'Stream / Waterway',
  road: 'Road / Highway',
  utility: 'Existing Utility',
  railroad: 'Railroad',
  wetland: 'Wetland',
};

export const CROSSING_TYPE_COLORS: Record<CrossingType, string> = {
  stream: '#0EA5E9',     // sky-500
  road: '#F59E0B',       // amber-500
  utility: '#A855F7',    // purple-500
  railroad: '#EF4444',   // red-500
  wetland: '#10B981',    // emerald-500
};

export const CROSSING_TYPE_ICONS: Record<CrossingType, string> = {
  stream: '〰️',
  road: '🛣️',
  utility: '⚡',
  railroad: '🚂',
  wetland: '🌿',
};

export const CROSSING_STATUS_LABELS: Record<CrossingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  'in-progress': 'In progress',
  completed: 'Completed',
  flagged: 'Flagged',
};

export const CROSSING_STATUS_COLORS: Record<
  CrossingStatus,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
  approved: {
    bg: 'bg-accent',
    text: 'text-accent-foreground',
    border: 'border-primary/20',
  },
  'in-progress': {
    bg: 'bg-status-warning-bg',
    text: 'text-status-warning',
    border: 'border-status-warning/20',
  },
  completed: {
    bg: 'bg-status-compliant-bg',
    text: 'text-status-compliant',
    border: 'border-status-compliant/20',
  },
  flagged: {
    bg: 'bg-status-deficient-bg',
    text: 'text-status-deficient',
    border: 'border-status-deficient/20',
  },
};
