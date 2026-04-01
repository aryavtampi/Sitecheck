'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RotateCcw } from 'lucide-react';
import { SectionHeader } from '@/components/shared/section-header';
import { ConfidenceIndicator } from '@/components/swppp/confidence-indicator';
import { CheckpointListPanel } from '@/components/swppp/checkpoint-list-panel';
import { UploadZone } from '@/components/swppp/upload-zone';
import { GenerateMissionButton } from '@/components/swppp/generate-mission-button';
import { Button } from '@/components/ui/button';
import { useSwpppStore } from '@/stores/swppp-store';
import { useCheckpointStore } from '@/stores/checkpoint-store';
import { PageTransition } from '@/components/shared/page-transition';

const PdfViewerPanel = dynamic(
  () => import('@/components/swppp/pdf-viewer-panel').then((m) => ({ default: m.PdfViewerPanel })),
  {
    ssr: false,
    loading: () => <div className="h-full animate-pulse rounded-lg bg-muted" />,
  }
);

const CheckpointMapPanel = dynamic(
  () => import('@/components/swppp/checkpoint-map-panel').then((m) => ({ default: m.CheckpointMapPanel })),
  {
    ssr: false,
    loading: () => <div className="h-full animate-pulse rounded-lg bg-muted" />,
  }
);

export default function SwpppPage() {
  const {
    processingStep,
    extractedCheckpoints,
    error,
    reset,
  } = useSwpppStore();

  const checkpoints = useCheckpointStore((s) => s.checkpoints);
  const fetchCheckpoints = useCheckpointStore((s) => s.fetchCheckpoints);

  useEffect(() => {
    if (checkpoints.length === 0) fetchCheckpoints();
  }, [checkpoints.length, fetchCheckpoints]);

  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);

  const isIdle = processingStep === 'idle';
  const isProcessing = ['uploading', 'extracting', 'cross-referencing', 'generating-mission'].includes(processingStep);
  const isComplete = processingStep === 'complete';
  const isError = processingStep === 'error';

  const handleSelectCheckpoint = useCallback((id: string) => {
    setSelectedCheckpointId(id);
    // Navigate PDF to the SWPPP page for this checkpoint (only for static checkpoints)
    const cp = checkpoints.find((c) => c.id === id);
    if (cp) {
      setActivePage(cp.swpppPage);
    }
  }, [checkpoints]);

  return (
    <PageTransition>
      <div className="flex h-full flex-col gap-4 p-4">
        <SectionHeader
          title="SWPPP Intelligence"
          description="Upload your SWPPP document for AI-powered BMP extraction and drone flight path generation"
          action={
            !isIdle ? (
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Upload New
              </Button>
            ) : undefined
          }
        />

        {/* Phase 1: Upload zone */}
        {isIdle && <UploadZone />}

        {/* Phase 2: Processing indicator */}
        {(isProcessing || isComplete || isError) && (
          <ConfidenceIndicator
            processingStep={processingStep}
            checkpointCount={extractedCheckpoints.length}
            error={error}
          />
        )}

        {/* Phase 3: Results panels */}
        {isComplete && (
          <>
            {/* Mission generation button */}
            <GenerateMissionButton />

            {/* Three-panel layout */}
            <div className="grid flex-1 grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/5 bg-white/5 md:grid-cols-2 lg:grid-cols-[1fr_300px_280px]">
              {/* Left: PDF Viewer */}
              <div className="min-h-[300px] overflow-hidden md:col-span-2 lg:col-span-1">
                <PdfViewerPanel
                  activePage={activePage}
                  onPageChange={setActivePage}
                  selectedCheckpointId={selectedCheckpointId}
                />
              </div>

              {/* Middle: Checkpoint List */}
              <div className="overflow-hidden border-t border-white/5 md:border-t-0 md:border-l">
                <CheckpointListPanel
                  selectedCheckpointId={selectedCheckpointId}
                  onSelect={handleSelectCheckpoint}
                  extractedCheckpoints={extractedCheckpoints}
                />
              </div>

              {/* Right: Map */}
              <div className="overflow-hidden border-t border-white/5 md:border-t-0 md:border-l">
                <CheckpointMapPanel
                  selectedCheckpointId={selectedCheckpointId}
                  onSelect={handleSelectCheckpoint}
                  extractedCheckpoints={
                    extractedCheckpoints.length > 0
                      ? extractedCheckpoints.map((cp) => ({
                          id: cp.id,
                          lat: cp.lat,
                          lng: cp.lng,
                          name: cp.name,
                          bmpType: cp.bmpType,
                        }))
                      : undefined
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* Error state: allow retry */}
        {isError && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
