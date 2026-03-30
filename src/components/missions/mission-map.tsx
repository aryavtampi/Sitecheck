'use client';

import { useMemo, useState, useCallback } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DroneMission } from '@/types/drone';
import { checkpoints } from '@/data/checkpoints';
import { STATUS_COLORS } from '@/lib/constants';
import { MAPBOX_TOKEN, DEFAULT_MAP_STYLE } from '@/lib/mapbox-config';

interface MissionMapProps {
  mission: DroneMission;
  currentWaypointIndex: number;
  playbackProgress: number;
  onSelectWaypoint: (index: number) => void;
}

export function MissionMap({
  mission,
  currentWaypointIndex,
  playbackProgress,
  onSelectWaypoint,
}: MissionMapProps) {
  const [cursor, setCursor] = useState<string>('grab');

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('grab'), []);

  // Compute initial viewport from flight path bounds
  const initialViewState = useMemo(() => {
    const lngs = mission.flightPath.map(([lng]) => lng);
    const lats = mission.flightPath.map(([, lat]) => lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Approximate zoom from bounds span
    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;
    const maxSpan = Math.max(lngSpan, latSpan);
    // Rough heuristic: at zoom 16, ~0.005 degrees fits nicely
    const zoom = maxSpan > 0 ? Math.min(18, Math.max(12, Math.log2(0.01 / maxSpan) + 16)) : 16;

    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom,
      pitch: 0,
      bearing: 0,
    };
  }, [mission.flightPath]);

  // Full planned flight path GeoJSON
  const plannedPathGeoJSON = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: mission.flightPath,
      },
    }),
    [mission.flightPath]
  );

  // Completed flight path GeoJSON (slice based on playbackProgress)
  const completedPathGeoJSON = useMemo(() => {
    const totalPoints = mission.flightPath.length;
    const completedCount = Math.min(
      Math.ceil(playbackProgress * (totalPoints - 1)) + 1,
      totalPoints
    );
    const completedCoords = mission.flightPath.slice(0, completedCount);

    // If progress is between two points, interpolate to the exact position
    if (playbackProgress > 0 && completedCount < totalPoints) {
      const progressIndex = Math.floor(playbackProgress * (totalPoints - 1));
      const fraction = playbackProgress * (totalPoints - 1) - progressIndex;
      if (fraction > 0 && progressIndex < totalPoints - 1) {
        const from = mission.flightPath[progressIndex];
        const to = mission.flightPath[progressIndex + 1];
        const interpLng = from[0] + (to[0] - from[0]) * fraction;
        const interpLat = from[1] + (to[1] - from[1]) * fraction;
        completedCoords.push([interpLng, interpLat]);
      }
    }

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: completedCoords,
      },
    };
  }, [mission.flightPath, playbackProgress]);

  // Drone position interpolated along the flight path
  const dronePosition = useMemo(() => {
    if (playbackProgress <= 0) return null;

    const totalPoints = mission.flightPath.length;
    const progressIndex = Math.min(
      Math.floor(playbackProgress * (totalPoints - 1)),
      totalPoints - 2
    );
    const fraction = playbackProgress * (totalPoints - 1) - progressIndex;
    const from = mission.flightPath[progressIndex];
    const to = mission.flightPath[Math.min(progressIndex + 1, totalPoints - 1)];

    return {
      longitude: from[0] + (to[0] - from[0]) * fraction,
      latitude: from[1] + (to[1] - from[1]) * fraction,
    };
  }, [mission.flightPath, playbackProgress]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <Map
        initialViewState={initialViewState}
        mapStyle={DEFAULT_MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor={cursor}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Full planned flight path - dashed amber */}
        <Source id="planned-path" type="geojson" data={plannedPathGeoJSON}>
          <Layer
            id="planned-path-line"
            type="line"
            paint={{
              'line-color': '#F59E0B',
              'line-width': 2,
              'line-opacity': 0.3,
              'line-dasharray': [4, 4],
            }}
          />
        </Source>

        {/* Completed flight path - solid amber */}
        <Source id="completed-path" type="geojson" data={completedPathGeoJSON}>
          <Layer
            id="completed-path-line"
            type="line"
            paint={{
              'line-color': '#F59E0B',
              'line-width': 2.5,
              'line-opacity': 0.8,
            }}
          />
        </Source>

        {/* Waypoint markers */}
        {mission.waypoints.map((wp, i) => {
          const cp = checkpoints.find((c) => c.id === wp.checkpointId);
          const color = cp ? STATUS_COLORS[cp.status] : '#6B7280';
          const isCurrent = i === currentWaypointIndex;
          const isPast = i < currentWaypointIndex;

          return (
            <Marker
              key={wp.number}
              longitude={wp.lng}
              latitude={wp.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelectWaypoint(i);
              }}
            >
              <div
                className="relative cursor-pointer"
                style={{ opacity: isPast && !isCurrent ? 0.6 : 1 }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                {/* Pulsing ring for current waypoint */}
                {isCurrent && (
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: color,
                      opacity: 0.4,
                    }}
                  />
                )}

                {/* Waypoint circle */}
                <div
                  className="rounded-full border-2 border-black/40"
                  style={{
                    width: isCurrent ? 14 : 10,
                    height: isCurrent ? 14 : 10,
                    backgroundColor: color,
                    transition: 'width 150ms, height 150ms',
                    boxShadow: isCurrent
                      ? `0 0 6px ${color}80`
                      : '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                />
              </div>
            </Marker>
          );
        })}

        {/* Animated drone marker */}
        {dronePosition && (
          <Marker
            longitude={dronePosition.longitude}
            latitude={dronePosition.latitude}
            anchor="center"
          >
            <div className="relative">
              {/* Shadow / glow */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: 'rgba(245, 158, 11, 0.3)',
                }}
              />
              {/* Drone body */}
              <div
                className="flex items-center justify-center rounded-full border-2 border-amber-300"
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: '#F59E0B',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
                }}
              >
                <span className="text-[8px] font-bold text-black leading-none">
                  &#9650;
                </span>
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Bottom-left label */}
      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[9px] text-white/70 font-mono pointer-events-none z-10">
        {mission.waypoints.length} waypoints &middot; {mission.flightPath.length} path points
      </div>

      {/* Compass */}
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/50 pointer-events-none z-10">
        N ↑
      </div>
    </div>
  );
}
