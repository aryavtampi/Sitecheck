import { CheckpointStatus } from './checkpoint';
import { WeatherSnapshot } from './weather';

export type InspectionType = 'routine' | 'pre-storm' | 'post-storm' | 'qpe';

export interface AIAnalysis {
  checkpointId: string;
  summary: string;
  status: CheckpointStatus;
  confidence: number;
  details: string[];
  cgpReference: string;
  recommendations?: string[];
}

export interface Waypoint {
  number: number;
  checkpointId: string;
  lat: number;
  lng: number;
  captureStatus: 'captured' | 'missed' | 'pending';
  arrivalTime: string;
  photo?: string;
  aiAssessment?: AIAnalysis;
}

export interface DroneMission {
  id: string;
  name: string;
  status: 'planned' | 'in-progress' | 'completed';
  date: string;
  inspectionType: InspectionType;
  flightTimeMinutes: number;
  altitude: number;
  batteryStart: number;
  batteryEnd: number;
  weatherAtFlight: WeatherSnapshot;
  waypoints: Waypoint[];
  flightPath: [number, number][];
}
