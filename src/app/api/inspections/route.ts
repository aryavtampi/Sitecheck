import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveProjectId, DEFAULT_PROJECT_ID } from '@/lib/project-context';


// Transform snake_case DB row to camelCase
function transformInspection(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.project_id,
    date: row.date,
    type: row.type,
    inspector: row.inspector,
    weather: {
      temperature: row.weather_temperature,
      condition: row.weather_condition,
      windSpeedMph: row.weather_wind_speed_mph,
      humidity: row.weather_humidity,
    },
    overallCompliance: row.overall_compliance,
    missionId: row.mission_id,
    createdAt: row.created_at,
  };
}

function transformFinding(row: Record<string, unknown>) {
  return {
    id: row.id,
    inspectionId: row.inspection_id,
    checkpointId: row.checkpoint_id,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// Transform camelCase request body to snake_case for DB
function inspectionToSnakeCase(data: Record<string, unknown>) {
  const result: Record<string, unknown> = {
    id: data.id,
    project_id: data.projectId,
    date: data.date,
    type: data.type,
    inspector: data.inspector,
    weather_temperature: (data.weather as Record<string, unknown>)?.temperature ?? data.weatherTemperature ?? 0,
    weather_condition: (data.weather as Record<string, unknown>)?.condition ?? data.weatherCondition ?? 'clear',
    weather_wind_speed_mph: (data.weather as Record<string, unknown>)?.windSpeedMph ?? data.weatherWindSpeedMph ?? 0,
    weather_humidity: (data.weather as Record<string, unknown>)?.humidity ?? data.weatherHumidity ?? 0,
    overall_compliance: data.overallCompliance,
    mission_id: data.missionId,
  };
  return result;
}

function findingToSnakeCase(data: Record<string, unknown>) {
  return {
    inspection_id: data.inspectionId,
    checkpoint_id: data.checkpointId,
    status: data.status,
    notes: data.notes || '',
  };
}

// Generate unique ID
function generateId() {
  return `insp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch inspections: ${error.message}`);
    }

    const inspections = (data || []).map(transformInspection);

    return NextResponse.json(inspections);
  } catch (error: unknown) {
    console.error('Inspections GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch inspections';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    // Ensure required fields
    const inspectionId = body.id || generateId();
    const projectId = body.projectId || DEFAULT_PROJECT_ID;

    // Transform to snake_case for DB
    const dbInspection = inspectionToSnakeCase({
      ...body,
      id: inspectionId,
      projectId,
    });

    // Insert inspection
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .insert(dbInspection)
      .select()
      .single();

    if (inspectionError) {
      throw new Error(`Failed to create inspection: ${inspectionError.message}`);
    }

    // Insert findings if provided
    let createdFindings: Record<string, unknown>[] = [];
    if (body.findings && Array.isArray(body.findings) && body.findings.length > 0) {
      const dbFindings = body.findings.map((finding: Record<string, unknown>) =>
        findingToSnakeCase({
          ...finding,
          inspectionId,
        })
      );

      const { data: findings, error: findingsError } = await supabase
        .from('inspection_findings')
        .insert(dbFindings)
        .select();

      if (findingsError) {
        console.error('Failed to create findings:', findingsError.message);
        // Don't fail the request, inspection was created
      } else {
        createdFindings = findings || [];
      }
    }

    // Create activity event
    const inspectionTypes: Record<string, string> = {
      'routine': 'Routine',
      'pre-storm': 'Pre-Storm',
      'post-storm': 'Post-Storm',
      'qpe': 'QPE',
    };
    const typeLabel = inspectionTypes[body.type] || body.type;

    const activityEvent = {
      id: generateActivityId(),
      project_id: projectId,
      type: 'inspection',
      title: `${typeLabel} Inspection Completed`,
      description: `${typeLabel} inspection completed by ${body.inspector}. Overall compliance: ${body.overallCompliance}%`,
      timestamp: new Date().toISOString(),
      severity: body.overallCompliance >= 80 ? 'info' : 'warning',
      linked_entity_id: inspectionId,
      linked_entity_type: 'inspection',
    };

    const { error: activityError } = await supabase
      .from('activity_events')
      .insert(activityEvent);

    if (activityError) {
      console.error('Failed to create activity event:', activityError.message);
    }

    const result = {
      ...transformInspection(inspection),
      findings: createdFindings.map(transformFinding),
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error('Inspections POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create inspection';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
