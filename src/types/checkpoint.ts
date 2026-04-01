export type BMPCategory =
  | 'erosion-control'
  | 'sediment-control'
  | 'tracking-control'
  | 'wind-erosion'
  | 'materials-management'
  | 'non-storm-water';

export type CheckpointStatus = 'compliant' | 'deficient' | 'needs-review';
export type Priority = 'high' | 'medium' | 'low';
export type Zone = 'north' | 'south' | 'east' | 'west' | 'central';

export interface Checkpoint {
  id: string;
  name: string;
  bmpType: BMPCategory;
  status: CheckpointStatus;
  priority: Priority;
  zone: Zone;
  description: string;
  cgpSection: string;
  location: { lat: number; lng: number };
  lat?: number;
  lng?: number;
  lastInspectionDate: string;
  lastInspectionPhoto: string;
  previousPhoto?: string;
  installDate: string;
  swpppPage: number;
}
