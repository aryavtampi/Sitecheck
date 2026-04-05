/**
 * Linear (corridor) flight path generation.
 * Sorts checkpoints by station number and follows the centerline between them.
 * No return-to-launch loop — flies sequentially start to end.
 */

interface LinearCheckpoint {
  lat: number;
  lng: number;
  linearRef?: { station: number; offset: number; segmentId?: string };
}

/**
 * Find the closest point on a centerline to a given lat/lng.
 * Returns the index of the segment start point.
 */
function closestSegmentIndex(
  centerline: [number, number][],
  point: { lat: number; lng: number }
): number {
  let bestIdx = 0;
  let bestDist = Infinity;

  for (let i = 0; i < centerline.length; i++) {
    const [lng, lat] = centerline[i];
    const d = Math.sqrt((lat - point.lat) ** 2 + (lng - point.lng) ** 2);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }

  return bestIdx;
}

/**
 * Generate a linear flight path that follows the corridor centerline.
 *
 * - Sorts checkpoints by station number (ascending)
 * - Starts from the launch point, follows centerline to each checkpoint in order
 * - Inserts intermediate centerline points between checkpoint visits
 * - Ends at the last checkpoint (no return-to-launch)
 */
export function generateLinearFlightPath(
  checkpoints: LinearCheckpoint[],
  centerline: [number, number][],
  launchPoint: { lat: number; lng: number }
): [number, number][] {
  if (checkpoints.length === 0) {
    return [[launchPoint.lng, launchPoint.lat]];
  }

  // Sort checkpoints by station number (ascending along the corridor)
  const sorted = [...checkpoints].sort((a, b) => {
    const stationA = a.linearRef?.station ?? 0;
    const stationB = b.linearRef?.station ?? 0;
    return stationA - stationB;
  });

  const path: [number, number][] = [];

  // Start at launch point
  path.push([launchPoint.lng, launchPoint.lat]);

  // Find the closest centerline index to the launch point
  let currentCenterlineIdx = closestSegmentIndex(centerline, launchPoint);

  for (const cp of sorted) {
    // Find closest centerline index to this checkpoint
    const targetIdx = closestSegmentIndex(centerline, cp);

    // Insert intermediate centerline points between current position and target
    if (targetIdx > currentCenterlineIdx) {
      for (let i = currentCenterlineIdx + 1; i <= targetIdx; i++) {
        path.push(centerline[i]);
      }
    } else if (targetIdx < currentCenterlineIdx) {
      for (let i = currentCenterlineIdx - 1; i >= targetIdx; i--) {
        path.push(centerline[i]);
      }
    }

    // Visit the checkpoint itself
    path.push([cp.lng, cp.lat]);
    currentCenterlineIdx = targetIdx;
  }

  return path;
}

/**
 * Heuristic to detect if a set of points forms a linear layout.
 * Computes the ratio of the longest axis to the shortest axis of the bounding box.
 * A ratio > 3 suggests a linear arrangement.
 */
export function detectLinearLayout(points: { lat: number; lng: number }[]): boolean {
  if (points.length < 3) return false;

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);

  const longAxis = Math.max(latSpan, lngSpan);
  const shortAxis = Math.min(latSpan, lngSpan);

  if (shortAxis === 0) return true;
  return longAxis / shortAxis > 3;
}
