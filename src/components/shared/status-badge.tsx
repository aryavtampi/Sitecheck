import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckpointStatus } from '@/types/checkpoint';

const statusConfig: Record<
  CheckpointStatus,
  { label: string; className: string; dotClassName: string }
> = {
  compliant: {
    label: 'Compliant',
    className: 'border-status-compliant/20 bg-status-compliant-bg text-status-compliant',
    dotClassName: 'bg-status-compliant',
  },
  deficient: {
    label: 'Deficient',
    className: 'border-status-deficient/20 bg-status-deficient-bg text-status-deficient',
    dotClassName: 'bg-status-deficient',
  },
  'needs-review': {
    label: 'Needs review',
    className: 'border-status-review/20 bg-status-review-bg text-status-review',
    dotClassName: 'bg-status-review',
  },
};

interface StatusBadgeProps {
  status: CheckpointStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn('items-center gap-1.5 font-medium', config.className, className)}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dotClassName)} />
      {config.label}
    </Badge>
  );
}
