'use client';

import { use, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/shared/section-header';
import { MissionCard } from '@/components/missions/mission-card';
import { WaypointTable } from '@/components/missions/waypoint-table';
import { useDroneStore } from '@/stores/drone-store';
import { useAppMode } from '@/hooks/use-app-mode';
import { cn } from '@/lib/utils';
import { FlightControlPanel } from '@/components/missions/flight-control-panel';
import { CaptureControls } from '@/components/missions/capture-controls';
import type { Waypoint, WaypointOutcome } from '@/types/drone';

const FlightReplay = dynamic(
  () => import('@/components/missions/flight-replay').then((m) => ({ default: m.FlightReplay })),
  {
    ssr: false,
    loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
  }
);

const RouteEditor = dynamic(
  () => import('@/components/missions/route-editor').then((m) => ({ default: m.RouteEditor })),
  {
    ssr: false,
    loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
  }
);

export default function MissionDetailPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = use(params);
  const { isApp } = useAppMode();
  const { missions, updateMission, currentWaypointIndex, setCurrentWaypointIndex, setPlaybackProgress, setPlaybackState } =
    useDroneStore();

  const mission = missions.find((m) => m.id === missionId);

  // Save route edits to the API and update the store
  const handleSaveRoute = useCallback(
    async (waypoints: Waypoint[], editedFlightPath: [number, number][]) => {
      if (!mission) return;

      // PUT updated mission to API
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editedFlightPath,
        }),
      });

      if (!res.ok) throw new Error('Failed to save route');

      // Update waypoints via individual PUT calls (for per-waypoint settings)
      for (const wp of waypoints) {
        await fetch(`/api/missions/${mission.id}/waypoints/${wp.number}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: wp.lat,
            lng: wp.lng,
            enabled: wp.enabled,
            altitudeOverride: wp.altitudeOverride,
            hoverTimeSeconds: wp.hoverTimeSeconds,
            captureMode: wp.captureMode,
            operatorNotes: wp.operatorNotes,
            sortOrder: wp.sortOrder,
          }),
        }).catch((err) => console.warn('Waypoint update failed:', err));
      }

      // Update the mission in the store with the new route data
      updateMission(mission.id, {
        editedFlightPath,
        waypoints,
      });
    },
    [mission, updateMission]
  );

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Mission not found</p>
        <Link href="/missions" className="mt-4">
          <Button variant="outline" size="sm">
            Back to Missions
          </Button>
        </Link>
      </div>
    );
  }

  // Compute waypoint progress positions for jumping (used by FlightReplay + WaypointTable)
  const activeFlightPath = mission.editedFlightPath || mission.flightPath;
  const totalPathLength = activeFlightPath.length;
  const waypointProgresses = mission.waypoints.map((wp) => {
    let closestIdx = 0;
    let closestDist = Infinity;
    activeFlightPath.forEach(([lng, lat], idx) => {
      const dist = Math.abs(lng - wp.lng) + Math.abs(lat - wp.lat);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });
    return closestIdx / (totalPathLength - 1);
  });

  function handleSelectWaypoint(index: number) {
    setCurrentWaypointIndex(index);
    setPlaybackProgress(waypointProgresses[index]);
    setPlaybackState('paused');
  }

  const isPlanned = mission.status === 'planned';
  const isActive = ['in-progress', 'paused', 'returning-home'].includes(mission.status);
  const isCompleted = ['completed', 'aborted'].includes(mission.status);

  const description = isPlanned
    ? 'Edit route, waypoints, and per-waypoint settings before flight'
    : isActive
      ? 'Live flight controls and mission monitoring'
      : 'Flight replay with AI analysis at each waypoint';

  return (
    <div className={cn('flex flex-col gap-4 p-4', isApp && 'gap-3 p-3')}>
      <div className="flex items-center gap-3">
        <Link href="/missions">
          <Button variant="ghost" size="icon-xs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <SectionHeader
          title={mission.name}
          description={description}
        />
      </div>

      <MissionCard mission={mission} />

      {/* Flight control panel for active/planned missions */}
      {(isPlanned || isActive) && (
        <FlightControlPanel mission={mission} />
      )}

      {isPlanned ? (
        <RouteEditor mission={mission} onSave={handleSaveRoute} />
      ) : (
        <>
          <FlightReplay mission={mission} />

          {/* Capture controls for in-flight missions */}
          {isActive && <CaptureControls mission={mission} />}

          <WaypointTable
            waypoints={mission.waypoints}
            currentIndex={currentWaypointIndex}
            onSelectWaypoint={handleSelectWaypoint}
            missionId={mission.id}
          />
        </>
      )}
    </div>
  );
}
