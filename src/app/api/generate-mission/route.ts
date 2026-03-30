import { NextRequest, NextResponse } from 'next/server';

interface CheckpointInput {
  id: string;
  name: string;
  bmpType: string;
  lat: number;
  lng: number;
}

interface SiteInfoInput {
  centerLat: number;
  centerLng: number;
}

function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dlat = a.lat - b.lat;
  const dlng = a.lng - b.lng;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

// Nearest-neighbor TSP ordering
function orderCheckpoints(checkpoints: CheckpointInput[]): CheckpointInput[] {
  if (checkpoints.length <= 1) return [...checkpoints];

  const ordered: CheckpointInput[] = [];
  const remaining = [...checkpoints];

  // Start from the northernmost checkpoint
  remaining.sort((a, b) => b.lat - a.lat);
  ordered.push(remaining.shift()!);

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = distance(last, remaining[i]);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return ordered;
}

// Generate intermediate flight path points between waypoints
function generateFlightPath(
  orderedCheckpoints: CheckpointInput[],
  siteCenter: { lat: number; lng: number }
): [number, number][] {
  const path: [number, number][] = [];

  // Launch from site center
  path.push([siteCenter.lng, siteCenter.lat]);

  // Add path to first checkpoint with intermediates
  if (orderedCheckpoints.length > 0) {
    const first = orderedCheckpoints[0];
    const midLng = (siteCenter.lng + first.lng) / 2;
    const midLat = (siteCenter.lat + first.lat) / 2;
    path.push([midLng, midLat]);
    path.push([first.lng, first.lat]);
  }

  // Connect all checkpoints with intermediate points
  for (let i = 0; i < orderedCheckpoints.length - 1; i++) {
    const from = orderedCheckpoints[i];
    const to = orderedCheckpoints[i + 1];

    // Add 2-3 intermediate points with slight curve offsets
    const steps = 3;
    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      const lng = from.lng + (to.lng - from.lng) * t;
      const lat = from.lat + (to.lat - from.lat) * t;
      // Add a slight perpendicular offset for natural-looking paths
      const perpOffset = Math.sin(t * Math.PI) * 0.0002 * (i % 2 === 0 ? 1 : -1);
      path.push([lng + perpOffset, lat - perpOffset]);
    }

    path.push([to.lng, to.lat]);
  }

  // Return to launch site
  if (orderedCheckpoints.length > 0) {
    const last = orderedCheckpoints[orderedCheckpoints.length - 1];
    const midLng = (siteCenter.lng + last.lng) / 2;
    const midLat = (siteCenter.lat + last.lat) / 2;
    path.push([midLng, midLat]);
  }
  path.push([siteCenter.lng, siteCenter.lat]);

  return path;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkpoints, siteInfo }: { checkpoints: CheckpointInput[]; siteInfo: SiteInfoInput } = body;

    if (!checkpoints || !Array.isArray(checkpoints) || checkpoints.length === 0) {
      return NextResponse.json({ error: 'No checkpoints provided' }, { status: 400 });
    }

    const siteCenter = {
      lat: siteInfo?.centerLat || 36.7801,
      lng: siteInfo?.centerLng || -119.4161,
    };

    // Order checkpoints using nearest-neighbor
    const ordered = orderCheckpoints(checkpoints);

    // Generate flight path
    const flightPath = generateFlightPath(ordered, siteCenter);

    // Estimate flight time (~1.5 minutes per checkpoint + 3 min transit)
    const flightTimeMinutes = Math.round(checkpoints.length * 1.5 + 3);

    // Estimate battery (start 100%, ~2% per checkpoint)
    const batteryEnd = Math.max(10, 100 - checkpoints.length * 2.5);

    // Build arrival times (start time + ~90 seconds per waypoint)
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

    const mission = {
      id: `MISSION-${String(Date.now()).slice(-6)}`,
      name: `SWPPP Survey — ${siteInfo?.centerLat ? 'Uploaded Document' : 'Generated'}`,
      status: 'planned' as const,
      date: new Date().toISOString().split('T')[0],
      inspectionType: 'routine' as const,
      flightTimeMinutes,
      altitude: 120,
      batteryStart: 100,
      batteryEnd: Math.round(batteryEnd),
      weatherAtFlight: {
        temperature: 72,
        condition: 'clear' as const,
        windSpeedMph: 5,
        humidity: 45,
      },
      waypoints: ordered.map((cp, i) => ({
        number: i + 1,
        checkpointId: cp.id,
        lat: cp.lat,
        lng: cp.lng,
        captureStatus: 'pending' as const,
        arrivalTime: new Date(startTime.getTime() + i * 90 * 1000).toISOString(),
      })),
      flightPath,
    };

    return NextResponse.json(mission);
  } catch (error: unknown) {
    console.error('Mission generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Mission generation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
