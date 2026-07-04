'use client';

import { useEffect } from 'react';
import { useReportStore } from '@/stores/report-store';
import { useProjectStore } from '@/stores/project-store';
import { EditableSection } from '@/components/reports/editable-section';
import { SignatureBlock } from '@/components/reports/signature-block';

export function ReportPreview() {
  const { sections, setSections, updateSection, signed, signedBy, signedDate, sign, unsign, loading, generateReport } =
    useReportStore();
  const currentProject = useProjectStore((s) => s.currentProject());
  const isLinear = currentProject?.projectType === 'linear';
  const reportTitle = isLinear ? 'Corridor Inspection Report' : 'Site Inspection Report';
  const projectDisplayName = currentProject?.name ?? 'Riverside Commercial — Phase 2';

  useEffect(() => {
    if (sections.length === 0) {
      generateReport();
    }
  }, [sections.length, generateReport]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[800px]">
        <div className="rounded-lg border border-border bg-surface p-10 text-center shadow-sm">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Generating report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[800px]">
      {/* Report document */}
      <div className="rounded-lg border border-border bg-surface shadow-sm">
        {/* Report header */}
        <div className="border-b border-border px-4 py-6 sm:px-10 sm:py-8">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground">
              California Construction General Permit
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {reportTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {projectDisplayName}
            </p>
            <div className="mx-auto mt-3 h-px w-24 bg-border" />
            <p className="mt-2 text-xs text-muted-foreground">
              Report ID: <span className="font-data">RPT-2026-03-28-001</span>
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="px-4 py-6 sm:px-10 sm:py-8">
          {sections.map((section) => (
            <EditableSection
              key={section.id}
              section={section}
              onSave={(content) => updateSection(section.id, content)}
            />
          ))}
        </div>

        {/* Signature block */}
        <div className="border-t border-border px-4 py-6 sm:px-10 sm:py-8">
          <SignatureBlock
            signed={signed}
            signedBy={signedBy}
            signedDate={signedDate}
            onSign={sign}
            onUnsign={unsign}
          />
        </div>
      </div>
    </div>
  );
}
