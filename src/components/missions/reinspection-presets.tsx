'use client';

import { useState, useCallback } from 'react';
import { AlertCircle, Eye, ShieldX, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCheckpointStore } from '@/stores/checkpoint-store';

interface ReinspectionPresetsProps {
  onPresetsApplied: (checkpointIds: string[]) => void;
}

interface PresetState {
  loading: boolean;
  count: number | null;
}

export function ReinspectionPresets({ onPresetsApplied }: ReinspectionPresetsProps) {
  const checkpoints = useCheckpointStore((s) => s.checkpoints);

  const [deficientState, setDeficientState] = useState<PresetState>({ loading: false, count: null });
  const [followUpState, setFollowUpState] = useState<PresetState>({ loading: false, count: null });
  const [notVisibleState, setNotVisibleState] = useState<PresetState>({ loading: false, count: null });
  const [blockedState, setBlockedState] = useState<PresetState>({ loading: false, count: null });

  // Get deficient BMPs directly from checkpoint store
  const handleDeficient = useCallback(() => {
    const ids = checkpoints
      .filter((c) => c.status === 'deficient')
      .map((c) => c.id);
    setDeficientState({ loading: false, count: ids.length });
    onPresetsApplied(ids);
  }, [checkpoints, onPresetsApplied]);

  // Fetch last mission waypoints filtered by status
  const handleLastMissionByStatus = useCallback(
    async (
      targetStatuses: string[],
      setState: (s: PresetState) => void
    ) => {
      setState({ loading: true, count: null });
      try {
        const res = await fetch('/api/missions');
        if (!res.ok) throw new Error('Failed to fetch missions');
        const missions = await res.json();
        if (!missions || missions.length === 0) {
          setState({ loading: false, count: 0 });
          onPresetsApplied([]);
          return;
        }

        const lastMission = missions[0];
        const missionRes = await fetch(`/api/missions/${lastMission.id}`);
        if (!missionRes.ok) throw new Error('Failed to fetch mission details');
        const missionData = await missionRes.json();

        const matchingIds = (missionData.waypoints || [])
          .filter((w: { captureStatus: string }) => targetStatuses.includes(w.captureStatus))
          .map((w: { checkpointId: string }) => w.checkpointId);

        setState({ loading: false, count: matchingIds.length });
        onPresetsApplied(matchingIds);
      } catch {
        setState({ loading: false, count: 0 });
        onPresetsApplied([]);
      }
    },
    [onPresetsApplied]
  );

  const presets = [
    {
      label: 'Fly deficient BMPs',
      icon: AlertCircle,
      state: deficientState,
      onClick: handleDeficient,
      color: 'text-status-deficient',
    },
    {
      label: 'Fly ground follow-up',
      icon: ShieldX,
      state: followUpState,
      onClick: () =>
        handleLastMissionByStatus(['ground-follow-up'], setFollowUpState),
      color: 'text-status-warning',
    },
    {
      label: 'Fly not-visible BMPs',
      icon: Eye,
      state: notVisibleState,
      onClick: () =>
        handleLastMissionByStatus(['not-visible'], setNotVisibleState),
      color: 'text-status-review',
    },
    {
      label: 'Fly blocked BMPs',
      icon: Ban,
      state: blockedState,
      onClick: () =>
        handleLastMissionByStatus(['blocked'], setBlockedState),
      color: 'text-status-deficient',
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Quick presets</p>
      <div className="grid grid-cols-2 gap-2">
        {presets.map(({ label, icon: Icon, state, onClick, color }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto flex-col items-start gap-1.5 px-3 py-2.5 text-left border-border hover:border-input"
            onClick={onClick}
            disabled={state.loading}
          >
            <div className="flex w-full items-center gap-2">
              {state.loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              )}
              <span className="text-xs font-medium text-foreground">{label}</span>
              {state.count !== null && (
                <Badge
                  variant="secondary"
                  className="ml-auto h-4 px-1.5 font-data text-[11px]"
                >
                  {state.count}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
