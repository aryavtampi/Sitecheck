'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { ProjectStatusHeader } from '@/components/dashboard/project-status-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { CheckCircle, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { PageTransition } from '@/components/shared/page-transition';
import { useAppMode } from '@/hooks/use-app-mode';
import { useProjectStore } from '@/stores/project-store';
import { cn } from '@/lib/utils';

const SiteOverviewMap = dynamic(
  () => import('@/components/dashboard/site-overview-map').then((m) => ({ default: m.SiteOverviewMap })),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-lg bg-muted" />,
  }
);

interface DashboardMetrics {
  totalCheckpoints: number;
  complianceRate: number;
  daysSinceInspection: number | null;
  lastInspectionType: string | null;
  lastInspectionDate: string | null;
  activeDeficiencies: number;
  checkpointsByStatus: { compliant: number; deficient: number; needsReview: number };
}

function formatInspectionType(type: string | null): string {
  if (!type) return 'N/A';
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export default function DashboardPage() {
  const { isApp } = useAppMode();
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/metrics?projectId=${currentProjectId}`)
      .then((res) => res.json())
      .then((data) => { setMetrics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentProjectId]);

  const inspectionSubtitle = metrics?.lastInspectionType && metrics?.lastInspectionDate
    ? `${formatInspectionType(metrics.lastInspectionType)} — ${format(new Date(metrics.lastInspectionDate), 'MMM d, yyyy')}`
    : '';

  return (
    <PageTransition>
    <div className={cn('space-y-6 p-6', isApp && 'space-y-3 p-3')}>
      {/* Page Header */}
      <div>
        <h1 className={cn('font-heading text-2xl font-bold tracking-wide', isApp && 'text-lg')}>Command Dashboard</h1>
        {!isApp && (
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time overview of site compliance and inspection status
          </p>
        )}
      </div>

      {/* Project Status Bar */}
      <ProjectStatusHeader compact={isApp} />

      {/* Metric Cards */}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', isApp && 'grid-cols-2 gap-2')}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', isApp && 'grid-cols-2 gap-2')}>
          <Link href="/checkpoints" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
            <MetricCard
              title="BMP Checkpoints"
              value={metrics?.totalCheckpoints ?? 0}
              icon={CheckCircle}
              subtitle="Extracted from SWPPP v3.1"
              accentColor="text-amber-500"
              compact={isApp}
            />
          </Link>
          <Link href="/reports" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
            <MetricCard
              title="Compliance Rate"
              value={metrics?.complianceRate ?? 0}
              suffix="%"
              icon={TrendingUp}
              trend={{ value: 3, positive: true }}
              accentColor="text-green-500"
              compact={isApp}
            />
          </Link>
          <Link href="/missions" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
            <MetricCard
              title="Days Since Inspection"
              value={metrics?.daysSinceInspection ?? 0}
              icon={Calendar}
              subtitle={inspectionSubtitle}
              accentColor="text-blue-400"
              compact={isApp}
            />
          </Link>
          <Link href="/checkpoints" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
            <MetricCard
              title="Active Deficiencies"
              value={metrics?.activeDeficiencies ?? 0}
              icon={AlertTriangle}
              subtitle="72-hour correction window active"
              accentColor="text-red-500"
              compact={isApp}
            />
          </Link>
        </div>
      )}

      {/* Map + Activity Feed */}
      <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3', isApp && 'gap-3')}>
        <div className="lg:col-span-2">
          <SiteOverviewMap />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
