'use client';

import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plane, AlertTriangle, FileText, CloudRain, CheckCircle, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/format';
import { ActivityEvent, ActivityType } from '@/types/activity';
import { activityEvents } from '@/data/activity-events';

function getEventHref(event: ActivityEvent): string | null {
  // If the event has a linked entity, route to that specific entity
  if (event.linkedEntityType && event.linkedEntityId) {
    switch (event.linkedEntityType) {
      case 'checkpoint':
        return `/checkpoints/${event.linkedEntityId}`;
      case 'mission':
        return `/missions/${event.linkedEntityId}`;
      case 'inspection':
        return `/reports`;
      case 'project':
        return `/swppp`;
    }
  }

  // For events without a linked entity, route by type
  switch (event.type) {
    case 'weather':
      return '/weather';
    case 'deficiency':
      return '/checkpoints';
    case 'drone':
      return '/missions';
    case 'inspection':
      return '/reports';
    case 'alert':
      return '/checkpoints';
    case 'document':
      return '/swppp';
    default:
      return null;
  }
}

const typeIcons: Record<ActivityType, React.ElementType> = {
  drone: Plane,
  inspection: CheckCircle,
  alert: AlertTriangle,
  weather: CloudRain,
  document: FileText,
  deficiency: AlertCircle,
};

const typeColors: Record<ActivityType, string> = {
  drone: 'text-blue-400 bg-blue-400/10',
  inspection: 'text-green-400 bg-green-400/10',
  alert: 'text-amber-400 bg-amber-400/10',
  weather: 'text-cyan-400 bg-cyan-400/10',
  document: 'text-purple-400 bg-purple-400/10',
  deficiency: 'text-red-400 bg-red-400/10',
};

const severityDot: Record<string, string> = {
  info: 'bg-blue-400',
  warning: 'bg-amber-400',
  critical: 'bg-red-400',
};

export function ActivityFeed() {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-heading text-sm font-semibold tracking-wide">Activity Feed</h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-0 divide-y divide-border">
          {activityEvents.map((event) => {
            const Icon = typeIcons[event.type];
            const colorClass = typeColors[event.type];
            const href = getEventHref(event);

            const content = (
              <div className={cn(
                'flex gap-3 px-4 py-3 hover:bg-surface-elevated transition-colors',
                href && 'cursor-pointer'
              )}>
                <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md', colorClass)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground truncate">{event.title}</p>
                    {event.severity && (
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', severityDot[event.severity])} />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">{formatRelativeTime(event.timestamp)}</p>
                </div>
              </div>
            );

            if (href) {
              return (
                <Link key={event.id} href={href} className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
                  {content}
                </Link>
              );
            }

            return <div key={event.id}>{content}</div>;
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
