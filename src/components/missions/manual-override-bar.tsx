'use client';

import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ManualOverrideBarProps {
  onResumeMission: () => void;
  disabled?: boolean;
}

export function ManualOverrideBar({ onResumeMission, disabled }: ManualOverrideBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 animate-pulse" />
        <div>
          <p className="text-xs font-semibold text-amber-300">MANUAL OVERRIDE ACTIVE</p>
          <p className="text-[10px] text-amber-400/70">
            Drone is under manual RC control. Mission route is paused.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
        onClick={onResumeMission}
        disabled={disabled}
      >
        Resume Mission <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
