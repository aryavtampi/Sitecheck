'use client';

/**
 * Block 5 — Inspection detail page.
 *
 * Renders a single inspection record with:
 *   - Status pill, trigger badge, due-by countdown
 *   - Editable narrative (PATCH on blur)
 *   - Compliance numbers (AI vs QSP) with progress bar
 *   - Linked missions roll-up
 *   - AI findings list (compliant / deficient / needs-review)
 *   - QSP decisions list
 *   - Corrective actions table with severity / status pills
 *   - "Download PDF" button → /api/inspections/[id]/pdf
 *   - "Submit Inspection" button (disabled when already submitted)
 */

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  ArrowLeft,
  CloudRain,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Send,
  Clock,
  Loader2,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInspectionStore } from '@/stores/inspection-store';
import { cn } from '@/lib/utils';

interface AnalysisRow {
  id: string;
  missionId: string;
  waypointNumber: number;
  checkpointId: string;
  summary: string;
  status: string;
  confidence: number;
  cgpReference: string;
  createdAt: string;
}

interface ReviewRow {
  id: string;
  missionId: string;
  waypointNumber: number;
  checkpointId: string;
  decision: string;
  overrideStatus: string | null;
  overrideNotes: string | null;
  reviewedAt: string;
}

interface CorrectiveActionRow {
  id: string;
  description: string;
  severity: string;
  status: string;
  dueDate: string;
  resolvedAt: string | null;
  cgpReference: string | null;
}

