import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { project as riversideProject } from '@/data/project';
import { linearProject } from '@/data/linear-project';

function transformProject(row: Record<string, unknown>) {
  const project: Record<string, unknown> = {
    id: row.id,
    name: row.name,
    address: row.address,
    permitNumber: row.permit_number,
    wdid: row.wdid,
    riskLevel: row.risk_level,
    qsp: {
      name: row.qsp_name,
      licenseNumber: row.qsp_license_number,
      company: row.qsp_company,
      phone: row.qsp_phone,
      email: row.qsp_email,
    },
    status: row.status,
    startDate: row.start_date,
    estimatedCompletion: row.estimated_completion,
    acreage: row.acreage,
    coordinates: { lat: row.center_lat, lng: row.center_lng },
    bounds: [
      [row.bounds_sw_lat, row.bounds_sw_lng],
      [row.bounds_ne_lat, row.bounds_ne_lng],
    ],
    projectType: row.project_type || 'bounded-site',
  };

  if (row.corridor_centerline) {
    project.corridor = {
      centerline: row.corridor_centerline,
      corridorWidthFeet: row.corridor_width_feet,
      totalLength: row.corridor_total_length,
      linearUnit: row.corridor_linear_unit || 'feet',
    };
  }

  if (row.linear_mileage) {
    project.linearMileage = row.linear_mileage;
  }

  return project;
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    if (data && data.length > 0) {
      return NextResponse.json(data.map(transformProject));
    }

    // Fall back to static data if DB is empty
    return NextResponse.json([riversideProject, linearProject]);
  } catch {
    // Fall back to static data on error
    return NextResponse.json([riversideProject, linearProject]);
  }
}
