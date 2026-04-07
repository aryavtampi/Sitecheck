import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  fetchNoFlyZonesForProject,
  noFlyZoneToSnakeCase,
  transformNoFlyZone,
} from '@/lib/airspace-context';
import type { NoFlyZone } from '@/types/nofly-zone';

// GET /api/nofly-zones?projectId=...&active=true
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const activeParam = searchParams.get('active');
  const onlyActive = activeParam == null ? true : activeParam === 'true';

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId query parameter is required' },
      { status: 400 }
    );
  }

  const zones = await fetchNoFlyZonesForProject(projectId, { onlyActive });
  return NextResponse.json(zones);
}

// POST /api/nofly-zones
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<NoFlyZone>;
    if (!body.projectId || !body.name || !body.category || !body.polygon) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, name, category, polygon' },
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
      body.id = `nfz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    if (body.active === undefined) body.active = true;

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('nofly_zones')
      .insert(noFlyZoneToSnakeCase(body))
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create no-fly zone: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(transformNoFlyZone(data), { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Failed to create no-fly zone: ${
          err instanceof Error ? err.message : 'unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
