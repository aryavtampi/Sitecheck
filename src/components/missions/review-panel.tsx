'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CheckpointReviewCard } from './checkpoint-review-card';
import { ReportReadinessGate } from './report-readiness-gate';
import { useDroneStore } from '@/stores/drone-store';
import { useCheckpointStore } from '@/stores/checkpoint-store';
import { useReportStore } from '@/stores/report-store';
import { cn } from '@/lib/utils';
import { aiAnalyses } from '@/data/ai-analyses';
import type { DroneMission, QSPReviewDecision } from '@/types/drone';
import type { CheckpointStatus } from '@/types/checkpoint';

interface ReviewPanelProps {
  mission: DroneMission;
}

type FilterTab = 'all' | 'needs-review' | 'deficient' | 'reviewed';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'needs-review', label: 'Needs Review' },
  { value: 'deficient', label: 'Deficient' },
  { value: 'reviewed', label: 'Reviewed' },
];

export function ReviewPanel({ mission }: ReviewPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [reportLoading, setReportLoading] = useState(false);

  const { checkpointReviews, setReviewDecision } = useDroneStore();
  const { checkpoints, fetchCheckpoints } = useCheckpointStore();
  const { generateReport } = useReportStore();

  // Fetch checkpoints on mount if not loaded
  useEffect(() => {
    if (checkpoints.length === 0) {
      fetchCheckpoints();
    }
  }, [checkpoints.length, fetchCheckpoints]);

  // Build a lookup map for checkpoints
  const checkpointMap = useMemo(() => {
    const map: Record<string, (typeof checkpoints)[0]> = {};
    for (const cp of checkpoints) {
      map[cp.id] = cp;
    }
    return map;
  }, [checkpoints]);

  // Build a lookup map for AI analyses
  const analysisMap = useMemo(() => {
    const map: Record<string, (typeof aiAnalyses)[0]> = {};
    for (const a of aiAnalyses) {
      map[a.checkpointId] = a;
    }
    return map;
  }, []);

  // Enabled waypoints only
  const enabledWaypoints = useMemo(
    () => mission.waypoints.filter((wp) => wp.enabled !== false),
    [mission.waypoints]
  );

  // Filter waypoints by tab
  const filteredWaypoints = useMemo(() => {
    return enabledWaypoints.filter((wp) => {
      const review = checkpointReviews[wp.checkpointId];
      const analysis = wp.aiAssessment ?? analysisMap[wp.checkpointId];

      switch (activeTab) {
        case 'needs-review':
          return !review || review.decision === 'pending';
        case 'deficient':
          return analysis?.status === 'deficient';
        case 'reviewed':
          return review && review.decision !== 'pending';
        default:
          return true;
      }
    });
  }, [enabledWaypoints, activeTab, checkpointReviews, analysisMap]);

  async function handleGenerateReport() {
    setReportLoading(true);
    try {
      await generateReport();
      router.push('/reports');
    } catch {
      setReportLoading(false);
    }
  }

  return (
    <Card className="border-border bg-surface">
      <CardContent className="pt-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-foreground mb-1">
            Checkpoint Review
          </p>
          <p className="text-[10px] text-muted-foreground">
            Review AI findings and approve or override before generating report.
          </p>
        </div>

        {/* Report readiness */}
        <ReportReadinessGate
          mission={mission}
          onGenerateReport={handleGenerateReport}
          loading={reportLoading}
        />

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-border pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
                activeTab === tab.value
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
              )}
            >
              {tab.label}
              {tab.value === 'needs-review' && (
                <span className="ml-1 text-[9px] opacity-60">
                  ({enabledWaypoints.filter(
                    (wp) => !checkpointReviews[wp.checkpointId] || checkpointReviews[wp.checkpointId].decision === 'pending'
                  ).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Checkpoint review cards */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredWaypoints.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No checkpoints match this filter.
            </p>
          )}
          {filteredWaypoints.map((wp) => {
            const checkpoint = checkpointMap[wp.checkpointId] ?? null;
            const analysis = wp.aiAssessment ?? analysisMap[wp.checkpointId] ?? null;
            const review = checkpointReviews[wp.checkpointId];

            return (
              <CheckpointReviewCard
                key={wp.checkpointId}
                waypoint={wp}
                checkpoint={checkpoint}
                analysis={analysis}
                review={review}
                onReviewChange={(
                  decision: QSPReviewDecision,
                  overrideStatus?: CheckpointStatus,
                  notes?: string
                ) => {
                  setReviewDecision(
                    wp.checkpointId,
                    wp.number,
                    analysis ?? {
                      checkpointId: wp.checkpointId,
                      summary: '',
                      status: 'needs-review' as CheckpointStatus,
                      confidence: 0,
                      details: [],
                      cgpReference: '',
                    },
                    decision,
                    overrideStatus,
                    notes
                  );
                }}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
