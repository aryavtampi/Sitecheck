import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { orderCheckpoints, generateFlightPath } from '@/lib/flight-path';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checkpoints,
      siteInfo,
      scope,
      endOfMissionAction,
      inspectionType,
      altitude: requestedAltitude,
      name: requestedName,
      notes,
      sourceDocumentPages,
    } = body as {
      checkpoints: CheckpointInput[];
      siteInfo: SiteInfoInput;
      scope?: string;
      endOfMissionAction?: string;
      inspectionType?: string;
      altitude?: number;
      name?: string;
      notes?: string;
      sourceDocumentPages?: number[];
    };

    if (!checkpoints || !Array.isArray(checkpoints) || checkpoints.length === 0) {
      return NextResponse.json({ error: 'No checkpoints provided' }, { status: 400 });
    }

    const missionAltitude = requestedAltitude || 120;

    const siteCenter = {
      lat: siteInfo?.centerLat || 36.7801,
      lng: siteInfo?.centerLng || -119.4161,
    };

    // Order checkpoints using nearest-neighbor (shared utility)
    const ordered = orderCheckpoints(checkpoints);

    // Generate flight path (shared utility)
    const flightPath = generateFlightPath(ordered, siteCenter);

    // Estimate flight time (~1.5 minutes per checkpoint + 3 min transit)
    const flightTimeMinutes = Math.round(checkpoints.length * 1.5 + 3);

    // Estimate battery (start 100%, ~2.5% per checkpoint)
    const batteryEnd = Math.max(10, 100 - checkpoints.length * 2.5);

    // Build arrival times (start time + ~90 seconds per waypoint)
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

    const mission = {
      id: `MISSION-${String(Date.now()).slice(-6)}`,
      name: requestedName || `SWPPP Survey — ${siteInfo?.centerLat ? 'Uploaded Document' : 'Generated'}`,
      status: 'planned' as const,
      date: new Date().toISOString().split('T')[0],
      inspectionType: (inspectionType || 'routine') as 'routine' | 'pre-storm' | 'post-storm' | 'qpe',
      flightTimeMinutes,
      altitude: missionAltitude,
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
      // Phase 16 fields
      scope: scope || 'full',
      endOfMissionAction: endOfMissionAction || 'return-home',
      notes: notes || '',
      sourceDocumentPages: sourceDocumentPages || null,
    };

    // Log route-auto-generated audit event
    try {
      const supabase = createServerClient();
      await supabase.from('activity_events').insert({
        id: `activity-${Date.now()}`,
        project_id: 'riverside-phase2',
        type: 'drone',
        title: 'Route Auto-Generated',
        description: `Flight route generated for "${mission.name}" with ${mission.waypoints.length} waypoints`,
        timestamp: new Date().toISOString(),
        severity: 'info',
        linked_entity_id: mission.id,
        linked_entity_type: 'mission',
        metadata: {
          action: 'route-auto-generated',
          missionId: mission.id,
          scope: mission.scope,
          waypointCount: mission.waypoints.length,
          altitude: mission.altitude,
          flightTimeMinutes: mission.flightTimeMinutes,
          inspectionType: mission.inspectionType,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (auditErr) {
      console.warn('Failed to log route-generated audit event:', auditErr);
    }

    return NextResponse.json(mission);
  } catch (error: unknown) {
    console.error('Mission generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Mission generation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
