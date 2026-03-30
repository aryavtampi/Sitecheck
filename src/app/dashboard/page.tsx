'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProjectStatusHeader } from '@/components/dashboard/project-status-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { CheckCircle, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { PageTransition } from '@/components/shared/page-transition';

const SiteOverviewMap = dynamic(
  () => import('@/components/dashboard/site-overview-map').then((m) => ({ default: m.SiteOverviewMap })),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-lg bg-muted" />,
  }
);

export default function DashboardPage() {
  return (
    <PageTransition>
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-wide">Command Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time overview of site compliance and inspection status
        </p>
      </div>

      {/* Project Status Bar */}
      <ProjectStatusHeader />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/checkpoints" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
          <MetricCard
            title="BMP Checkpoints"
            value={34}
            icon={CheckCircle}
            subtitle="Extracted from SWPPP v3.1"
            accentColor="text-amber-500"
          />
        </Link>
        <Link href="/reports" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
          <MetricCard
            title="Compliance Rate"
            value={91}
            suffix="%"
            icon={TrendingUp}
            trend={{ value: 3, positive: true }}
            accentColor="text-green-500"
          />
        </Link>
        <Link href="/missions" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
          <MetricCard
            title="Days Since Inspection"
            value={3}
            icon={Calendar}
            subtitle="Post-Storm — Mar 26, 2026"
            accentColor="text-blue-400"
          />
        </Link>
        <Link href="/checkpoints" className="block hover:ring-1 hover:ring-amber-500/30 rounded-lg transition-all">
          <MetricCard
            title="Active Deficiencies"
            value={3}
            icon={AlertTriangle}
            subtitle="72-hour correction window active"
            accentColor="text-red-500"
          />
        </Link>
      </div>

      {/* Map + Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
