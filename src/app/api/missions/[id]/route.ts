import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Transform snake_case database row to camelCase
function transformMissionToClient(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    status: row.status,
    date: row.date,
    inspectionType: row.inspection_type,
    flightTimeMinutes: row.flight_time_minutes,
    altitude: row.altitude,
    batteryStart: row.battery_start,
    batteryEnd: row.battery_end,
    weatherTemperature: row.weather_temperature,
    weatherCondition: row.weather_condition,
    weatherWindSpeedMph: row.weather_wind_speed_mph,
    weatherHumidity: row.weather_humidity,
    flightPath: row.flight_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Transform snake_case waypoint to camelCase
function transformWaypointToClient(row: Record<string, unknown>) {
  return {
    id: row.id,
    missionId: row.mission_id,
    checkpointId: row.checkpoint_id,
    number: row.number,
    lat: row.lat,
    lng: row.lng,
    captureStatus: row.capture_status,
    arrivalTime: row.arrival_time,
    photo: row.photo,
    createdAt: row.created_at,
  };
}

// Transform camelCase client data to snake_case for database updates
function transformMissionUpdateToDb(data: Record<string, unknown>) {
  const dbData: Record<string, unknown> = {};

  if (data.name !== undefined) dbData.name = data.name;
  if (data.status !== undefined) dbData.status = data.status;
  if (data.date !== undefined) dbData.date = data.date;
  if (data.inspectionType !== undefined) dbData.inspection_type = data.inspectionType;
  if (data.flightTimeMinutes !== undefined) dbData.flight_time_minutes = data.flightTimeMinutes;
  if (data.altitude !== undefined) dbData.altitude = data.altitude;
  if (data.batteryStart !== undefined) dbData.battery_start = data.batteryStart;
  if (data.batteryEnd !== undefined) dbData.battery_end = data.batteryEnd;
  if (data.weatherTemperature !== undefined) dbData.weather_temperature = data.weatherTemperature;
  if (data.weatherCondition !== undefined) dbData.weather_condition = data.weatherCondition;
  if (data.weatherWindSpeedMph !== undefined) dbData.weather_wind_speed_mph = data.weatherWindSpeedMph;
  if (data.weatherHumidity !== undefined) dbData.weather_humidity = data.weatherHumidity;
  if (data.flightPath !== undefined) dbData.flight_path = data.flightPath;

  // Always update updated_at timestamp
  dbData.updated_at = new Date().toISOString();

  return dbData;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/missions/[id] - Fetch mission by id with waypoints
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    // Fetch mission
    const { data: mission, error: missionError } = await supabase
      .from('drone_missions')
      .select('*')
      .eq('id', id)
      .single();

    if (missionError) {
      if (missionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Mission not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching mission:', missionError);
      return NextResponse.json(
        { error: 'Failed to fetch mission' },
        { status: 500 }
      );
    }

    // Fetch waypoints ordered by number
    const { data: waypoints, error: waypointsError } = await supabase
      .from('waypoints')
      .select('*')
      .eq('mission_id', id)
      .order('number', { ascending: true });

    if (waypointsError) {
      console.error('Error fetching waypoints:', waypointsError);
      // Continue without waypoints rather than failing
    }

    const transformedMission = transformMissionToClient(mission);
    const transformedWaypoints = (waypoints || []).map(transformWaypointToClient);

    return NextResponse.json({
      ...transformedMission,
      waypoints: transformedWaypoints,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/missions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/missions/[id] - Update mission fields
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();
    const body = await request.json();

    // Transform to database format
    const updateData = transformMissionUpdateToDb(body);

    if (Object.keys(updateData).length === 1) {
      // Only updated_at was set, no real updates
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: mission, error } = await supabase
      .from('drone_missions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Mission not found' },
          { status: 404 }
        );
      }
      console.error('Error updating mission:', error);
      return NextResponse.json(
        { error: 'Failed to update mission' },
        { status: 500 }
      );
    }

    // Create activity event for status changes
    if (body.status) {
      const activityEvent = {
        id: `activity-${Date.now()}`,
        project_id: mission.project_id,
        type: 'drone',
        title: 'Mission Status Updated',
        description: `Mission "${mission.name}" status changed to ${body.status}`,
        timestamp: new Date().toISOString(),
        severity: body.status === 'completed' ? 'info' : 'warning',
        linked_entity_id: id,
        linked_entity_type: 'mission',
      };

      const { error: activityError } = await supabase
        .from('activity_events')
        .insert(activityEvent);

      if (activityError) {
        console.error('Error creating activity event:', activityError);
      }
    }

    return NextResponse.json(transformMissionToClient(mission));
  } catch (error) {
    console.error('Unexpected error in PUT /api/missions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
