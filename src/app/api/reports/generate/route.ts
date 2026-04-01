import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const DEFAULT_PROJECT_ID = 'riverside-phase2';

interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'table' | 'signature';
  editable: boolean;
}

// POST /api/reports/generate - Generate a report from live data
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const projectId = body.projectId || DEFAULT_PROJECT_ID;
    const inspectionId = body.inspectionId;

    // 1. Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // 2. Fetch latest inspection (or specific one if provided)
    let inspectionQuery = supabase
      .from('inspections')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (inspectionId) {
      inspectionQuery = inspectionQuery.eq('id', inspectionId);
    }

    const { data: inspections, error: inspectionError } = await inspectionQuery.limit(1);

    if (inspectionError) {
      console.error('Error fetching inspection:', inspectionError);
    }

    const inspection = inspections?.[0] || null;

    // 3. Fetch current weather
    const { data: weatherSnapshot, error: weatherError } = await supabase
      .from('weather_snapshots')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (weatherError && weatherError.code !== 'PGRST116') {
      console.error('Error fetching weather:', weatherError);
    }

    // 4. Fetch checkpoints and compute status counts
    const { data: checkpoints, error: checkpointsError } = await supabase
      .from('checkpoints')
      .select('*')
      .eq('project_id', projectId);

    if (checkpointsError) {
      console.error('Error fetching checkpoints:', checkpointsError);
    }

    const checkpointList = checkpoints || [];
    const statusCounts = {
      compliant: checkpointList.filter(c => c.status === 'compliant').length,
      deficient: checkpointList.filter(c => c.status === 'deficient').length,
      needsReview: checkpointList.filter(c => c.status === 'needs-review').length,
      total: checkpointList.length,
    };

    // Group by BMP type
    const bmpTypes = ['erosion-control', 'sediment-control', 'tracking-control', 'wind-erosion', 'materials-management', 'non-storm-water'];
    const bmpStatusSummary = bmpTypes.map(type => {
      const bmps = checkpointList.filter(c => c.bmp_type === type);
      return {
        type,
        total: bmps.length,
        compliant: bmps.filter(c => c.status === 'compliant').length,
        deficient: bmps.filter(c => c.status === 'deficient').length,
        needsReview: bmps.filter(c => c.status === 'needs-review').length,
      };
    }).filter(b => b.total > 0);

    // 5. Fetch active deficiencies
    const { data: deficiencies, error: deficienciesError } = await supabase
      .from('deficiencies')
      .select('*, checkpoints(name)')
      .eq('project_id', projectId)
      .in('status', ['open', 'in-progress'])
      .order('detected_date', { ascending: false });

    if (deficienciesError) {
      console.error('Error fetching deficiencies:', deficienciesError);
    }

    const deficiencyList = deficiencies || [];

    // Build the 7 report sections
    const now = new Date();
    const reportId = `report-${Date.now()}`;

    // Section 1: Site Information
    const siteInfoContent = `
**Project Name:** ${project.name}
**Address:** ${project.address}
**WDID:** ${project.wdid}
**Permit Number:** ${project.permit_number}
**Risk Level:** ${project.risk_level}
**Total Acreage:** ${project.acreage} acres
**Project Status:** ${project.status}
**Start Date:** ${project.start_date}
**Estimated Completion:** ${project.estimated_completion}
    `.trim();

    // Section 2: Inspection Details
    const inspectionContent = inspection ? `
**Inspection Date:** ${new Date(inspection.date).toLocaleDateString()}
**Inspection Type:** ${inspection.type}
**Inspector:** ${inspection.inspector}
**Overall Compliance:** ${inspection.overall_compliance}%
**Mission ID:** ${inspection.mission_id || 'N/A'}
    `.trim() : `
**No recent inspection data available.**

A new inspection should be conducted to generate accurate compliance information.
    `.trim();

    // Section 3: Weather Conditions
    const weatherContent = weatherSnapshot ? `
**Current Conditions at Time of Inspection:**
- Temperature: ${weatherSnapshot.temperature}F
- Condition: ${weatherSnapshot.condition}
- Wind Speed: ${weatherSnapshot.wind_speed_mph} mph
- Humidity: ${weatherSnapshot.humidity}%

**Weather Data Retrieved:** ${new Date(weatherSnapshot.fetched_at).toLocaleString()}
    `.trim() : `
**Weather data unavailable.**

Weather conditions should be recorded at the time of inspection.
    `.trim();

    // Section 4: BMP Status Summary
    let bmpStatusContent = `
**Overall BMP Status:**
- Total BMPs: ${statusCounts.total}
- Compliant: ${statusCounts.compliant} (${statusCounts.total > 0 ? Math.round((statusCounts.compliant / statusCounts.total) * 100) : 0}%)
- Deficient: ${statusCounts.deficient} (${statusCounts.total > 0 ? Math.round((statusCounts.deficient / statusCounts.total) * 100) : 0}%)
- Needs Review: ${statusCounts.needsReview} (${statusCounts.total > 0 ? Math.round((statusCounts.needsReview / statusCounts.total) * 100) : 0}%)

**Status by BMP Type:**
`;

    for (const bmp of bmpStatusSummary) {
      const typeName = bmp.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      bmpStatusContent += `
- **${typeName}:** ${bmp.total} total (${bmp.compliant} compliant, ${bmp.deficient} deficient, ${bmp.needsReview} needs review)`;
    }

    // Section 5: Deficiency Log
    let deficiencyContent = '';
    if (deficiencyList.length === 0) {
      deficiencyContent = `
**No active deficiencies identified.**

All BMPs are currently in compliance with CGP requirements.
      `.trim();
    } else {
      deficiencyContent = `
**Active Deficiencies: ${deficiencyList.length}**

`;
      for (const def of deficiencyList) {
        const checkpointName = (def.checkpoints as { name: string })?.name || 'Unknown';
        deficiencyContent += `
---
**${checkpointName}** (${def.status})
- Detected: ${new Date(def.detected_date).toLocaleDateString()}
- Deadline: ${new Date(def.deadline).toLocaleDateString()}
- CGP Violation: ${def.cgp_violation}
- Description: ${def.description}
- Corrective Action: ${def.corrective_action}
`;
      }
    }

    // Section 6: Certification Statement
    const certificationContent = `
I certify under penalty of law that this document and all attachments were prepared under my direction or supervision in accordance with a system designed to assure that qualified personnel properly gathered and evaluated the information submitted. Based on my inquiry of the person or persons who manage the system, or those persons directly responsible for gathering the information, the information submitted is, to the best of my knowledge and belief, true, accurate, and complete. I am aware that there are significant penalties for submitting false information, including the possibility of fine and imprisonment for knowing violations.

This inspection was conducted in accordance with the requirements of:
- California Construction General Permit (CGP) Order 2022-0057-DWQ
- Site-specific Storm Water Pollution Prevention Plan (SWPPP)
- All applicable local, state, and federal regulations
    `.trim();

    // Section 7: QSP Signature Block
    const signatureContent = `
**Qualified SWPPP Practitioner (QSP) Information:**

- Name: ${project.qsp_name}
- License Number: ${project.qsp_license_number}
- Company: ${project.qsp_company}
- Phone: ${project.qsp_phone}
- Email: ${project.qsp_email}

**Signature:** _________________________

**Date:** _________________________
    `.trim();

    const sections: ReportSection[] = [
      {
        id: 'site-info',
        title: 'Site Information',
        content: siteInfoContent,
        type: 'text',
        editable: false,
      },
      {
        id: 'inspection-details',
        title: 'Inspection Details',
        content: inspectionContent,
        type: 'text',
        editable: true,
      },
      {
        id: 'weather-conditions',
        title: 'Weather Conditions',
        content: weatherContent,
        type: 'text',
        editable: true,
      },
      {
        id: 'bmp-status',
        title: 'BMP Status Summary',
        content: bmpStatusContent.trim(),
        type: 'table',
        editable: false,
      },
      {
        id: 'deficiency-log',
        title: 'Deficiency Log',
        content: deficiencyContent.trim(),
        type: 'text',
        editable: true,
      },
      {
        id: 'certification',
        title: 'Certification Statement',
        content: certificationContent,
        type: 'text',
        editable: false,
      },
      {
        id: 'signature',
        title: 'QSP Signature Block',
        content: signatureContent,
        type: 'signature',
        editable: false,
      },
    ];

    // Insert report into database
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        id: reportId,
        project_id: projectId,
        inspection_id: inspection?.id || null,
        generated_date: now.toISOString(),
        sections: sections,
        signed: false,
        signed_by: null,
        signed_date: null,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }

    // Create activity event
    const activityEvent = {
      id: `activity-${Date.now()}`,
      project_id: projectId,
      type: 'document',
      title: 'Report Generated',
      description: `CGP compliance report generated for inspection on ${inspection ? new Date(inspection.date).toLocaleDateString() : 'N/A'}`,
      timestamp: now.toISOString(),
      severity: 'info',
      linked_entity_id: reportId,
      linked_entity_type: 'report',
    };

    const { error: activityError } = await supabase
      .from('activity_events')
      .insert(activityEvent);

    if (activityError) {
      console.error('Error creating activity event:', activityError);
    }

    // Transform and return
    return NextResponse.json({
      id: report.id,
      projectId: report.project_id,
      inspectionId: report.inspection_id,
      generatedDate: report.generated_date,
      sections: report.sections,
      signed: report.signed,
      signedBy: report.signed_by,
      signedDate: report.signed_date,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/reports/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
