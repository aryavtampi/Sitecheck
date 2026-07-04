'use client';

import { useEffect } from 'react';
import { Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeatherStore } from '@/stores/weather-store';
import { WEATHER_ICONS } from '@/lib/constants';

export function CurrentConditions() {
  const current = useWeatherStore((s) => s.current);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);

  useEffect(() => {
    if (!current) fetchWeather();
  }, [current, fetchWeather]);

  if (!current) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="pt-4">
          <div className="h-32 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const icon = WEATHER_ICONS[current.condition] || '🌤️';
  const conditionLabel = current.condition
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <Card className="border-border bg-surface">
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{icon}</div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-data text-4xl font-semibold tracking-tight text-foreground">
                {current.temperature}°
              </span>
              <span className="text-sm text-muted-foreground">F</span>
            </div>
            <p className="text-sm text-muted-foreground">{conditionLabel}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3 text-center">
            <Wind className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-data text-lg font-semibold text-foreground">
              {current.windSpeedMph}
            </p>
            <p className="text-[11px] text-muted-foreground">mph wind</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <Droplets className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-data text-lg font-semibold text-foreground">
              {current.humidity}%
            </p>
            <p className="text-[11px] text-muted-foreground">humidity</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <Eye className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 text-lg font-semibold text-foreground">Good</p>
            <p className="text-[11px] text-muted-foreground">visibility</p>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          Fresno, CA — March 29, 2026 — Updated hourly
        </p>
      </CardContent>
    </Card>
  );
}
