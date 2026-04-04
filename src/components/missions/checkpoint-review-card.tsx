'use client';

import { useState } from 'react';
import {
  Check,
  Edit3,
  Clock,
  Camera,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BMP_CATEGORY_LABELS, QSP_DECISION_LABELS } from '@/lib/constants';
import type { AIAnalysis, QSPReviewDecision, QSPReviewEntry, Waypoint } from '@/types/drone';
import type { Checkpoint, CheckpointStatus } from '@/types/checkpoint';

interface CheckpointReviewCardProps {
  waypoint: Waypoint;
  checkpoint: Checkpoint | null;
  analysis: AIAnalysis | null;
  review: QSPReviewEntry | undefined;
  onReviewChange: (
    decision: QSPReviewDecision,
    overrideStatus?: CheckpointStatus,
    notes?: string
  ) => void;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'text-green-500';
  if (confidence >= 75) return 'text-amber-500';
  return 'text-red-500';
}

function getConfidenceIndicatorClass(confidence: number): string {
  if (confidence >= 90) return '[&_[data-slot=progress-indicator]]:bg-green-500';
  if (confidence >= 75) return '[&_[data-slot=progress-indicator]]:bg-amber-500';
  return '[&_[data-slot=progress-indicator]]:bg-red-500';
}

const STATUS_OPTIONS: { value: CheckpointStatus; label: string; color: string }[] = [
  { value: 'compliant', label: 'Compliant', color: 'text-green-400' },
  { value: 'deficient', label: 'Deficient', color: 'text-red-400' },
  { value: 'needs-review', label: 'Needs Review', color: 'text-purple-400' },
];

export function CheckpointReviewCard({
  waypoint,
  checkpoint,
  analysis,
  review,
  onReviewChange,
}: CheckpointReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<CheckpointStatus>(
    review?.overrideStatus ?? 'deficient'
  );
  const [overrideNotes, setOverrideNotes] = useState(review?.overrideNotes ?? '');

  const currentDecision = review?.decision ?? 'pending';
  const displayAnalysis = analysis;
  const bmpLabel = checkpoint ? BMP_CATEGORY_LABELS[checkpoint.bmpType] : 'Unknown BMP';

  function handleDecision(decision: QSPReviewDecision) {
    if (decision === 'override') {
      onReviewChange(decision, overrideStatus, overrideNotes);
    } else {
      onReviewChange(decision);
    }
  }

  return (
    <Card className={cn(
      'border-border bg-surface transition-all',
      currentDecision === 'accept' && 'border-green-500/20',
      currentDecision === 'override' && 'border-amber-500/20',
    )}>
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[11px] text-muted-foreground">
              WP #{waypoint.number}
            </span>
            <span className="text-xs font-medium text-foreground truncate">
              {checkpoint?.name ?? waypoint.checkpointId}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {bmpLabel}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Compact view: photo + decision badges */}
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded border border-border bg-background/50 flex-shrink-0 overflow-hidden">
            {waypoint.photo ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${waypoint.photo})` }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-4 w-4 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* AI status + confidence */}
          {displayAnalysis && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs font-medium capitalize',
                  displayAnalysis.status === 'compliant' ? 'text-green-400' :
                  displayAnalysis.status === 'deficient' ? 'text-red-400' :
                  'text-purple-400'
                )}>
                  {displayAnalysis.status}
                </span>
                <span className={cn(
                  'font-mono text-[11px] font-semibold',
                  getConfidenceColor(displayAnalysis.confidence)
                )}>
                  {displayAnalysis.confidence}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {displayAnalysis.summary}
              </p>
            </div>
          )}

          {/* Decision badge */}
          <span className={cn(
            'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            currentDecision === 'accept' && 'bg-green-500/10 text-green-400',
            currentDecision === 'override' && 'bg-amber-500/10 text-amber-400',
            currentDecision === 'pending' && 'bg-gray-500/10 text-gray-400',
          )}>
            {QSP_DECISION_LABELS[currentDecision]}
          </span>
        </div>

        {/* Expanded: full AI analysis + override controls */}
        {expanded && displayAnalysis && (
          <div className="border-t border-border pt-3 space-y-4">
            {/* AI Summary */}
            <div>
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                AI Analysis
              </h4>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {displayAnalysis.summary}
              </p>
            </div>

            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Confidence
                </span>
                <span className={cn(
                  'font-mono text-xs font-bold',
                  getConfidenceColor(displayAnalysis.confidence)
                )}>
                  {displayAnalysis.confidence}%
                </span>
              </div>
              <Progress
                value={displayAnalysis.confidence}
                className={cn('w-full h-1.5', getConfidenceIndicatorClass(displayAnalysis.confidence))}
              />
            </div>

            {/* Details */}
            {displayAnalysis.details.length > 0 && (
              <div>
                <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Details
                </h4>
                <ul className="space-y-1">
                  {displayAnalysis.details.map((detail, i) => (
                    <li key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CGP Reference */}
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500 mb-1">
                CGP Reference
              </p>
              <p className="text-[11px] text-foreground/80">
                {displayAnalysis.cgpReference}
              </p>
            </div>

            {/* Recommendations */}
            {displayAnalysis.recommendations && displayAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {displayAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* QSP Decision Buttons */}
            <div className="border-t border-border pt-3">
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                QSP Decision
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={currentDecision === 'accept' ? 'default' : 'outline'}
                  className={cn(
                    'gap-1.5 text-xs',
                    currentDecision === 'accept'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  )}
                  onClick={() => handleDecision('accept')}
                >
                  <Check className="h-3 w-3" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant={currentDecision === 'override' ? 'default' : 'outline'}
                  className={cn(
                    'gap-1.5 text-xs',
                    currentDecision === 'override'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                  )}
                  onClick={() => handleDecision('override')}
                >
                  <Edit3 className="h-3 w-3" />
                  Override
                </Button>
                <Button
                  size="sm"
                  variant={currentDecision === 'pending' ? 'default' : 'outline'}
                  className={cn(
                    'gap-1.5 text-xs',
                    currentDecision === 'pending'
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : ''
                  )}
                  onClick={() => handleDecision('pending')}
                >
                  <Clock className="h-3 w-3" />
                  Pending
                </Button>
              </div>

              {/* Override form */}
              {currentDecision === 'override' && (
                <div className="mt-3 space-y-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
                  <div>
                    <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Override Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setOverrideStatus(opt.value);
                            onReviewChange('override', opt.value, overrideNotes);
                          }}
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all border',
                            overrideStatus === opt.value
                              ? `${opt.color} border-current bg-current/10`
                              : 'text-muted-foreground border-border hover:border-muted-foreground'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Notes
                    </label>
                    <textarea
                      className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                      rows={2}
                      placeholder="Override justification..."
                      value={overrideNotes}
                      onChange={(e) => {
                        setOverrideNotes(e.target.value);
                        onReviewChange('override', overrideStatus, e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
