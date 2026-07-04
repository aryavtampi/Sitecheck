'use client';

import { Building2, Waypoints } from 'lucide-react';
import type { ProjectType } from '@/types/project';

interface ProjectTypeSelectorProps {
  value: ProjectType;
  onChange: (type: ProjectType) => void;
}

export function ProjectTypeSelector({ value, onChange }: ProjectTypeSelectorProps) {
  const options: Array<{
    type: ProjectType;
    label: string;
    description: string;
    icon: typeof Building2;
  }> = [
    {
      type: 'bounded-site',
      label: 'Bounded site',
      description:
        'A traditional construction site with defined boundaries — commercial, residential, industrial, or land-development.',
      icon: Building2,
    },
    {
      type: 'linear',
      label: 'Linear infrastructure',
      description:
        'A long, narrow corridor — pipeline, transmission line, road, or rail. Uses centerline geometry, segments, and stationing.',
      icon: Waypoints,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.type;
        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => onChange(opt.type)}
            className={`text-left rounded-lg border p-5 transition-all ${
              selected
                ? 'border-primary/60 bg-accent ring-2 ring-ring/30'
                : 'border-border bg-surface hover:border-primary/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${
                  selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{opt.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
