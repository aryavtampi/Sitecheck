'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accentColor?: string;
  decimals?: number;
}

export function MetricCard({
  title,
  value,
  suffix = '',
  prefix = '',
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'text-amber-500',
  decimals = 0,
}: MetricCardProps) {
  return (
    <Card className="border-border bg-surface hover:bg-surface-elevated transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={cn('font-heading text-3xl font-bold', accentColor)}>
                {prefix}
                <CountUp end={value} duration={2} decimals={decimals} />
                {suffix}
              </span>
            </div>
            {subtitle && (
              <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.positive ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {trend.positive ? '\u2191' : '\u2193'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-md p-2', accentColor === 'text-amber-500' ? 'bg-amber-500/10' : 'bg-muted')}>
            <Icon className={cn('h-5 w-5', accentColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
