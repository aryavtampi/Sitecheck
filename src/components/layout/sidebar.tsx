'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Plane,
  CheckCircle,
  FileBarChart,
  CloudRain,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/swppp', icon: FileText, label: 'SWPPP Intelligence' },
  { href: '/missions', icon: Plane, label: 'Drone Missions' },
  { href: '/checkpoints', icon: CheckCircle, label: 'Checkpoints' },
  { href: '/reports', icon: FileBarChart, label: 'Reports' },
  { href: '/weather', icon: CloudRain, label: 'Weather' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col border-r border-border bg-[#0A0A0A] transition-all duration-300 hover:w-56 sm:flex group/sidebar">
      {/* Logo area */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500 font-heading text-sm font-bold text-black">
            SC
          </div>
          <span className="whitespace-nowrap font-heading text-sm font-semibold tracking-wider text-amber-500 opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
            SITECHECK
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-all duration-200',
                isActive
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-amber-500' : ''
                )}
              />
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute left-0 h-6 w-0.5 rounded-r bg-amber-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Version info */}
      <div className="border-t border-border p-3">
        <p className="text-center text-[10px] text-muted-foreground opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
          v0.1.0 — Demo
        </p>
      </div>
    </aside>
  );
}
