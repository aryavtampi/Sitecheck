'use client';

import { Bell, Cloud, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-[#0A0A0A]/80 px-3 backdrop-blur-sm sm:px-6">
      {/* Project Name */}
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate font-heading text-sm font-semibold tracking-wide text-foreground sm:text-lg">
          Riverside Commercial — Phase 2
        </h1>
        <Badge
          variant="outline"
          className="shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs"
        >
          ACTIVE
        </Badge>
      </div>

      {/* Right side: Weather + Notifications */}
      <div className="flex shrink-0 items-center gap-6">
        {/* Weather Widget — hidden on small screens */}
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

        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface transition-colors hover:bg-surface-elevated">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
