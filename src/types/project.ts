export interface QSP {
  name: string;
  licenseNumber: string;
  company: string;
  phone: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  permitNumber: string;
  wdid: string;
  riskLevel: 1 | 2 | 3;
  qsp: QSP;
  status: 'active' | 'inactive';
  startDate: string;
  estimatedCompletion: string;
  acreage: number;
  coordinates: { lat: number; lng: number };
  bounds: [[number, number], [number, number]];
}
