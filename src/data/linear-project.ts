import { Project } from '@/types/project';

/**
 * Sample linear infrastructure project: a 5.2-mile natural gas pipeline
 * in the Central Valley, California.
 *
 * The corridor follows an existing utility easement from a compressor station
 * near Madera to a distribution point south of Fresno, roughly parallel to
 * SR-99. Construction involves open-trench installation with HDD (horizontal
 * directional drilling) at two waterway crossings.
 */
export const linearProject: Project = {
  id: 'valley-gas-pipeline',
  name: 'Central Valley Gas Pipeline — Phase 1',
  address: 'SR-99 Utility Corridor, Madera to Fresno, CA',
  permitNumber: 'CAS000047',
  wdid: '5B39C789012',
  riskLevel: 2,
  qsp: {
    name: 'Marcus Rivera',
    licenseNumber: 'QSP-6738',
    company: 'Valley Environmental Services',
    phone: '(559) 555-0287',
    email: 'mrivera@valleyenviro.com',
  },
  status: 'active',
  startDate: '2026-01-15',
  estimatedCompletion: '2027-06-01',
  acreage: 38.5,
  // Center of the corridor (midpoint)
  coordinates: { lat: 36.8450, lng: -119.7800 },
  // Bounding box enclosing the full corridor
  bounds: [
    [36.8050, -119.8100],
    [36.8850, -119.7500],
  ],
  projectType: 'linear',
  linearMileage: 5.2,
  corridor: {
    centerline: [
      // Northern terminus — compressor station near Madera
      [-119.7520, 36.8830],
      [-119.7545, 36.8790],
      [-119.7580, 36.8740],
      [-119.7620, 36.8690],
      [-119.7650, 36.8640],
      // Segment 1-2 boundary — Cottonwood Creek crossing
      [-119.7700, 36.8580],
      [-119.7730, 36.8530],
      [-119.7760, 36.8480],
      [-119.7790, 36.8430],
      // Segment 2-3 boundary — SR-145 crossing
      [-119.7820, 36.8380],
      [-119.7850, 36.8330],
      [-119.7870, 36.8280],
      [-119.7900, 36.8230],
      [-119.7930, 36.8180],
      // Segment 3-4 boundary — Dry Creek crossing
      [-119.7960, 36.8130],
      [-119.7990, 36.8080],
      [-119.8020, 36.8060],
      // Southern terminus — distribution point
      [-119.8050, 36.8050],
    ],
    corridorWidthFeet: 75,
    totalLength: 27456, // ~5.2 miles in feet
    linearUnit: 'feet',
  },
  segments: [
    {
      id: 'seg-north',
      name: 'North — Compressor to Cottonwood Creek',
      startStation: 0,
      endStation: 6864,
    },
    {
      id: 'seg-central',
      name: 'Central — Cottonwood Creek to SR-145',
      startStation: 6864,
      endStation: 13728,
    },
    {
      id: 'seg-south-upper',
      name: 'South Upper — SR-145 to Dry Creek',
      startStation: 13728,
      endStation: 20592,
    },
    {
      id: 'seg-south-lower',
      name: 'South Lower — Dry Creek to Distribution',
      startStation: 20592,
      endStation: 27456,
    },
  ],
};