function statusToBadge(status: string | undefined) {
  switch (status) {
    case 'submitted':
      return 'bg-status-compliant-bg text-status-compliant border-status-compliant/20';
    case 'in-progress':
      return 'bg-status-warning-bg text-status-warning border-status-warning/20';
    case 'archived':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

function complianceTone(pct: number | undefined) {
  if (pct == null) return 'text-muted-foreground';
  if (pct >= 90) return 'text-status-compliant';
  if (pct >= 75) return 'text-status-warning';
  return 'text-status-deficient';
}

export default function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = useInspectionStore((s) => s.detailById[id]);
  const fetchById = useInspectionStore((s) => s.fetchById);
  const patchInspection = useInspectionStore((s) => s.patchInspection);
  const submitInspection = useInspectionStore((s) => s.submitInspection);
  const isLoading = useInspectionStore((s) => s.loadingDetails.has(id));

  const [narrativeDraft, setNarrativeDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchById(id);
  }, [id, fetchById]);

  useEffect(() => {
    if (detail?.inspection?.narrative != null) {
      setNarrativeDraft(detail.inspection.narrative);
    }
  }, [detail?.inspection?.narrative]);

  const inspection = detail?.inspection ?? null;
  const aiAnalyses = (detail?.aiAnalyses ?? []) as AnalysisRow[];
  const qspReviews = (detail?.qspReviews ?? []) as ReviewRow[];
  const correctiveActions = (detail?.correctiveActions ?? []) as CorrectiveActionRow[];

  const aiSummary = useMemo(() => {
    if (aiAnalyses.length === 0) return null;
    const compliant = aiAnalyses.filter((a) => a.status === 'compliant').length;
    const deficient = aiAnalyses.filter((a) => a.status === 'deficient').length;
    const review = aiAnalyses.filter((a) => a.status === 'needs-review').length;
    return { compliant, deficient, review, total: aiAnalyses.length };
  }, [aiAnalyses]);

  if (isLoading && !inspection) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading inspection...
        </div>
      </PageTransition>
    );
  }

  if (!inspection) {
    return (
      <PageTransition>
        <div className="p-6">
          <Link href="/inspections" className="text-sm text-primary hover:underline">
            ← Back to inspections
          </Link>
          <p className="mt-4 text-muted-foreground">Inspection not found.</p>
        </div>
      </PageTransition>
    );
  }

  const isSubmitted = inspection.status === 'submitted';
  const compliance = inspection.qspOverallCompliance ?? inspection.aiOverallCompliance ?? inspection.overallCompliance ?? 0;

  async function handleNarrativeBlur() {
    if (!detail?.inspection) return;
    if (narrativeDraft === (detail.inspection.narrative ?? '')) return;
    await patchInspection(id, { narrative: narrativeDraft });
  }

  async function handleSubmit() {
    if (isSubmitted) return;
    setSubmitting(true);
    try {
      await submitInspection(id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-4 p-6">
        <Link
          href="/inspections"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inspections
        </Link>

        {/* Header card */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {inspection.trigger === 'rain-event' || inspection.trigger === 'qpe' || inspection.trigger === 'post-storm' ? (
                  <CloudRain className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                )}
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Inspection — {format(new Date(inspection.date), 'MMMM d, yyyy')}
                </h1>
                <Badge className={cn('border text-[11px] font-medium capitalize', statusToBadge(inspection.status))}>
                  {inspection.status ?? 'draft'}
                </Badge>
                {inspection.trigger && inspection.trigger !== 'manual' && (
                  <Badge className="border border-border bg-muted text-[11px] font-medium capitalize text-muted-foreground">
                    {inspection.trigger}
                  </Badge>
                )}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {inspection.type} · Inspector: {inspection.inspector || 'Unassigned'}
              </div>
              {inspection.dueBy && !isSubmitted && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-status-warning/30 bg-status-warning-bg px-2 py-1 text-xs text-status-warning">
                  <Clock className="h-3 w-3" />
                  Due {formatDistanceToNowStrict(new Date(inspection.dueBy), { addSuffix: true })}
                </div>
              )}
              {inspection.submittedAt && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-status-compliant/30 bg-status-compliant-bg px-2 py-1 text-xs text-status-compliant">
                  <CheckCircle2 className="h-3 w-3" />
                  Submitted {format(new Date(inspection.submittedAt), 'MMM d, h:mm a')}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className={cn('font-data text-4xl font-semibold', complianceTone(compliance))}>
                {compliance}
                <span className="text-xl text-muted-foreground">%</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Overall compliance</div>
              <div className="flex gap-2">
                <a
                  href={`/api/inspections/${id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Download PDF
                </a>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitted || submitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  size="sm"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-1.5">{isSubmitted ? 'Submitted' : 'Submit'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance breakdown */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Analysis compliance</span>
              <span>Automated</span>
            </div>
            <div className={cn('font-data mt-1 text-3xl font-semibold', complianceTone(inspection.aiOverallCompliance))}>
              {inspection.aiOverallCompliance ?? '—'}
              {inspection.aiOverallCompliance != null && <span className="text-base text-muted-foreground">%</span>}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>QSP compliance</span>
              <span>After review</span>
            </div>
            <div className={cn('font-data mt-1 text-3xl font-semibold', complianceTone(inspection.qspOverallCompliance))}>
              {inspection.qspOverallCompliance ?? '—'}
              {inspection.qspOverallCompliance != null && <span className="text-base text-muted-foreground">%</span>}
            </div>
          </div>
        </div>

        {/* QSP narrative */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">QSP narrative</div>
            {isSubmitted && (
              <span className="text-[11px] text-muted-foreground">Read-only — inspection submitted</span>
            )}
          </div>
          <textarea
            value={narrativeDraft}
            onChange={(e) => setNarrativeDraft(e.target.value)}
            onBlur={handleNarrativeBlur}
            placeholder="Add inspection notes, observations, weather context, or follow-up items..."
            disabled={isSubmitted}
            rows={4}
            className="mt-2 w-full rounded-md border border-input bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* Linked missions */}
        {inspection.missionIds && inspection.missionIds.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="text-xs font-medium text-muted-foreground">
              Linked missions ({inspection.missionIds.length})
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {inspection.missionIds.map((missionId) => (
                <Link
                  key={missionId}
                  href={`/missions/${missionId}`}
                  className="font-data inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground hover:border-primary/40 hover:text-primary"
                >
                  {missionId}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* AI findings */}
        {aiSummary && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Analysis findings</span>
              <span>{aiSummary.total} total</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="border border-status-compliant/20 bg-status-compliant-bg font-medium text-status-compliant">
                {aiSummary.compliant} compliant
              </Badge>
              <Badge className="border border-status-deficient/20 bg-status-deficient-bg font-medium text-status-deficient">
                {aiSummary.deficient} deficient
              </Badge>
              <Badge className="border border-status-review/20 bg-status-review-bg font-medium text-status-review">
                {aiSummary.review} needs review
              </Badge>
            </div>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {aiAnalyses.map((a) => (
                <div
                  key={a.id}
                  className="rounded-md border border-border bg-muted/50 p-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Waypoint {a.waypointNumber}
                    </span>
                    <Badge
                      className={cn(
                        'border text-[11px] font-medium capitalize',
                        a.status === 'compliant' && 'border-status-compliant/20 bg-status-compliant-bg text-status-compliant',
                        a.status === 'deficient' && 'border-status-deficient/20 bg-status-deficient-bg text-status-deficient',
                        a.status === 'needs-review' && 'border-status-review/20 bg-status-review-bg text-status-review'
                      )}
                    >
                      {a.status} · {a.confidence}%
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{a.summary}</p>
                  {a.cgpReference && (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      CGP: {a.cgpReference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QSP decisions */}
        {qspReviews.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="text-xs font-medium text-muted-foreground">QSP decisions</div>
            <div className="mt-3 space-y-2">
              {qspReviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-md border border-border bg-muted/50 p-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Waypoint {r.waypointNumber}
                    </span>
                    <Badge
                      className={cn(
                        'border text-[11px] font-medium capitalize',
                        r.decision === 'accept' && 'border-status-compliant/20 bg-status-compliant-bg text-status-compliant',
                        r.decision === 'override' && 'border-status-warning/20 bg-status-warning-bg text-status-warning',
                        r.decision === 'pending' && 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      {r.decision}
                    </Badge>
                  </div>
                  {r.overrideStatus && (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Override status: {r.overrideStatus}
                    </div>
                  )}
                  {r.overrideNotes && (
                    <p className="mt-1 text-muted-foreground">{r.overrideNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corrective actions */}
        {correctiveActions.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Corrective actions</span>
              <span>{correctiveActions.length} total</span>
            </div>
            <div className="mt-3 space-y-2">
              {correctiveActions.map((ca) => (
                <div
                  key={ca.id}
                  className="rounded-md border border-border bg-muted/50 p-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {ca.description}
                    </span>
                    <div className="flex gap-1">
                      <Badge
                        className={cn(
                          'border text-[11px] font-medium capitalize',
                          ca.severity === 'high' && 'border-status-deficient/20 bg-status-deficient-bg text-status-deficient',
                          ca.severity === 'medium' && 'border-status-warning/20 bg-status-warning-bg text-status-warning',
                          ca.severity === 'low' && 'border-border bg-muted text-muted-foreground'
                        )}
                      >
                        {ca.severity}
                      </Badge>
                      <Badge
                        className={cn(
                          'border text-[11px] font-medium capitalize',
                          (ca.status === 'resolved' || ca.status === 'verified') && 'border-status-compliant/20 bg-status-compliant-bg text-status-compliant',
                          ca.status === 'in-progress' && 'border-status-warning/20 bg-status-warning-bg text-status-warning',
                          ca.status === 'open' && 'border-status-deficient/20 bg-status-deficient-bg text-status-deficient'
                        )}
                      >
                        {ca.status}
                      </Badge>
                    </div>
                  </div>
                  {ca.cgpReference && (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      CGP: {ca.cgpReference}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Due {format(new Date(ca.dueDate), 'MMM d, yyyy')}
                    {ca.resolvedAt && ` · Resolved ${format(new Date(ca.resolvedAt), 'MMM d')}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!aiSummary && qspReviews.length === 0 && correctiveActions.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
            <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            No mission data, analysis findings, or corrective actions linked yet.
            <br />
            Link a completed mission from the missions page to populate the report.
          </div>
        )}
      </div>
    </PageTransition>
  );
}

