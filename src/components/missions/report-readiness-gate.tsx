'use client';

import { FileBarChart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDroneStore } from '@/stores/drone-store';
import { REPORT_READINESS_LABELS, REPORT_READINESS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { DroneMission } from '@/types/drone';

interface ReportReadinessGateProps {
  mission: DroneMission;
  onGenerateReport: () => void;
  loading?: boolean;
}

export function ReportReadinessGate({
  mission,
  onGenerateReport,
  loading,
}: ReportReadinessGateProps) {
  const { checkpointReviews, getReportReadiness } = useDroneStore();
  const readiness = getReportReadiness(mission.id);
  const colors = REPORT_READINESS_COLORS[readiness];

  const enabledWaypoints = mission.waypoints.filter((wp) => wp.enabled !== false);
  const reviewedCount = enabledWaypoints.filter(
    (wp) => {
      const review = checkpointReviews[wp.checkpointId];
      return review && review.decision !== 'pending';
    }
  ).length;
  const totalCount = enabledWaypoints.length;
  const progressPct = totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Review Progress
          </span>
          <span className={cn('text-xs font-semibold', colors.text)}>
            {reviewedCount} / {totalCount}
          </span>
        </div>
        <Progress
          value={progressPct}
          className={cn(
            'w-full h-1.5',
            readiness === 'ready'
              ? '[&_[data-slot=progress-indicator]]:bg-green-500'
              : readiness === 'partially-reviewed'
                ? '[&_[data-slot=progress-indicator]]:bg-amber-500'
                : '[&_[data-slot=progress-indicator]]:bg-gray-500'
          )}
        />
      </div>

      {/* Status + Action */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
          colors.bg, colors.text, colors.border,
        )}>
          {REPORT_READINESS_LABELS[readiness]}
        </span>

        <Button
          size="sm"
          className="gap-1.5"
          disabled={readiness !== 'ready' || loading}
          onClick={onGenerateReport}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileBarChart className="h-3.5 w-3.5" />
          )}
          Generate Report
        </Button>
      </div>
    </div>
  );
}
