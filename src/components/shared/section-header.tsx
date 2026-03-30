import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, description, className, action }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h2 className="font-heading text-xl font-semibold tracking-wide text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
