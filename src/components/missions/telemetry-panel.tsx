'use client';

import {
  Compass,
  Gauge,
  Mountain,
  Battery,
  Wifi,
  Satellite,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDroneStore } from '@/stores/drone-store';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function compassCardinal(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function batteryColor(pct: number): string {
  if (pct > 30) return 'text-status-compliant';
  if (pct > 15) return 'text-status-warning';
  return 'text-status-deficient';
}

function signalColor(pct: number): string {
  if (pct > 70) return 'text-status-compliant';
  if (pct > 40) return 'text-status-warning';
  return 'text-status-deficient';
}

export function TelemetryPanel() {
  const telemetry = useDroneStore((s) => s.telemetry);
  const [stale, setStale] = useState(false);

  // Detect stale telemetry (>3s since last update)
  useEffect(() => {
    if (!telemetry) {
      setStale(false);
      return;
    }
    const checkStale = setInterval(() => {
      const age = Date.now() - new Date(telemetry.timestamp).getTime();
      setStale(age > 3000);
    }, 1000);
    return () => clearInterval(checkStale);
  }, [telemetry]);

  if (!telemetry) return null;

  return (
    <Card className="border-border bg-surface">
      <CardContent className="pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold tracking-tight text-foreground">Telemetry</p>
          {stale ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-status-deficient/20 bg-status-deficient-bg px-2 py-0.5 text-[11px] font-medium text-status-deficient">
              <AlertTriangle className="h-3 w-3" />
              Signal lost
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-status-compliant/20 bg-status-compliant-bg px-2 py-0.5 text-[11px] font-medium text-status-compliant">
              <span className="h-1.5 w-1.5 rounded-full bg-status-compliant" />
              Live
            </span>
          )}
        </div>

        {/* Readout grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Position */}
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Position</span>
            </div>
            <p className="font-data text-[11px] text-foreground leading-tight">
              {telemetry.lat.toFixed(6)}
            </p>
            <p className="font-data text-[11px] text-foreground leading-tight">
              {telemetry.lng.toFixed(6)}
            </p>
          </div>

          {/* Altitude */}
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="flex items-center gap-1 mb-1">
              <Mountain className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Altitude</span>
            </div>
            <p className="font-data text-sm font-semibold text-foreground">
              {telemetry.altitudeFeet} <span className="text-[11px] font-normal text-muted-foreground">ft AGL</span>
            </p>
          </div>

          {/* Speed */}
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="flex items-center gap-1 mb-1">
              <Gauge className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Speed</span>
            </div>
            <p className="font-data text-sm font-semibold text-foreground">
              {telemetry.speedMph} <span className="text-[11px] font-normal text-muted-foreground">mph</span>
            </p>
          </div>

          {/* Heading */}
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="flex items-center gap-1 mb-1">
              <Compass className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Heading</span>
            </div>
            <p className="font-data text-sm font-semibold text-foreground">
              {telemetry.headingDeg}° <span className="text-[11px] font-normal text-muted-foreground">{compassCardinal(telemetry.headingDeg)}</span>
            </p>
          </div>

          {/* Battery */}
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="flex items-center gap-1 mb-1">
              <Battery className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Battery</span>
            </div>
            <p className={cn('font-data text-sm font-semibold', batteryColor(telemetry.batteryPercent))}>
              {telemetry.batteryPercent}%
            </p>
          </div>

          {/* Signal */}
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="flex items-center gap-1 mb-1">
              <Wifi className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Signal</span>
            </div>
            <p className={cn('font-data text-sm font-semibold', signalColor(telemetry.signalStrengthPercent))}>
              {telemetry.signalStrengthPercent}%
            </p>
          </div>

          {/* GPS */}
          <div className="rounded-md border border-border bg-background/50 p-2 sm:col-span-2">
            <div className="flex items-center gap-1 mb-1">
              <Satellite className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">GPS satellites</span>
            </div>
            <p className="font-data text-sm font-semibold text-foreground">
              {telemetry.gpsSatellites} <span className="text-[11px] font-normal text-muted-foreground">locked</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
