import { CheckpointStatus } from './checkpoint';
import { WeatherSnapshot } from './weather';
import type { InspectionType } from './drone';

export interface InspectionFinding {
  checkpointId: string;
  status: CheckpointStatus;
  notes: string;
}

export interface Inspection {
  id: string;
  date: string;
  type: InspectionType;
  inspector: string;
  weather: WeatherSnapshot;
  findings: InspectionFinding[];
  overallCompliance: number;
  missionId?: string;
  /** For linear projects: which segment this inspection covered (if any) */
  segmentId?: string;
  /** For linear projects: station range start in feet */
  stationRangeStart?: number;
  /** For linear projects: station range end in feet */
  stationRangeEnd?: number;
}
