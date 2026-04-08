/**
 * Block 5 — Submit an inspection.
 *
 * POST /api/inspections/[id]/submit
 *
 * Flips status to `submitted`, freezes `submitted_at`, and logs an
 * activity event of type `inspection-submitted`. Optionally accepts
 * `{ reportId }` in the body to link the freshly-rendered PDF.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();
    const body = await request.json().catch(() => ({}));
    const reportId = typeof body?.reportId === 'string' ? body.reportId : null;

    const submittedAt = new Date().toISOString();

    const updates: Record<string, unknown> = {
      status: 'submitted',
      submitted_at: submittedAt,
    };
    if (reportId) {
      updates.report_id = reportId;
    }

    const { data, error } = await supabase
      .from('inspections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Inspection submit failed:', error);
      return NextResponse.json({ error: 'Submit failed' }, { status: 500 });
    }

    // Activity event
    await supabase.from('activity_events').insert({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      project_id: data.project_id,
      type: 'inspection',
      title: 'Inspection Submitted',
      description: `Inspection ${id} marked as submitted.`,
      timestamp: submittedAt,
      severity: 'info',
      linked_entity_id: id,
      linked_entity_type: 'inspection',
    });

    return NextResponse.json({
      ok: true,
      id,
      status: 'submitted',
      submittedAt,
      reportId: data.report_id ?? null,
    });
  } catch (err) {
    console.error('Inspection submit unexpected error:', err);
    return NextResponse.json({ error: 'Submit failed' }, { status: 500 });
  }
}
