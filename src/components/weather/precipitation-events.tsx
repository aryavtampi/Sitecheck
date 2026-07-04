'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWeatherStore } from '@/stores/weather-store';
import { formatDate } from '@/lib/format';
import { CheckCircle, Minus, CloudRain, ExternalLink, AlertTriangle } from 'lucide-react';

export function PrecipitationEvents() {
  const forecast = useWeatherStore((s) => s.forecast);
  const qpEvents = useWeatherStore((s) => s.qpEvents);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);

  useEffect(() => {
    if (forecast.length === 0) fetchWeather();
  }, [forecast.length, fetchWeather]);

  const upcomingQPE = forecast.find((day) => day.isQPE);

  return (
    <Card className="border-border bg-surface">
      <CardHeader>
        <CardTitle className="text-foreground">Precipitation events</CardTitle>
        <CardDescription>
          Qualifying precipitation events and triggered inspections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingQPE && (
            <div className="rounded-lg border border-status-warning/40 bg-status-warning-bg p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-status-warning" />
                <Badge
                  variant="outline"
                  className="border-status-warning/20 bg-status-warning-bg text-status-warning text-[11px] font-medium"
                >
                  <span className="mr-1 h-1.5 w-1.5 shrink-0 rounded-full bg-status-warning" />
                  Upcoming
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground">
                Forecast QPE &mdash; {formatDate(upcomingQPE.date)}
              </p>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="font-data text-2xl font-semibold text-status-warning">
                  {upcomingQPE.precipitationInches}&quot;
                </span>
                <span className="text-xs text-muted-foreground">expected</span>
              </div>
              <p className="mt-2 text-xs text-status-warning">
                Pre-storm inspection required within 48 hours of event. Post-storm inspection
                required within 24 hours after event concludes.
              </p>
            </div>
          )}

          {qpEvents.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg border p-4 ${
                event.totalPrecipitation >= 0.5
                  ? 'border-status-warning/30 bg-status-warning-bg/40'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-data text-xs font-medium text-muted-foreground">{event.id}</span>
                  </div>
                  <p className="mt-1 font-data text-sm text-foreground">
                    {formatDate(event.startDate)} &mdash; {formatDate(event.endDate)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-data text-2xl font-semibold text-foreground">
                    {event.totalPrecipitation}&quot;
                  </span>
                  <p className="text-[11px] text-muted-foreground">total precip</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  {event.inspectionTriggered ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-status-compliant" />
                      <span className="text-xs text-status-compliant">Inspection completed</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        No inspection triggered
                      </span>
                    </>
                  )}
                </div>
                {event.inspectionTriggered && event.inspectionId && (
                  <a
                    href={`/checkpoints?inspection=${event.inspectionId}`}
                    className="flex items-center gap-1 font-data text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {event.inspectionId}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
