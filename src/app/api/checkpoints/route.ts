import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const DEFAULT_PROJECT_ID = 'riverside-phase2';

// Transform snake_case DB row to camelCase
function transformCheckpoint(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    bmpType: row.bmp_type,
    status: row.status,
    priority: row.priority,
    zone: row.zone,
    description: row.description,
    cgpSection: row.cgp_section,
    lat: row.lat,
    lng: row.lng,
    location: { lat: row.lat, lng: row.lng },
    lastInspectionDate: row.last_inspection_date,
    lastInspectionPhoto: row.last_inspection_photo,
    previousPhoto: row.previous_photo,
    installDate: row.install_date,
    swpppPage: row.swppp_page,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Transform camelCase request body to snake_case for DB
function toSnakeCase(data: Record<string, unknown>) {
  const mapping: Record<string, string> = {
    projectId: 'project_id',
    bmpType: 'bmp_type',
    cgpSection: 'cgp_section',
    lastInspectionDate: 'last_inspection_date',
    lastInspectionPhoto: 'last_inspection_photo',
    previousPhoto: 'previous_photo',
    installDate: 'install_date',
    swpppPage: 'swppp_page',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = mapping[key] || key;
    result[snakeKey] = value;
  }
  return result;
}

// Generate unique ID
function generateId() {
  return `cp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate activity event ID
function generateActivityId() {
  return `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('projectId') || DEFAULT_PROJECT_ID;
    const status = searchParams.get('status');
    const bmpType = searchParams.get('bmpType');
    const zone = searchParams.get('zone');
    const search = searchParams.get('search');

    let query = supabase
      .from('checkpoints')
      .select('*')
      .eq('project_id', projectId);

    if (status) {
      query = query.eq('status', status);
    }

    if (bmpType) {
      query = query.eq('bmp_type', bmpType);
    }

    if (zone) {
      query = query.eq('zone', zone);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch checkpoints: ${error.message}`);
    }

    const checkpoints = (data || []).map(transformCheckpoint);

    return NextResponse.json(checkpoints);
  } catch (error: unknown) {
    console.error('Checkpoints GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch checkpoints';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    // Ensure required fields
    const checkpointId = body.id || generateId();
    const projectId = body.projectId || DEFAULT_PROJECT_ID;

    // Transform to snake_case for DB
    const dbData = toSnakeCase({
      ...body,
      id: checkpointId,
      projectId,
    });

    // Insert checkpoint
    const { data, error } = await supabase
      .from('checkpoints')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create checkpoint: ${error.message}`);
    }

    // Create activity event
    const activityEvent = {
      id: generateActivityId(),
      project_id: projectId,
      type: 'inspection',
      title: 'Checkpoint Added',
      description: `Checkpoint "${body.name || data.name}" added`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      linked_entity_id: checkpointId,
      linked_entity_type: 'checkpoint',
    };

    const { error: activityError } = await supabase
      .from('activity_events')
      .insert(activityEvent);

    if (activityError) {
      console.error('Failed to create activity event:', activityError.message);
      // Don't fail the request, just log it
    }

    const checkpoint = transformCheckpoint(data);

    return NextResponse.json(checkpoint, { status: 201 });
  } catch (error: unknown) {
    console.error('Checkpoints POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkpoint';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
