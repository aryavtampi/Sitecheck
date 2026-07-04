'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, FileSearch, Brain, Shield, Plane, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProcessingStep } from '@/stores/swppp-store';

const STEP_CONFIG: Record<string, { label: string; icon: typeof FileSearch; progress: number }> = {
  uploading: { label: 'Uploading SWPPP document...', icon: FileSearch, progress: 10 },
  extracting: { label: 'Extracting BMP locations...', icon: Brain, progress: 35 },
  'cross-referencing': { label: 'Cross-referencing CGP requirements...', icon: Shield, progress: 70 },
  'generating-mission': { label: 'Generating drone flight path...', icon: Plane, progress: 85 },
  complete: { label: 'Analysis complete', icon: CheckCircle, progress: 100 },
  error: { label: 'Analysis error', icon: AlertCircle, progress: 0 },
};

interface ConfidenceIndicatorProps {
  processingStep: ProcessingStep;
  checkpointCount: number;
  error?: string | null;
}

export function ConfidenceIndicator({ processingStep, checkpointCount, error }: ConfidenceIndicatorProps) {
  const config = STEP_CONFIG[processingStep] || STEP_CONFIG.uploading;
  const isComplete = processingStep === 'complete';
  const isError = processingStep === 'error';
  const StepIcon = config.icon;

  const progress = useMemo(() => config.progress, [config.progress]);

  return (
    <Card className="border-border bg-surface">
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full',
                isComplete ? 'bg-status-compliant' : isError ? 'bg-status-deficient' : 'bg-primary'
              )}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          {/* Status text */}
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-compliant-bg">
                    <CheckCircle className="h-5 w-5 text-status-compliant" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-status-compliant">
                      Analysis complete
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checkpointCount} BMPs extracted from document
                    </p>
                  </div>
                </motion.div>
              ) : isError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-deficient-bg">
                    <AlertCircle className="h-5 w-5 text-status-deficient" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-status-deficient">
                      Analysis failed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {error || 'The document could not be analyzed. Try uploading it again.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={processingStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <StepIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {config.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Processing SWPPP document
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <span className="font-data text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
