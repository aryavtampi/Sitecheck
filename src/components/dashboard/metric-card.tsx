'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  /** Optional status color for the value, e.g. 'text-status-deficient'.
      Omit for neutral metrics — color is reserved for status semantics. */
  accentColor?: string;
  decimals?: number;
  compact?: boolean;
}

export function MetricCard({
  title,
  value,
  suffix = '',
  prefix = '',
  subtitle,
  icon: Icon,
  trend,
  accentColor,
  decimals = 0,
  compact,
}: MetricCardProps) {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Card className="border-border bg-surface transition-colors hover:border-input">
      <CardContent className={cn('p-5', compact && 'p-3')}>
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('text-[13px] font-medium text-muted-foreground', compact && 'text-[11px]')}>
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span
                className={cn(
                  'font-data text-[28px] font-semibold leading-none',
                  accentColor ?? 'text-foreground',
                  compact && 'text-xl'
                )}
              >
                {prefix}
                {formatted}
                {suffix}
              </span>
            </div>
            {subtitle && !compact && (
              <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && !compact && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    'font-data text-xs font-medium',
                    trend.positive ? 'text-status-compliant' : 'text-status-deficient'
                  )}
                >
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-md bg-muted p-2', compact && 'p-1')}>
            <Icon className={cn('h-4 w-4 text-muted-foreground', compact && 'h-3.5 w-3.5')} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
