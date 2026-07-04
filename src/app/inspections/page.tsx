'use client';

/**
 * Block 5 — Inspections list page.
 *
 * Shows every inspection on the active project, grouped by status with
 * status pills and trigger badges. Rain-event drafts surface a 48-hour
 * countdown chip pulled from `inspection.dueBy`.
 *
 * Click any row to drill into /inspections/[id].
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  ClipboardCheck,
  CloudRain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/page-transition';
import { SectionHeader } from '@/components/shared/section-header';
import { Badge } from '@/components/ui/badge';
import { useInspectionStore, EMPTY_INSPECTION_LIST } from '@/stores/inspection-store';
import { useProjectStore } from '@/stores/project-store';
import { cn } from '@/lib/utils';
import type { Inspection, InspectionStatus, InspectionTrigger } from '@/types';

const STATUS_FILTERS: Array<{ id: InspectionStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Drafts' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'archived', label: 'Archived' },
];

function statusStyles(status: InspectionStatus | undefined) {
  switch (status) {
    case 'submitted':
      return 'bg-status-compliant-bg text-status-compliant border-status-compliant/20';
    case 'in-progress':
      return 'bg-status-warning-bg text-status-warning border-status-warning/20';
    case 'archived':
      return 'bg-muted text-muted-foreground border-border';
    case 'draft':
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

function triggerStyles(trigger: InspectionTrigger | undefined) {
  switch (trigger) {
    case 'rain-event':
    case 'qpe':
    case 'post-storm':
      return 'bg-muted text-muted-foreground border-border';
    case 'pre-storm':
      return 'bg-muted text-muted-foreground border-border';
    case 'routine':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

function dueByLabel(dueBy?: string): { text: string; tone: string } | null {
  if (!dueBy) return null;
  const due = new Date(dueBy).getTime();
  const now = Date.now();
  const overdue = due <= now;
  if (overdue) {
    return {
      text: `${formatDistanceToNowStrict(new Date(dueBy))} overdue`,
      tone: 'text-status-deficient',
    };
  }
  const hours = (due - now) / (1000 * 60 * 60);
  return {
    text: `Due ${formatDistanceToNowStrict(new Date(dueBy), { addSuffix: true })}`,
    tone:
      hours < 12
        ? 'text-status-deficient'
        : hours < 24
          ? 'text-status-warning'
          : 'text-status-compliant',
  };
}

function InspectionRow({ inspection }: { inspection: Inspection }) {
  const due = dueByLabel(inspection.dueBy);
  const compliance = inspection.qspOverallCompliance ?? inspection.aiOverallCompliance ?? inspection.overallCompliance;
  const isRainEvent = inspection.trigger === 'rain-event' || inspection.trigger === 'qpe' || inspection.trigger === 'post-storm';
  return (
    <Link
      href={`/inspections/${inspection.id}`}
      className="block rounded-lg border border-border bg-card px-4 py-3 hover:border-input transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isRainEvent ? (
              <CloudRain className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ClipboardCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-semibold text-foreground">
              {format(new Date(inspection.date), 'MMM d, yyyy')} — {inspection.type}
            </span>
            <Badge className={cn('border text-[11px] font-medium capitalize', statusStyles(inspection.status))}>
              {inspection.status ?? 'draft'}
            </Badge>
            {inspection.trigger && inspection.trigger !== 'manual' && (
              <Badge className={cn('border text-[11px] font-medium capitalize', triggerStyles(inspection.trigger))}>
                {inspection.trigger}
              </Badge>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Inspector: {inspection.inspector || 'Unassigned'}
            {inspection.missionIds && inspection.missionIds.length > 0
              ? ` · ${inspection.missionIds.length} mission${inspection.missionIds.length === 1 ? '' : 's'}`
              : ''}
          </div>
          {due && (
            <div className={cn('mt-1 flex items-center gap-1 text-xs font-medium', due.tone)}>
              <Clock className="h-3 w-3" />
              {due.text}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="font-data text-2xl font-semibold text-foreground">
            {compliance ?? 0}
            <span className="text-base text-muted-foreground">%</span>
          </div>
          <div className="text-[11px] text-muted-foreground">Compliance</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground self-center" />
      </div>
    </Link>
  );
}

export default function InspectionsPage() {
  const projectId = useProjectStore((s) => s.currentProjectId);
  const inspections = useInspectionStore((s) => s.byProject[projectId] ?? EMPTY_INSPECTION_LIST);
  const fetchForProject = useInspectionStore((s) => s.fetchForProject);
  const isLoading = useInspectionStore((s) => s.loadingProjects.has(projectId));
  const [filter, setFilter] = useState<InspectionStatus | 'all'>('all');

  useEffect(() => {
    if (projectId) fetchForProject(projectId);
  }, [projectId, fetchForProject]);

  const filtered = useMemo(() => {
    if (filter === 'all') return inspections;
    return inspections.filter((i) => (i.status ?? 'draft') === filter);
  }, [inspections, filter]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {
      total: inspections.length,
      submitted: 0,
      draft: 0,
      'in-progress': 0,
      compliant: 0,
      attention: 0,
    };
    for (const i of inspections) {
      const status = i.status ?? 'draft';
      if (out[status] !== undefined) out[status] += 1;
      const c = i.qspOverallCompliance ?? i.aiOverallCompliance ?? i.overallCompliance ?? 0;
      if (c >= 80) out.compliant += 1;
      else out.attention += 1;
    }
    return out;
  }, [inspections]);

  return (
    <PageTransition>
      <div className="flex flex-col gap-4 p-6">
        <SectionHeader
          title="Inspections"
          description="All draft, in-progress, and submitted inspections for this project"
        />

        {/* Summary tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile
            label="Total"
            value={counts.total}
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
          <SummaryTile
            label="Submitted"
            value={counts.submitted}
            icon={<CheckCircle2 className="h-4 w-4 text-status-compliant" />}
          />
          <SummaryTile
            label="Drafts"
            value={counts.draft + counts['in-progress']}
            icon={<Clock className="h-4 w-4 text-status-warning" />}
          />
          <SummaryTile
            label="Needs attention"
            value={counts.attention}
            icon={<AlertTriangle className="h-4 w-4 text-status-deficient" />}
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === opt.id
                  ? 'border-primary/40 bg-accent text-accent-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-input'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Inspection rows */}
        <div className="flex flex-col gap-2">
          {isLoading && inspections.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
              Loading inspections...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
              No inspections match this filter.
            </div>
          ) : (
            filtered.map((inspection) => (
              <InspectionRow key={inspection.id} inspection={inspection} />
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function SummaryTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-data mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
