import { Clock, Battery, Plane, Camera, Thermometer, Wind } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DroneMission } from '@/types/drone';
import { WEATHER_ICONS } from '@/lib/constants';
import { formatDate } from '@/lib/format';

interface MissionCardProps {
  mission: DroneMission;
}

const statusConfig = {
  planned: { label: 'Planned', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'in-progress': { label: 'In Progress', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  completed: { label: 'Completed', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export function MissionCard({ mission }: MissionCardProps) {
  const config = statusConfig[mission.status];
  const weatherIcon = WEATHER_ICONS[mission.weatherAtFlight.condition] || '';
  const capturedCount = mission.waypoints.filter((w) => w.captureStatus === 'captured').length;

  return (
    <Card className="border-border bg-surface">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground">
              {mission.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(mission.date)} &middot; {mission.inspectionType.replace('-', ' ')}
            </p>
          </div>
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <Clock className="mx-auto h-4 w-4 text-amber-500" />
            <p className="mt-1 font-heading text-lg font-bold text-foreground">
              {mission.flightTimeMinutes}
            </p>
            <p className="text-[10px] text-muted-foreground">min flight</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <Plane className="mx-auto h-4 w-4 text-blue-400" />
            <p className="mt-1 font-heading text-lg font-bold text-foreground">
              {mission.altitude}
            </p>
            <p className="text-[10px] text-muted-foreground">ft altitude</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <Camera className="mx-auto h-4 w-4 text-green-400" />
            <p className="mt-1 font-heading text-lg font-bold text-foreground">
              {capturedCount}/{mission.waypoints.length}
            </p>
            <p className="text-[10px] text-muted-foreground">captured</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <Battery className="mx-auto h-4 w-4 text-cyan-400" />
            <p className="mt-1 font-heading text-lg font-bold text-foreground">
              {mission.batteryStart}→{mission.batteryEnd}%
            </p>
            <p className="text-[10px] text-muted-foreground">battery</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 pt-3 text-xs text-muted-foreground">
          <span>{weatherIcon} {mission.weatherAtFlight.temperature}°F</span>
          <span>
            <Wind className="inline h-3 w-3" /> {mission.weatherAtFlight.windSpeedMph} mph
          </span>
          <span>Humidity {mission.weatherAtFlight.humidity}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
