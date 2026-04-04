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

// --- Mission Control types ---

// Live telemetry streamed from drone hardware
export interface DroneTelemetry {
  lat: number;
  lng: number;
  altitudeFeet: number;
  speedMph: number;
  headingDeg: number;           // 0-360, 0 = north
  batteryPercent: number;
  signalStrengthPercent: number;
  gpsSatellites: number;
  timestamp: string;            // ISO 8601
}

// Manual override actions available during manual control mode
export type ManualOverrideAction =
  | 'reposition'
  | 'hover-longer'
  | 'retake-photo'
  | 'adjust-camera-angle'
  | 'resume-mission';

// QSP review decision for a checkpoint's AI finding
export type QSPReviewDecision = 'accept' | 'override' | 'pending';

export interface QSPReviewEntry {
  checkpointId: string;
  waypointNumber: number;
  aiAnalysis: AIAnalysis;
  decision: QSPReviewDecision;
  overrideStatus?: CheckpointStatus;   // only when decision === 'override'
  overrideNotes?: string;
  reviewedAt?: string;                 // ISO 8601
}

// Report readiness derived from checkpoint review state
export type ReportReadiness = 'not-ready' | 'partially-reviewed' | 'ready';

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
  // Mission Control additions
  photos?: string[];              // multiple captures per waypoint
  qspReview?: QSPReviewEntry;     // QSP review data
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
  // Mission Control additions
  reportReadiness?: ReportReadiness;
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
  // Mission Control: telemetry subscription
  subscribeTelemetry(
    missionId: string,
    flightPath: [number, number][],
    mission: { altitude: number; batteryStart: number; batteryEnd: number },
    onUpdate: (telemetry: DroneTelemetry) => void
  ): () => void; // returns unsubscribe function
  // Mission Control: manual override actions
  reposition(missionId: string, offsetLat: number, offsetLng: number): Promise<void>;
  hoverLonger(missionId: string, additionalSeconds: number): Promise<void>;
  retakePhoto(missionId: string, waypointNumber: number): Promise<string | null>;
  adjustCameraAngle(missionId: string, pitchDeg: number): Promise<void>;
}
