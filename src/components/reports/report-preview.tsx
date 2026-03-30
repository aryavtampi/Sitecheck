'use client';

import { useEffect } from 'react';
import { useReportStore } from '@/stores/report-store';
import { reportSections } from '@/data/report-template';
import { EditableSection } from '@/components/reports/editable-section';
import { SignatureBlock } from '@/components/reports/signature-block';

export function ReportPreview() {
  const { sections, setSections, updateSection, signed, signedBy, signedDate, sign, unsign } =
    useReportStore();

  useEffect(() => {
    if (sections.length === 0) {
      setSections(reportSections);
    }
  }, [sections.length, setSections]);

  const displaySections = sections.length > 0 ? sections : reportSections;

  return (
    <div className="mx-auto w-full max-w-[800px]">
      {/* Paper-on-dark styling */}
      <div
        className="rounded-sm border border-black/10 shadow-2xl"
        style={{ backgroundColor: '#F5F5F0' }}
      >
        {/* Report Header */}
        <div className="border-b border-neutral-300 px-4 py-6 sm:px-10 sm:py-8">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              California Construction General Permit
            </p>
            <h1 className="mt-2 text-xl font-bold tracking-wide text-neutral-800">
              Site Inspection Report
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Riverside Commercial — Phase 2
            </p>
            <div className="mx-auto mt-3 h-px w-24 bg-neutral-300" />
            <p className="mt-2 text-xs text-neutral-400">
              Report ID: RPT-2026-03-28-001
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="px-4 py-6 sm:px-10 sm:py-8">
          {displaySections.map((section) => (
            <EditableSection
              key={section.id}
              section={section}
              onSave={(content) => updateSection(section.id, content)}
            />
          ))}
        </div>

        {/* Signature Block */}
        <div className="border-t border-neutral-300 px-4 py-6 sm:px-10 sm:py-8">
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
