'use client';

import { useState, useCallback } from 'react';
import { RotateCcw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RouteEditorMap } from './route-editor-map';
import { WaypointEditor } from './waypoint-editor';
import { generateFlightPath } from '@/lib/flight-path';
import { useAppMode } from '@/hooks/use-app-mode';
import { useProjectStore } from '@/stores/project-store';
import { cn } from '@/lib/utils';
import type { DroneMission, Waypoint } from '@/types/drone';

interface RouteEditorProps {
  mission: DroneMission;
  onSave: (waypoints: Waypoint[], editedFlightPath: [number, number][]) => Promise<void>;
}

export function RouteEditor({ mission, onSave }: RouteEditorProps) {
  const { isApp } = useAppMode();
  const project = useProjectStore((s) => s.currentProject());

  const siteCenter = {
    lat: project?.coordinates.lat ?? 36.7801,
    lng: project?.coordinates.lng ?? -119.4161,
  };

  const [waypoints, setWaypoints] = useState<Waypoint[]>(mission.waypoints);
  const [flightPath, setFlightPath] = useState<[number, number][]>(
    mission.editedFlightPath || mission.flightPath
  );
  const [selectedWp, setSelectedWp] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Regenerate flight path from current enabled waypoints
  const regeneratePath = useCallback((wps: Waypoint[]) => {
    const enabledWps = wps.filter((w) => w.enabled !== false);
    if (enabledWps.length === 0) {
      setFlightPath([[siteCenter.lng, siteCenter.lat]]);
      return;
    }
    const newPath = generateFlightPath(enabledWps, siteCenter);
    setFlightPath(newPath);
    setDirty(true);
  }, [siteCenter]);

  // Toggle a waypoint's enabled state
  const handleToggle = useCallback(
    (waypointNumber: number) => {
      setWaypoints((prev) => {
        const next = prev.map((wp) =>
          wp.number === waypointNumber
            ? { ...wp, enabled: wp.enabled === false ? true : false }
            : wp
        );
        regeneratePath(next);
        return next;
      });
    },
    [regeneratePath]
  );

  // Reorder waypoints
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setWaypoints((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        // Renumber
        const renumbered = next.map((wp, i) => ({ ...wp, number: i + 1, sortOrder: i }));
        regeneratePath(renumbered);
        return renumbered;
      });
    },
    [regeneratePath]
  );

  // Drag waypoint to new position
  const handleDrag = useCallback(
    (waypointNumber: number, lat: number, lng: number) => {
      setWaypoints((prev) => {
        const next = prev.map((wp) =>
          wp.number === waypointNumber ? { ...wp, lat, lng } : wp
        );
        regeneratePath(next);
        return next;
      });
    },
    [regeneratePath]
  );

  // Update waypoint settings (altitude, hover time, capture mode, notes)
  const handleUpdateWaypoint = useCallback(
    (waypointNumber: number, updates: Partial<Waypoint>) => {
      setWaypoints((prev) =>
        prev.map((wp) =>
          wp.number === waypointNumber ? { ...wp, ...updates } : wp
        )
      );
      setDirty(true);
    },
    []
  );

  // Reset to original mission data
  const handleReset = useCallback(() => {
    setWaypoints(mission.waypoints);
    setFlightPath(mission.editedFlightPath || mission.flightPath);
    setDirty(false);
    setSelectedWp(null);
  }, [mission]);

  // Save changes
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(waypoints, flightPath);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [waypoints, flightPath, onSave]);

  return (
    <div className="space-y-4">
      {/* Map + Editor grid */}
      <div
        className={cn(
          'grid gap-4',
          isApp ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'
        )}
      >
        {/* Map — takes more space */}
        <div className={cn(!isApp && 'lg:col-span-3')}>
          <RouteEditorMap
            waypoints={waypoints}
            flightPath={flightPath}
            onWaypointDrag={handleDrag}
            onWaypointToggle={handleToggle}
            selectedWaypoint={selectedWp}
            onSelectWaypoint={setSelectedWp}
          />
        </div>

        {/* Waypoint editor sidebar */}
        <div className={cn(!isApp && 'lg:col-span-2')}>
          <WaypointEditor
            waypoints={waypoints}
            selectedWaypoint={selectedWp}
            onSelectWaypoint={setSelectedWp}
            onToggle={handleToggle}
            onReorder={handleReorder}
            onUpdateWaypoint={handleUpdateWaypoint}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={!dirty}
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Original
        </Button>

        <Button
          size="sm"
          className="gap-1.5"
          disabled={!dirty || saving}
          onClick={handleSave}
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Route
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
