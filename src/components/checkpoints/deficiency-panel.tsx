'use client';

import { AlertTriangle, BookOpen, Calendar, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CountdownTimer } from '@/components/checkpoints/countdown-timer';
import { Deficiency } from '@/types/deficiency';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface DeficiencyPanelProps {
  deficiency: Deficiency;
}

const deficiencyStatusConfig: Record<
  Deficiency['status'],
  { label: string; className: string }
> = {
  open: {
    label: 'Open',
    className: 'bg-status-deficient-bg text-status-deficient border-status-deficient/20',
  },
  'in-progress': {
    label: 'In progress',
    className: 'bg-status-warning-bg text-status-warning border-status-warning/20',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-status-compliant-bg text-status-compliant border-status-compliant/20',
  },
};

export function DeficiencyPanel({ deficiency }: DeficiencyPanelProps) {
  const statusConfig = deficiencyStatusConfig[deficiency.status];

  return (
    <Card className="border-status-deficient/20 bg-surface">
      <CardContent className="space-y-5 pt-4">
        {/* Header: ID + Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-deficient" />
            <span className="font-data text-sm font-medium text-status-deficient">
              {deficiency.id}
            </span>
          </div>
          <Badge variant="outline" className={cn('font-medium', statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Description
          </h4>
          <p className="text-sm text-foreground leading-relaxed">
            {deficiency.description}
          </p>
        </div>

        {/* CGP Violation */}
        <div className="rounded-lg border border-status-deficient/20 bg-status-deficient-bg p-4">
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-status-deficient" />
            <div>
              <h4 className="text-xs font-medium text-status-deficient mb-1">
                CGP violation
              </h4>
              <p className="text-sm text-foreground">{deficiency.cgpViolation}</p>
            </div>
          </div>
        </div>

        {/* Corrective Action */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            <h4 className="text-xs font-medium text-muted-foreground">
              Corrective action required
            </h4>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {deficiency.correctiveAction}
          </p>
        </div>

        {/* Deadline with Countdown */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-3">
            Correction deadline
          </h4>
          <CountdownTimer deadline={deficiency.deadline} />
        </div>

        {/* Detected date */}
        <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Detected <span className="font-data">{formatDate(deficiency.detectedDate)}</span>
          </span>
        </div>

        {/* Resolved info */}
        {deficiency.status === 'resolved' && deficiency.resolvedDate && (
          <div className="rounded-lg border border-status-compliant/20 bg-status-compliant-bg p-3">
            <p className="text-xs font-medium text-status-compliant mb-1">
              Resolved <span className="font-data">{formatDate(deficiency.resolvedDate)}</span>
            </p>
            {deficiency.resolvedNotes && (
              <p className="text-sm text-foreground">{deficiency.resolvedNotes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
