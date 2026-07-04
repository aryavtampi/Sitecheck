'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Plane,
  CheckCircle,
  ClipboardCheck,
  FileBarChart,
  CloudRain,
  RotateCcw,
  Waypoints,
  ShieldAlert,
} from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useProjectStore } from '@/stores/project-store';

const baseNavItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/swppp', icon: FileText, label: 'SWPPP' },
  { href: '/missions', icon: Plane, label: 'Missions' },
  { href: '/checkpoints', icon: CheckCircle, label: 'Checkpoints' },
  { href: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
  { href: '/reports', icon: FileBarChart, label: 'Reports' },
  { href: '/weather', icon: CloudRain, label: 'Weather' },
];

export function Sidebar() {
  const pathname = usePathname();
  const project = useProjectStore((s) => s.currentProject());
  const navItems =
    project?.projectType === 'linear'
      ? [
          ...baseNavItems.slice(0, 4),
          { href: '/crossings', icon: Waypoints, label: 'Crossings' },
          { href: '/nofly-zones', icon: ShieldAlert, label: 'No-fly zones' },
          ...baseNavItems.slice(4), // Inspections, Reports, Weather
        ]
      : baseNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar sm:flex">
      {/* Logo area */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
            <CheckCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            SiteCheck
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version info + Restart tour */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => useOnboardingStore.getState().resetOnboarding()}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restart tour
        </button>
        <p className="mt-1 px-2 font-data text-[11px] text-muted-foreground/70">
          v0.1.0
        </p>
      </div>
    </aside>
  );
}
