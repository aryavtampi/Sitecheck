import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const DEFAULT_PROJECT_ID = 'riverside-phase2';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || DEFAULT_PROJECT_ID;

    // Query checkpoints: count total and count by status
    const { data: checkpoints, error: checkpointsError } = await supabase
      .from('checkpoints')
      .select('id, status')
      .eq('project_id', projectId);

    if (checkpointsError) {
      throw new Error(`Failed to fetch checkpoints: ${checkpointsError.message}`);
    }

    const totalCheckpoints = checkpoints?.length || 0;
    const compliantCount = checkpoints?.filter((cp) => cp.status === 'compliant').length || 0;
    const deficientCount = checkpoints?.filter((cp) => cp.status === 'deficient').length || 0;
    const needsReviewCount = checkpoints?.filter((cp) => cp.status === 'needs-review').length || 0;
    const complianceRate = totalCheckpoints > 0
      ? Math.round((compliantCount / totalCheckpoints) * 100)
      : 0;

    // Query deficiencies: count where status != 'resolved'
    const { data: deficiencies, error: deficienciesError } = await supabase
      .from('deficiencies')
      .select('id')
      .eq('project_id', projectId)
      .neq('status', 'resolved');

    if (deficienciesError) {
      throw new Error(`Failed to fetch deficiencies: ${deficienciesError.message}`);
    }

    const activeDeficiencies = deficiencies?.length || 0;

    // Query inspections: get most recent inspection
    const { data: inspections, error: inspectionsError } = await supabase
      .from('inspections')
      .select('id, date, type')
      .eq('project_id', projectId)
      .order('date', { ascending: false })
      .limit(1);

    if (inspectionsError) {
      throw new Error(`Failed to fetch inspections: ${inspectionsError.message}`);
    }

    let daysSinceInspection: number | null = null;
    let lastInspectionType: string | null = null;
    let lastInspectionDate: string | null = null;

    if (inspections && inspections.length > 0) {
      const lastInspection = inspections[0];
      lastInspectionDate = lastInspection.date;
      lastInspectionType = lastInspection.type;

      const inspectionDate = new Date(lastInspection.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - inspectionDate.getTime());
      daysSinceInspection = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      totalCheckpoints,
      complianceRate,
      daysSinceInspection,
      lastInspectionType,
      lastInspectionDate,
      activeDeficiencies,
      checkpointsByStatus: {
        compliant: compliantCount,
        deficient: deficientCount,
        needsReview: needsReviewCount,
      },
    });
  } catch (error: unknown) {
    console.error('Dashboard metrics error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard metrics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
