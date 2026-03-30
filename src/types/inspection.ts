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
}
