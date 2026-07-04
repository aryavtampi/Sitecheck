'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Waypoint, WaypointOutcome } from '@/types/drone';
import { useCheckpointStore } from '@/stores/checkpoint-store';
import { formatTime } from '@/lib/format';
import { WAYPOINT_OUTCOME_LABELS, WAYPOINT_OUTCOME_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { WaypointOutcomeTag } from './waypoint-outcome-tag';

interface WaypointTableProps {
  waypoints: Waypoint[];
  currentIndex: number;
  onSelectWaypoint: (index: number) => void;
  missionId?: string;
  onOutcomeChanged?: (waypointNumber: number, outcome: WaypointOutcome) => void;
}

export function WaypointTable({
  waypoints,
  currentIndex,
  onSelectWaypoint,
  missionId,
  onOutcomeChanged,
}: WaypointTableProps) {
  const checkpoints = useCheckpointStore((s) => s.checkpoints);
  const fetchCheckpoints = useCheckpointStore((s) => s.fetchCheckpoints);
  const [aiAnalyses] = useState<{ checkpointId: string; confidence: number }[]>([]);

  useEffect(() => {
    if (checkpoints.length === 0) fetchCheckpoints();
  }, [checkpoints.length, fetchCheckpoints]);

  return (
    <ScrollArea className="h-[400px]">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">BMP</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Outcome</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Conf.</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Time</th>
          </tr>
        </thead>
        <tbody>
          {waypoints.map((wp, i) => {
            const cp = checkpoints.find((c) => c.id === wp.checkpointId);
            const analysis = aiAnalyses.find((a) => a.checkpointId === wp.checkpointId);
            const isCurrent = i === currentIndex;

            return (
              <tr
                key={wp.number}
                onClick={() => onSelectWaypoint(i)}
                className={cn(
                  'cursor-pointer border-b border-border transition-colors hover:bg-muted/50',
                  isCurrent && 'bg-accent/60 hover:bg-accent'
                )}
              >
                <td className="px-3 py-2 font-data text-muted-foreground">{wp.number}</td>
                <td className="px-3 py-2 font-data text-foreground">{wp.checkpointId}</td>
                <td className="px-3 py-2 text-foreground max-w-[180px] truncate">
                  {cp?.name || '—'}
                </td>
                <td className="px-3 py-2">
                  {cp ? <StatusBadge status={cp.status} /> : '—'}
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  {missionId ? (
                    <WaypointOutcomeTag
                      missionId={missionId}
                      waypointNumber={wp.number}
                      currentOutcome={wp.captureStatus}
                      onOutcomeChanged={onOutcomeChanged}
                    />
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium ${WAYPOINT_OUTCOME_COLORS[wp.captureStatus]} border-current/20`}
                    >
                      {WAYPOINT_OUTCOME_LABELS[wp.captureStatus]}
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-2">
                  {analysis ? (
                    <span
                      className={cn(
                        'font-data font-medium',
                        analysis.confidence >= 90
                          ? 'text-status-compliant'
                          : analysis.confidence >= 75
                            ? 'text-status-warning'
                            : 'text-status-deficient'
                      )}
                    >
                      {analysis.confidence}%
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatTime(wp.arrivalTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </ScrollArea>
  );
}
