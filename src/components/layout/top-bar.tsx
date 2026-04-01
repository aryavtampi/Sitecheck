'use client';

import { Bell, Cloud, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppMode } from '@/hooks/use-app-mode';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { isApp } = useAppMode();

  return (
    <header className={cn(
      'sticky top-0 z-30 flex items-center justify-between border-b border-border bg-[#0A0A0A]/80 backdrop-blur-sm',
      isApp ? 'h-11 px-3' : 'h-14 px-3 sm:px-6'
    )}>
      {/* Project Name */}
      <div className="flex min-w-0 items-center gap-2">
        <h1 className={cn(
          'truncate font-heading font-semibold tracking-wide text-foreground',
          isApp ? 'text-xs' : 'text-sm sm:text-lg'
        )}>
          Riverside Commercial — Phase 2
        </h1>
        {!isApp && (
          <Badge
            variant="outline"
            className="shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs"
          >
            ACTIVE
          </Badge>
        )}
      </div>

      {/* Right side: Weather + Notifications */}
      <div className="flex shrink-0 items-center gap-4">
        {/* Weather Widget — hidden in app mode and on small screens */}
        {!isApp && (
          <div className="hidden items-center gap-4 rounded-md border border-border bg-surface px-3 py-1.5 text-xs md:flex">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Cloud className="h-3.5 w-3.5" />
              <span>Partly Cloudy</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ThermometerSun className="h-3.5 w-3.5" />
              <span>72°F</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wind className="h-3.5 w-3.5" />
              <span>8 mph</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Droplets className="h-3.5 w-3.5" />
              <span>45%</span>
            </div>
          </div>
        )}

        {/* Notification Bell */}
        <button className={cn(
          'relative flex items-center justify-center rounded-md border border-border bg-surface transition-colors hover:bg-surface-elevated',
          isApp ? 'h-7 w-7' : 'h-9 w-9'
        )}>
          <Bell className={cn(isApp ? 'h-3.5 w-3.5' : 'h-4 w-4', 'text-muted-foreground')} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
