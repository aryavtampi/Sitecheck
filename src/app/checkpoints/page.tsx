'use client';

import { SectionHeader } from '@/components/shared/section-header';
import { CheckpointFilters } from '@/components/checkpoints/checkpoint-filters';
import { CheckpointGrid } from '@/components/checkpoints/checkpoint-grid';
import { PageTransition } from '@/components/shared/page-transition';

export default function CheckpointsPage() {
  return (
    <PageTransition>
    <div className="flex flex-col gap-6 p-6">
      <SectionHeader
        title="Checkpoint Inspector"
        description="AI-powered BMP monitoring across 34 control points"
      />
      <CheckpointFilters />
      <CheckpointGrid />
    </div>
    </PageTransition>
  );
}
