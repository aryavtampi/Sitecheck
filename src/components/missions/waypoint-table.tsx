'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Waypoint } from '@/types/drone';
import { useCheckpointStore } from '@/stores/checkpoint-store';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface WaypointTableProps {
  waypoints: Waypoint[];
  currentIndex: number;
  onSelectWaypoint: (index: number) => void;
}

export function WaypointTable({ waypoints, currentIndex, onSelectWaypoint }: WaypointTableProps) {
  const checkpoints = useCheckpointStore((s) => s.checkpoints);
  const fetchCheckpoints = useCheckpointStore((s) => s.fetchCheckpoints);
  const [aiAnalyses, setAiAnalyses] = useState<any[]>([]);

  useEffect(() => {
    if (checkpoints.length === 0) fetchCheckpoints();
  }, [checkpoints.length, fetchCheckpoints]);

  return (
    <ScrollArea className="h-[400px]">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[540px] text-xs">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="border-b border-white/5">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">BMP</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
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
                  'cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5',
                  isCurrent && 'bg-amber-500/10 hover:bg-amber-500/15'
                )}
              >
                <td className="px-3 py-2 font-mono text-muted-foreground">{wp.number}</td>
                <td className="px-3 py-2 font-mono text-foreground">{wp.checkpointId}</td>
                <td className="px-3 py-2 text-foreground max-w-[180px] truncate">
                  {cp?.name || '—'}
                </td>
                <td className="px-3 py-2">
                  {cp ? <StatusBadge status={cp.status} /> : '—'}
                </td>
                <td className="px-3 py-2">
                  {analysis ? (
                    <span
                      className={cn(
                        'font-mono font-medium',
                        analysis.confidence >= 90
                          ? 'text-green-500'
                          : analysis.confidence >= 75
                            ? 'text-amber-500'
                            : 'text-red-500'
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
