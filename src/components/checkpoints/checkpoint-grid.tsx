'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import { useCheckpointStore } from '@/stores/checkpoint-store';
import { CheckpointCard } from '@/components/checkpoints/checkpoint-card';
import { checkpoints as allCheckpoints } from '@/data/checkpoints';

export function CheckpointGrid() {
  const filteredCheckpoints = useCheckpointStore((s) => s.filteredCheckpoints)();

  const compliantCount = filteredCheckpoints.filter((cp) => cp.status === 'compliant').length;
  const deficientCount = filteredCheckpoints.filter((cp) => cp.status === 'deficient').length;
  const reviewCount = filteredCheckpoints.filter((cp) => cp.status === 'needs-review').length;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground">{filteredCheckpoints.length}</span>{' '}
          of{' '}
          <span className="font-medium text-foreground">{allCheckpoints.length}</span>{' '}
          checkpoints
        </span>
        <div className="h-3.5 w-px bg-border" />
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{compliantCount} compliant</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">{deficientCount} deficient</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">{reviewCount} needs review</span>
          </span>
        </div>
      </div>

      {/* Grid */}
      {filteredCheckpoints.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredCheckpoints.map((checkpoint, index) => (
              <motion.div
                key={checkpoint.id}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <CheckpointCard checkpoint={checkpoint} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface py-16"
        >
          <PackageOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No checkpoints match your filters
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </div>
  );
}
