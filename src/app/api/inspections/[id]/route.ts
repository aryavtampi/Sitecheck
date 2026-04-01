import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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
  const checkpoint = row.checkpoints as Record<string, unknown> | null;
  return {
    id: row.id,
    inspectionId: row.inspection_id,
    checkpointId: row.checkpoint_id,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    checkpoint: checkpoint ? {
      id: checkpoint.id,
      name: checkpoint.name,
      bmpType: checkpoint.bmp_type,
      zone: checkpoint.zone,
      lat: checkpoint.lat,
      lng: checkpoint.lng,
    } : undefined,
  };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    // Fetch inspection
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .single();

    if (inspectionError) {
      if (inspectionError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
      }
      throw new Error(`Failed to fetch inspection: ${inspectionError.message}`);
    }

    // Fetch findings with checkpoint info
    const { data: findings, error: findingsError } = await supabase
      .from('inspection_findings')
      .select(`
        *,
        checkpoints (
          id,
          name,
          bmp_type,
          zone,
          lat,
          lng
        )
      `)
      .eq('inspection_id', id)
      .order('created_at', { ascending: true });

    if (findingsError) {
      console.error('Failed to fetch findings:', findingsError.message);
    }

    const result = {
      ...transformInspection(inspection),
      findings: (findings || []).map(transformFinding),
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Inspection GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch inspection';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
