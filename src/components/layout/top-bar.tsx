'use client';

import { Bell, Cloud, Droplets, Wind, ThermometerSun, ChevronDown, MapPin, GitBranch, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useAppMode } from '@/hooks/use-app-mode';
import { useDemoSession } from '@/hooks/use-demo-session';
import { useProjectStore } from '@/stores/project-store';
import { useCheckpointStore } from '@/stores/checkpoint-store';
import { useDroneStore } from '@/stores/drone-store';
import { useDemoTourStore } from '@/stores/demo-tour-store';
import { exitDemoSession } from '@/lib/demo/start-demo';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export function TopBar() {
  const router = useRouter();
  const { isApp } = useAppMode();
  const { inDemo } = useDemoSession();
  const exitDemoTour = useDemoTourStore((s) => s.exit);
  const { projects, currentProjectId, setCurrentProject, currentProject: getCurrentProject } = useProjectStore();
  const fetchCheckpoints = useCheckpointStore((s) => s.fetchCheckpoints);
  const fetchMissions = useDroneStore((s) => s.fetchMissions);
  const project = getCurrentProject();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleExitDemo() {
    exitDemoSession();
    exitDemoTour();
    router.push('/login');
    router.refresh();
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSwitch = (id: string) => {
    if (id === currentProjectId) {
      setOpen(false);
      return;
    }
    setCurrentProject(id);
    setOpen(false);
    // Re-fetch project-scoped data
    fetchCheckpoints();
    fetchMissions();
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface',
      isApp ? 'h-11 px-3' : 'h-14 px-3 sm:px-6'
    )}>
      {/* Project switcher */}
      <div className="flex min-w-0 items-center gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              'flex items-center gap-2 rounded-md border border-border bg-surface transition-colors hover:bg-muted',
              isApp ? 'px-2 py-1' : 'px-3 py-1.5'
            )}
          >
            {project?.projectType === 'linear' ? (
              <GitBranch className={cn('shrink-0 text-muted-foreground', isApp ? 'h-3 w-3' : 'h-4 w-4')} />
            ) : (
              <MapPin className={cn('shrink-0 text-muted-foreground', isApp ? 'h-3 w-3' : 'h-4 w-4')} />
            )}
            <h1 className={cn(
              'truncate font-medium text-foreground',
              isApp ? 'text-xs' : 'text-sm'
            )}>
              {project?.name || 'Select project'}
            </h1>
            <ChevronDown className={cn(
              'shrink-0 text-muted-foreground transition-transform',
              isApp ? 'h-3 w-3' : 'h-4 w-4',
              open && 'rotate-180'
            )} />
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[280px] rounded-md border border-border bg-popover shadow-lg">
              <div className="border-b border-border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Projects</p>
              </div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSwitch(p.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted',
                    p.id === currentProjectId && 'bg-muted'
                  )}
                >
                  {p.projectType === 'linear' ? (
                    <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.address}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[11px] text-muted-foreground">
                    {p.projectType === 'linear' ? 'Linear' : 'Site'}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
        {!isApp && (
          <Badge
            variant="outline"
            className={cn(
              'hidden shrink-0 items-center gap-1.5 text-xs font-medium lg:inline-flex',
              project?.status === 'active' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                project?.status === 'active' ? 'bg-status-compliant' : 'bg-muted-foreground/50'
              )}
            />
            {project?.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        )}
      </div>

      {/* Right side: demo indicator, weather, notifications */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Demo session indicator + exit button. The "Demo" label hides on
            narrow viewports to keep the header from wrapping. */}
        {inDemo && (
          <div
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-md border border-primary/30 bg-accent',
              isApp ? 'px-1.5 py-1' : 'px-2.5 py-1'
            )}
          >
            <span
              className={cn(
                'hidden font-medium text-accent-foreground sm:inline',
                isApp ? 'text-[10px]' : 'text-xs'
              )}
            >
              Demo
            </span>
            <span className="hidden h-3 w-px bg-primary/20 sm:inline-block" />
            <button
              onClick={handleExitDemo}
              className={cn(
                'flex items-center gap-1 font-medium text-accent-foreground transition-colors hover:text-primary',
                isApp ? 'text-[10px]' : 'text-xs'
              )}
              aria-label="Exit demo"
            >
              <LogOut className={cn(isApp ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
              Exit demo
            </button>
          </div>
        )}

        {/* Weather summary — hidden in app mode and on small screens */}
        {!isApp && (
          <div className="hidden items-center gap-3 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <div className="flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" />
              <span>Partly cloudy</span>
            </div>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <ThermometerSun className="h-3.5 w-3.5" />
              <span className="font-data">72°F</span>
            </div>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5" />
              <span className="font-data">8 mph</span>
            </div>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5" />
              <span className="font-data">45%</span>
            </div>
          </div>
        )}

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className={cn(
            'relative flex items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            isApp ? 'h-7 w-7' : 'h-9 w-9'
          )}
        >
          <Bell className={cn(isApp ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-data text-[10px] font-medium text-primary-foreground">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
