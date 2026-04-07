import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  fetchGeofencesForProject,
  geofenceToSnakeCase,
  transformGeofence,
} from '@/lib/airspace-context';
import type { Geofence } from '@/types/geofence';

// GET /api/geofences?projectId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId query parameter is required' },
      { status: 400 }
    );
  }

  const geofences = await fetchGeofencesForProject(projectId);
  return NextResponse.json(geofences);
}

// POST /api/geofences
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Geofence>;
    if (!body.projectId || !body.name || !body.polygon) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, name, polygon' },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.polygon) || body.polygon.length < 3) {
      return NextResponse.json(
        { error: 'polygon must be an array of at least 3 [lng,lat] points' },
        { status: 400 }
      );
    }
    if (!body.id) {
      body.id = `geofence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    if (!body.source) body.source = 'manual';

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('geofences')
      .insert(geofenceToSnakeCase(body))
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create geofence: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(transformGeofence(data), { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Failed to create geofence: ${
          err instanceof Error ? err.message : 'unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
