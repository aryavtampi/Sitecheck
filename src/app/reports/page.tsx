'use client';

import { SectionHeader } from '@/components/shared/section-header';
import { ReportPreview } from '@/components/reports/report-preview';
import { ExportControls } from '@/components/reports/export-controls';
import { PageTransition } from '@/components/shared/page-transition';

export default function ReportsPage() {
  return (
    <PageTransition>
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Report Generator"
          description="CGP-compliant inspection report with AI-generated content"
        />
        <ExportControls />
      </div>

      <ReportPreview />
    </div>
    </PageTransition>
  );
}
