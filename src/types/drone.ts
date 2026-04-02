import { CheckpointStatus } from './checkpoint';
import { WeatherSnapshot } from './weather';

export type InspectionType = 'routine' | 'pre-storm' | 'post-storm' | 'qpe';

// --- New Phase 16 types ---

export type MissionScope =
  | 'full'
  | 'selected-bmps'
  | 'priority'
  | 'deficient'
  | 'reinspection'
  | 'ad-hoc';

export type MissionStatus =
  | 'planned'
  | 'in-progress'
  | 'paused'
  | 'completed'
  | 'aborted'
  | 'returning-home';

export type EndOfMissionAction =
  | 'return-home'
  | 'hover-final'
  | 'land-safe-point'
  | 'wait-for-input';

export type CaptureMode =
  | 'auto'
  | 'photo-only'
  | 'video-pass'
  | 'manual-review'
  | 'hover-inspect';

export type WaypointOutcome =
  | 'pending'
  | 'captured'
  | 'missed'
  | 'skipped'
  | 'compliant'
  | 'deficient'
  | 'needs-maintenance'
  | 'not-visible'
  | 'blocked'
  | 'unsafe'
  | 'ground-follow-up';

export type FlightControlAction =
  | 'start'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'return-home'
  | 'emergency-hold'
  | 'manual-takeover'
  | 'resume-mission';

// --- Existing types (unchanged) ---

export interface AIAnalysis {
  checkpointId: string;
  summary: string;
  status: CheckpointStatus;
  confidence: number;
  details: string[];
  cgpReference: string;
  recommendations?: string[];
}

// Extended Waypoint — all new fields are optional for backwards compatibility
export interface Waypoint {
  number: number;
  checkpointId: string;
  lat: number;
  lng: number;
  captureStatus: WaypointOutcome;
  arrivalTime: string;
  photo?: string;
  aiAssessment?: AIAnalysis;
  // Phase 16 additions
  enabled?: boolean;
  altitudeOverride?: number;
  hoverTimeSeconds?: number;
  captureMode?: CaptureMode;
  operatorNotes?: string;
  sortOrder?: number;
}

// Extended DroneMission — all new fields are optional for backwards compatibility
export interface DroneMission {
  id: string;
  name: string;
  status: MissionStatus;
  date: string;
  inspectionType: InspectionType;
  flightTimeMinutes: number;
  altitude: number;
  batteryStart: number;
  batteryEnd: number;
  weatherAtFlight: WeatherSnapshot;
  waypoints: Waypoint[];
  flightPath: [number, number][];
  // Phase 16 additions
  scope?: MissionScope;
  endOfMissionAction?: EndOfMissionAction;
  editedFlightPath?: [number, number][] | null;
  lastCompletedWaypoint?: number | null;
  resumeValid?: boolean;
  sourceDocumentPages?: number[] | null;
  manualOverrideActive?: boolean;
  notes?: string;
}

// --- Drone hardware abstraction ---

export interface DroneCapabilities {
  supportsVideo: boolean;
  supportsBurst: boolean;
  supportsGimbal: boolean;
  supportsZoom: boolean;
  supportsManualControl: boolean;
  maxAltitude: number;
  minAltitude: number;
}

export interface DroneProvider {
  startMission(missionId: string): Promise<void>;
  pauseMission(missionId: string): Promise<void>;
  resumeMission(missionId: string): Promise<void>;
  stopMission(missionId: string): Promise<void>;
  returnHome(missionId: string): Promise<void>;
  emergencyHold(missionId: string): Promise<void>;
  manualTakeover(missionId: string): Promise<void>;
  resumeFromManual(missionId: string): Promise<void>;
  captureImage(missionId: string, waypointNumber: number): Promise<string | null>;
  isConnected(): boolean;
  getCapabilities(): DroneCapabilities;
}
