'use client';

import { use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/shared/section-header';
import { MissionCard } from '@/components/missions/mission-card';
import { WaypointTable } from '@/components/missions/waypoint-table';
import { useDroneStore } from '@/stores/drone-store';

const FlightReplay = dynamic(
  () => import('@/components/missions/flight-replay').then((m) => ({ default: m.FlightReplay })),
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
  const { missions, currentWaypointIndex, setCurrentWaypointIndex, setPlaybackProgress, setPlaybackState } =
    useDroneStore();

  const mission = missions.find((m) => m.id === missionId);

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

  // Compute waypoint progress positions for jumping
  const totalPathLength = mission.flightPath.length;
  const waypointProgresses = mission.waypoints.map((wp) => {
    let closestIdx = 0;
    let closestDist = Infinity;
    mission.flightPath.forEach(([lng, lat], idx) => {
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Link href="/missions">
          <Button variant="ghost" size="icon-xs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <SectionHeader
          title={mission.name}
          description="Flight replay with AI analysis at each waypoint"
        />
      </div>

      <MissionCard mission={mission} />

      <FlightReplay mission={mission} />

      <WaypointTable
        waypoints={mission.waypoints}
        currentIndex={currentWaypointIndex}
        onSelectWaypoint={handleSelectWaypoint}
      />
    </div>
  );
}
