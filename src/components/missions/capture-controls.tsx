'use client';

import { useState, useCallback } from 'react';
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OutcomeTagBar } from './outcome-tag-bar';
import { getDroneProvider } from '@/lib/drone-provider';
import { useDroneStore } from '@/stores/drone-store';
import type { DroneMission, WaypointOutcome } from '@/types/drone';

interface CaptureControlsProps {
  mission: DroneMission;
  onOutcomeChanged?: (waypointNumber: number, outcome: WaypointOutcome) => void;
}

export function CaptureControls({ mission, onOutcomeChanged }: CaptureControlsProps) {
  const { currentWaypointIndex, updateMission } = useDroneStore();
  const [capturing, setCapturing] = useState(false);
  const [lastCaptureUrl, setLastCaptureUrl] = useState<string | null>(null);

  const currentWp = mission.waypoints[currentWaypointIndex];
  const provider = getDroneProvider();
  const capabilities = provider.getCapabilities();

  const isActive = mission.status === 'in-progress';
  const isAutoCapture = currentWp?.captureMode === 'auto' || !currentWp?.captureMode;

  const handleCapture = useCallback(async () => {
    if (!currentWp) return;
    setCapturing(true);
    try {
      const photoUrl = await provider.captureImage(mission.id, currentWp.number);
      setLastCaptureUrl(photoUrl);

      // Update waypoint with captured status
      await fetch(`/api/missions/${mission.id}/waypoints/${currentWp.number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captureStatus: 'captured',
          photo: photoUrl,
        }),
      }).catch(() => {});

      // Update store
      const updatedWaypoints = mission.waypoints.map((wp) =>
        wp.number === currentWp.number
          ? { ...wp, captureStatus: 'captured' as const, photo: photoUrl ?? undefined }
          : wp
      );
      updateMission(mission.id, { waypoints: updatedWaypoints });

      // Log audit
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drone',
          title: `Image captured at WP #${currentWp.number}`,
          description: `Manual image capture at waypoint #${currentWp.number}`,
          severity: 'info',
          linkedEntityId: mission.id,
          linkedEntityType: 'mission',
          metadata: {
            action: 'image-captured',
            missionId: mission.id,
            waypointNumber: currentWp.number,
            photoUrl,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    } finally {
      setCapturing(false);
    }
  }, [mission, currentWp, provider, updateMission]);

  const handleOutcomeTag = useCallback(
    async (outcome: WaypointOutcome) => {
      if (!currentWp) return;

      await fetch(`/api/missions/${mission.id}/waypoints/${currentWp.number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captureStatus: outcome }),
      }).catch(() => {});

      const updatedWaypoints = mission.waypoints.map((wp) =>
        wp.number === currentWp.number
          ? { ...wp, captureStatus: outcome }
          : wp
      );
      updateMission(mission.id, { waypoints: updatedWaypoints });
      onOutcomeChanged?.(currentWp.number, outcome);
    },
    [mission, currentWp, updateMission, onOutcomeChanged]
  );

  if (!currentWp || !isActive) return null;

  return (
    <Card className="border-border bg-surface">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">
              Waypoint #{currentWp.number} — Capture
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isAutoCapture ? 'Auto capture active' : `Mode: ${currentWp.captureMode}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Manual capture button */}
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleCapture}
              disabled={capturing}
            >
              {capturing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              Capture Now
            </Button>

            {/* Capability-gated buttons — hidden if unsupported */}
            {capabilities.supportsVideo && (
              <Button size="sm" variant="outline" className="gap-1.5" disabled>
                Video
              </Button>
            )}
            {capabilities.supportsBurst && (
              <Button size="sm" variant="outline" className="gap-1.5" disabled>
                Burst
              </Button>
            )}
          </div>
        </div>

        {/* Last capture indicator */}
        {lastCaptureUrl && (
          <div className="flex items-center gap-2 text-[10px] text-green-400">
            <ImageIcon className="h-3 w-3" />
            <span>Image captured successfully</span>
          </div>
        )}

        {/* Inline outcome tagging */}
        <div className="border-t border-border pt-2">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
            Tag Outcome
          </p>
          <OutcomeTagBar
            currentOutcome={currentWp.captureStatus}
            onTag={handleOutcomeTag}
          />
        </div>
      </CardContent>
    </Card>
  );
}
