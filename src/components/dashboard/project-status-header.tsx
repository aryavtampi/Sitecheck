'use client';

import { useEffect } from 'react';
import { Shield, User, FileText, Cloud, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/stores/project-store';
import { usePermitsStore } from '@/stores/permits-store';
import type { SegmentPermit } from '@/types/permit';

const EMPTY_PERMITS: SegmentPermit[] = [];

export function ProjectStatusHeader({ compact }: { compact?: boolean }) {
  const project = useProjectStore((s) => s.currentProject());
  const projectId = useProjectStore((s) => s.currentProjectId);
  // Select raw value so the reference is stable across renders.
  const permitsForProject = usePermitsStore((s) => s.permitsByProject[projectId]);
  const permits = permitsForProject ?? EMPTY_PERMITS;
  const fetchPermits = usePermitsStore((s) => s.fetchPermits);

  useEffect(() => {
    if (project?.projectType === 'linear' && projectId) {
      fetchPermits(projectId);
    }
  }, [project?.projectType, projectId, fetchPermits]);

  const expiringPermits = permits.filter((p) => p.status === 'expiring' || p.status === 'expired');

  const riskLabel = `RL-${project?.riskLevel ?? 2}`;
  const qspDisplay = compact
    ? (project?.qsp?.name?.split(' ').map((n, i) => i === 0 ? n.charAt(0) + '.' : n).join(' ') ?? 'N/A')
    : `${project?.qsp?.name ?? 'N/A'}, QSP #${project?.qsp?.licenseNumber?.replace('QSP-', '') ?? ''}`;
  const permitNumber = project?.permitNumber ?? 'N/A';
  const isActive = project?.status === 'active';

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2 py-1.5">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Risk</span>
          <Badge variant="outline" className="border-border bg-surface text-foreground text-[11px] font-data px-1.5 py-0">{riskLabel}</Badge>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2 py-1.5">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">QSP</span>
          <span className="text-[11px] text-foreground truncate">{qspDisplay}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2 py-1.5">
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span className="font-data text-[11px] text-foreground">{permitNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2 py-1.5">
          <Cloud className="h-3 w-3 text-muted-foreground" />
          <span className="font-data text-[11px] text-foreground">72°F</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 rounded-lg border border-border bg-surface-elevated px-5 py-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Risk level</span>
        <Badge variant="outline" className="border-border bg-surface text-foreground text-xs font-data">
          {riskLabel}
        </Badge>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">QSP</span>
        <span className="text-xs text-foreground">{qspDisplay}</span>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">CGP permit</span>
        <span className="font-data text-xs text-foreground">{permitNumber}</span>
        <Badge variant="outline" className={isActive ? 'border-status-compliant/20 bg-status-compliant-bg text-status-compliant text-xs font-medium' : 'border-border bg-muted text-muted-foreground text-xs font-medium'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Weather</span>
        <span className="text-xs text-foreground">Partly cloudy, <span className="font-data">72°F</span></span>
      </div>
      {expiringPermits.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-warning" />
            <Badge
              variant="outline"
              className="border-status-warning/20 bg-status-warning-bg text-status-warning text-xs font-medium"
            >
              {expiringPermits.length} permit{expiringPermits.length !== 1 ? 's' : ''} expiring
            </Badge>
          </div>
        </>
      )}
    </div>
  );
}
