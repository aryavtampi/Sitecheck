'use client';

import { useState, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Move,
  Clock,
  Camera,
  SlidersHorizontal,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDroneProvider } from '@/lib/drone-provider';
import { useDroneStore } from '@/stores/drone-store';
import type { ManualOverrideAction } from '@/types/drone';
import { cn } from '@/lib/utils';

interface ManualOverrideBarProps {
  missionId: string;
  currentWaypointNumber: number;
  onResumeMission: () => void;
  disabled?: boolean;
}

// Offset in degrees for reposition (~1ft ≈ 0.000003°, 5ft ≈ 0.000015°)
const REPOSITION_OFFSETS: Record<string, number> = {
  '1ft': 0.000003,
  '3ft': 0.000009,
  '5ft': 0.000015,
  '10ft': 0.000030,
};

const HOVER_OPTIONS = [10, 30, 60];
const CAMERA_ANGLES = [-90, -60, -45, -30];

export function ManualOverrideBar({
  missionId,
  currentWaypointNumber,
  onResumeMission,
  disabled,
}: ManualOverrideBarProps) {
  const [loading, setLoading] = useState<ManualOverrideAction | null>(null);
  const [expandedAction, setExpandedAction] = useState<ManualOverrideAction | null>(null);
  const [repositionDist, setRepositionDist] = useState('5ft');
  const { updateMission } = useDroneStore();

  const provider = getDroneProvider();

  const handleReposition = useCallback(
    async (direction: 'N' | 'S' | 'E' | 'W') => {
      setLoading('reposition');
      const offset = REPOSITION_OFFSETS[repositionDist];
      const latOffset = direction === 'N' ? offset : direction === 'S' ? -offset : 0;
      const lngOffset = direction === 'E' ? offset : direction === 'W' ? -offset : 0;
      try {
        await provider.reposition(missionId, latOffset, lngOffset);
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'drone',
            title: `Reposition ${direction} ${repositionDist}`,
            description: `Manual reposition at WP #${currentWaypointNumber}: ${direction} ${repositionDist}`,
            severity: 'info',
            linkedEntityId: missionId,
            linkedEntityType: 'mission',
            metadata: { action: 'reposition', direction, distance: repositionDist, waypointNumber: currentWaypointNumber },
          }),
        }).catch(() => {});
      } finally {
        setLoading(null);
      }
    },
    [missionId, currentWaypointNumber, provider, repositionDist]
  );

  const handleHoverLonger = useCallback(
    async (seconds: number) => {
      setLoading('hover-longer');
      try {
        await provider.hoverLonger(missionId, seconds);
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'drone',
            title: `Hover +${seconds}s`,
            description: `Extended hover at WP #${currentWaypointNumber} by ${seconds}s`,
            severity: 'info',
            linkedEntityId: missionId,
            linkedEntityType: 'mission',
            metadata: { action: 'hover-longer', seconds, waypointNumber: currentWaypointNumber },
          }),
        }).catch(() => {});
      } finally {
        setLoading(null);
        setExpandedAction(null);
      }
    },
    [missionId, currentWaypointNumber, provider]
  );

  const handleRetakePhoto = useCallback(async () => {
    setLoading('retake-photo');
    try {
      const photoUrl = await provider.retakePhoto(missionId, currentWaypointNumber);
      // Update waypoint in store if photo returned
      if (photoUrl) {
        // This would update the waypoint photo — stubbed for now
      }
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drone',
          title: `Retake photo at WP #${currentWaypointNumber}`,
          description: `Manual photo retake during override at WP #${currentWaypointNumber}`,
          severity: 'info',
          linkedEntityId: missionId,
          linkedEntityType: 'mission',
          metadata: { action: 'retake-photo', waypointNumber: currentWaypointNumber, photoUrl },
        }),
      }).catch(() => {});
    } finally {
      setLoading(null);
    }
  }, [missionId, currentWaypointNumber, provider]);

  const handleAdjustCamera = useCallback(
    async (pitchDeg: number) => {
      setLoading('adjust-camera-angle');
      try {
        await provider.adjustCameraAngle(missionId, pitchDeg);
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'drone',
            title: `Camera angle ${pitchDeg}°`,
            description: `Adjusted camera to ${pitchDeg}° at WP #${currentWaypointNumber}`,
            severity: 'info',
            linkedEntityId: missionId,
            linkedEntityType: 'mission',
            metadata: { action: 'adjust-camera-angle', pitchDeg, waypointNumber: currentWaypointNumber },
          }),
        }).catch(() => {});
      } finally {
        setLoading(null);
        setExpandedAction(null);
      }
    },
    [missionId, currentWaypointNumber, provider]
  );

  const toggleAction = (action: ManualOverrideAction) => {
    setExpandedAction(expandedAction === action ? null : action);
  };

  const isActionLoading = loading !== null;

  return (
    <div className="rounded-lg border border-status-warning/30 bg-status-warning-bg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-status-warning" />
        <div>
          <p className="text-xs font-semibold text-status-warning">Manual override active</p>
          <p className="text-[11px] text-muted-foreground">
            Drone is under manual RC control. Mission route is paused at WP{' '}
            <span className="font-data">#{currentWaypointNumber}</span>.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Reposition */}
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'gap-1.5 border-status-warning/30 text-status-warning hover:bg-status-warning/10',
            expandedAction === 'reposition' && 'bg-status-warning/10 ring-1 ring-status-warning/30'
          )}
          onClick={() => toggleAction('reposition')}
          disabled={isActionLoading || disabled}
        >
          <Move className="h-3.5 w-3.5" />
          Reposition
        </Button>

        {/* Hover Longer */}
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'gap-1.5 border-status-warning/30 text-status-warning hover:bg-status-warning/10',
            expandedAction === 'hover-longer' && 'bg-status-warning/10 ring-1 ring-status-warning/30'
          )}
          onClick={() => toggleAction('hover-longer')}
          disabled={isActionLoading || disabled}
        >
          <Clock className="h-3.5 w-3.5" />
          Hover longer
        </Button>

        {/* Retake Photo */}
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-status-warning/30 text-status-warning hover:bg-status-warning/10"
          onClick={handleRetakePhoto}
          disabled={isActionLoading || disabled}
        >
          {loading === 'retake-photo' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
          Retake photo
        </Button>

        {/* Adjust Camera */}
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'gap-1.5 border-status-warning/30 text-status-warning hover:bg-status-warning/10',
            expandedAction === 'adjust-camera-angle' && 'bg-status-warning/10 ring-1 ring-status-warning/30'
          )}
          onClick={() => toggleAction('adjust-camera-angle')}
          disabled={isActionLoading || disabled}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Adjust camera
        </Button>

        {/* Resume Mission — prominent */}
        <Button
          size="sm"
          className="gap-1.5 font-medium"
          onClick={onResumeMission}
          disabled={isActionLoading || disabled}
        >
          Resume mission <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Expanded panels */}
      {expandedAction === 'reposition' && (
        <div className="rounded-md border border-status-warning/20 bg-surface p-3 space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Reposition — small supervised adjustment
          </p>
          <div className="flex items-center gap-3">
            {/* Distance selector */}
            <div className="flex items-center gap-1">
              {Object.keys(REPOSITION_OFFSETS).map((dist) => (
                <button
                  key={dist}
                  onClick={() => setRepositionDist(dist)}
                  className={cn(
                    'rounded px-2 py-0.5 text-[11px] font-data transition-all border',
                    repositionDist === dist
                      ? 'bg-accent text-accent-foreground border-primary/30'
                      : 'text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {dist}
                </button>
              ))}
            </div>

            {/* Directional pad */}
            <div className="grid grid-cols-3 gap-0.5 w-fit">
              <div />
              <button
                onClick={() => handleReposition('N')}
                disabled={isActionLoading}
                className="rounded border border-border bg-muted p-1 text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <div />
              <button
                onClick={() => handleReposition('W')}
                disabled={isActionLoading}
                className="rounded border border-border bg-muted p-1 text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </button>
              {loading === 'reposition' ? (
                <div className="flex items-center justify-center p-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex items-center justify-center p-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
              )}
              <button
                onClick={() => handleReposition('E')}
                disabled={isActionLoading}
                className="rounded border border-border bg-muted p-1 text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
              <div />
              <button
                onClick={() => handleReposition('S')}
                disabled={isActionLoading}
                className="rounded border border-border bg-muted p-1 text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <div />
            </div>
          </div>
        </div>
      )}

      {expandedAction === 'hover-longer' && (
        <div className="rounded-md border border-status-warning/20 bg-surface p-3 space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Extend hover at current position
          </p>
          <div className="flex items-center gap-2">
            {HOVER_OPTIONS.map((sec) => (
              <Button
                key={sec}
                size="sm"
                variant="outline"
                className="font-data text-xs"
                onClick={() => handleHoverLonger(sec)}
                disabled={isActionLoading}
              >
                {loading === 'hover-longer' ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                +{sec}s
              </Button>
            ))}
          </div>
        </div>
      )}

      {expandedAction === 'adjust-camera-angle' && (
        <div className="rounded-md border border-status-warning/20 bg-surface p-3 space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Gimbal pitch angle
          </p>
          <div className="flex items-center gap-2">
            {CAMERA_ANGLES.map((angle) => (
              <Button
                key={angle}
                size="sm"
                variant="outline"
                className="font-data text-xs"
                onClick={() => handleAdjustCamera(angle)}
                disabled={isActionLoading}
              >
                {loading === 'adjust-camera-angle' ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                {angle}°
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            -90° = nadir (straight down) · -30° = oblique forward
          </p>
        </div>
      )}
    </div>
  );
}
