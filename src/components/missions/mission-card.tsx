import { Clock, Battery, Plane, Camera, Thermometer, Wind } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DroneMission } from '@/types/drone';
import { WEATHER_ICONS, MISSION_STATUS_LABELS, MISSION_STATUS_COLORS, MISSION_SCOPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';

interface MissionCardProps {
  mission: DroneMission;
}

// Waypoints that count as "completed" for progress display
const COMPLETED_STATUSES = new Set([
  'captured', 'compliant', 'deficient', 'needs-maintenance',
  'not-visible', 'blocked', 'unsafe', 'ground-follow-up',
]);

export function MissionCard({ mission }: MissionCardProps) {
  const statusColor = MISSION_STATUS_COLORS[mission.status];
  const statusLabel = MISSION_STATUS_LABELS[mission.status];
  // Hot-fix — `weatherAtFlight` is optional on the persisted record (Block 4
  // missions and freshly-planned missions don't have a flight-time weather
  // snapshot yet). Guard every read so the card still renders.
  const weather = mission.weatherAtFlight;
  const weatherIcon = weather ? WEATHER_ICONS[weather.condition] || '' : '';
  const capturedCount = mission.waypoints.filter((w) => COMPLETED_STATUSES.has(w.captureStatus)).length;

  return (
    <Card className="border-border bg-surface">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {mission.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(mission.date)} &middot; {mission.inspectionType.replace('-', ' ')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
              {statusLabel}
            </Badge>
            {mission.scope && mission.scope !== 'full' && (
              <span className="text-[11px] text-muted-foreground">
                {MISSION_SCOPE_LABELS[mission.scope]}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-muted p-3 text-center">
            <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-data text-lg font-semibold text-foreground">
              {mission.flightTimeMinutes}
            </p>
            <p className="text-[11px] text-muted-foreground">min flight</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <Plane className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-data text-lg font-semibold text-foreground">
              {mission.altitude}
            </p>
            <p className="text-[11px] text-muted-foreground">ft altitude</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <Camera className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-data text-lg font-semibold text-foreground">
              {capturedCount}/{mission.waypoints.length}
            </p>
            <p className="text-[11px] text-muted-foreground">captured</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <Battery className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-data text-lg font-semibold text-foreground">
              {mission.batteryStart}→{mission.batteryEnd}%
            </p>
            <p className="text-[11px] text-muted-foreground">battery</p>
          </div>
        </div>

        {weather ? (
          <div className="flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>{weatherIcon} <span className="font-data">{weather.temperature}°F</span></span>
            <span>
              <Wind className="inline h-3 w-3" /> <span className="font-data">{weather.windSpeedMph} mph</span>
            </span>
            <span>Humidity <span className="font-data">{weather.humidity}%</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <Thermometer className="inline h-3 w-3" />
            <span>No flight-time weather snapshot</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
