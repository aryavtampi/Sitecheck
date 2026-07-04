'use client';

/**
 * Block 4 — CheckpointReviewCard
 *
 * Renders the captured photo (from `waypoint.photos[0]` with the legacy
 * `waypoint.photo` as fallback) inside a 16:9 frame with a click-to-zoom
 * modal, the persisted Claude AI analysis (model + timestamp), a
 * "Re-analyze" button that re-hits `/analyze` with an optional one-line
 * hint, and the persisted QSP decision controls.
 */

import { useState } from 'react';
import {
  Check,
  Edit3,
  Clock,
  Camera,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BMP_CATEGORY_LABELS, QSP_DECISION_LABELS } from '@/lib/constants';
import type {
  AIAnalysis,
  MissionAIAnalysis,
  QSPReviewDecision,
  QSPReviewEntry,
  Waypoint,
} from '@/types/drone';
import type { Checkpoint, CheckpointStatus } from '@/types/checkpoint';

interface CheckpointReviewCardProps {
  waypoint: Waypoint;
  checkpoint: Checkpoint | null;
  analysis: AIAnalysis | null;
  review: QSPReviewEntry | undefined;
  /** Block 4 — true while a Re-analyze call is in flight */
  analyzing?: boolean;
  /** Block 4 — fire a fresh Claude analysis on this waypoint */
  onReanalyze?: (hint?: string) => void | Promise<void>;
  onReviewChange: (
    decision: QSPReviewDecision,
    overrideStatus?: CheckpointStatus,
    notes?: string
  ) => void;
}

function isPersistedAnalysis(a: AIAnalysis | null): a is MissionAIAnalysis {
  return !!a && typeof (a as MissionAIAnalysis).model === 'string';
}

function formatTimestamp(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'text-status-compliant';
  if (confidence >= 75) return 'text-status-warning';
  return 'text-status-deficient';
}

function getConfidenceIndicatorClass(confidence: number): string {
  if (confidence >= 90) return '[&_[data-slot=progress-indicator]]:bg-status-compliant';
  if (confidence >= 75) return '[&_[data-slot=progress-indicator]]:bg-status-warning';
  return '[&_[data-slot=progress-indicator]]:bg-status-deficient';
}

const STATUS_OPTIONS: { value: CheckpointStatus; label: string; color: string }[] = [
  { value: 'compliant', label: 'Compliant', color: 'text-status-compliant' },
  { value: 'deficient', label: 'Deficient', color: 'text-status-deficient' },
  { value: 'needs-review', label: 'Needs review', color: 'text-status-review' },
];

export function CheckpointReviewCard({
  waypoint,
  checkpoint,
  analysis,
  review,
  analyzing,
  onReanalyze,
  onReviewChange,
}: CheckpointReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<CheckpointStatus>(
    review?.overrideStatus ?? 'deficient'
  );
  const [overrideNotes, setOverrideNotes] = useState(review?.overrideNotes ?? '');
  const [photoZoomed, setPhotoZoomed] = useState(false);
  const [reanalyzeHint, setReanalyzeHint] = useState('');
  const [showHintField, setShowHintField] = useState(false);

  const currentDecision = review?.decision ?? 'pending';
  const displayAnalysis = analysis;
  const bmpLabel = checkpoint ? BMP_CATEGORY_LABELS[checkpoint.bmpType] : 'Unknown BMP';

  // Block 4 — resolve the captured photo URL: prefer the persisted photos
  // array, fall back to the legacy `photo` column.
  const photoUrl =
    waypoint.photos && waypoint.photos.length > 0
      ? waypoint.photos[0]
      : waypoint.photo ?? null;

  const persistedAnalysis = isPersistedAnalysis(displayAnalysis)
    ? displayAnalysis
    : null;
  const analyzedAt = formatTimestamp(persistedAnalysis?.createdAt);
  const analyzedBy = persistedAnalysis?.model;

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
      currentDecision === 'accept' && 'border-status-compliant/30',
      currentDecision === 'override' && 'border-status-warning/30',
    )}>
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-data text-[11px] text-muted-foreground">
              WP #{waypoint.number}
            </span>
            <span className="text-xs font-medium text-foreground truncate">
              {checkpoint?.name ?? waypoint.checkpointId}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
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
          {/* Thumbnail (Block 4 — click to zoom) */}
          <button
            type="button"
            onClick={() => photoUrl && setPhotoZoomed(true)}
            className={cn(
              'w-12 h-12 rounded border border-border bg-muted flex-shrink-0 overflow-hidden',
              photoUrl && 'hover:border-primary/40 cursor-zoom-in transition-colors'
            )}
            title={photoUrl ? 'Click to enlarge' : 'No photo captured'}
          >
            {photoUrl ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${photoUrl})` }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-4 w-4 text-muted-foreground/50" />
              </div>
            )}
          </button>

          {/* AI status + confidence */}
          {displayAnalysis && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs font-medium capitalize',
                  displayAnalysis.status === 'compliant' ? 'text-status-compliant' :
                  displayAnalysis.status === 'deficient' ? 'text-status-deficient' :
                  'text-status-review'
                )}>
                  {displayAnalysis.status}
                </span>
                <span className={cn(
                  'font-data text-[11px] font-semibold',
                  getConfidenceColor(displayAnalysis.confidence)
                )}>
                  {displayAnalysis.confidence}%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {displayAnalysis.summary}
              </p>
            </div>
          )}

          {/* Decision badge */}
          <span className={cn(
            'flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
            currentDecision === 'accept' && 'bg-status-compliant-bg text-status-compliant',
            currentDecision === 'override' && 'bg-status-warning-bg text-status-warning',
            currentDecision === 'pending' && 'bg-muted text-muted-foreground',
          )}>
            {QSP_DECISION_LABELS[currentDecision]}
          </span>
        </div>

        {/* Expanded: full AI analysis + override controls */}
        {expanded && displayAnalysis && (
          <div className="border-t border-border pt-3 space-y-4">
            {/* Block 4 — Hero photo (16:9, click to zoom) */}
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoZoomed(true)}
                className="block w-full rounded-md border border-border overflow-hidden bg-muted hover:border-primary/40 transition-colors"
                title="Click to enlarge"
              >
                <div
                  className="w-full bg-cover bg-center cursor-zoom-in"
                  style={{
                    backgroundImage: `url(${photoUrl})`,
                    aspectRatio: '16 / 9',
                  }}
                />
              </button>
            )}

            {/* AI Summary */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Analysis
                </h4>
                {(analyzedBy || analyzedAt) && (
                  <span className="text-[11px] font-data text-muted-foreground">
                    {analyzedBy ? `${analyzedBy}` : ''}
                    {analyzedBy && analyzedAt ? ' · ' : ''}
                    {analyzedAt ?? ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {displayAnalysis.summary}
              </p>
            </div>

            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Confidence
                </span>
                <span className={cn(
                  'font-data text-xs font-semibold',
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
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5">
                  Details
                </h4>
                <ul className="space-y-1">
                  {displayAnalysis.details.map((detail, i) => (
                    <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CGP Reference */}
            <div className="rounded-md border border-border bg-muted p-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                CGP reference
              </p>
              <p className="text-[11px] text-foreground">
                {displayAnalysis.cgpReference}
              </p>
            </div>

            {/* Recommendations */}
            {displayAnalysis.recommendations && displayAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5">
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {displayAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Block 4 — Re-analyze controls */}
            {onReanalyze && (
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Claude vision
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setShowHintField((v) => !v)}
                      className="text-[11px] h-6"
                    >
                      {showHintField ? 'Hide hint' : 'Add hint'}
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={analyzing || !photoUrl}
                      onClick={async () => {
                        await onReanalyze(showHintField ? reanalyzeHint : undefined);
                      }}
                      className="gap-1 text-[11px] h-6"
                    >
                      {analyzing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Re-analyze
                    </Button>
                  </div>
                </div>
                {showHintField && (
                  <input
                    type="text"
                    value={reanalyzeHint}
                    onChange={(e) => setReanalyzeHint(e.target.value)}
                    placeholder="Optional hint for Claude (e.g. 'check for sediment buildup')"
                    className="mt-2 w-full rounded-md border border-input bg-surface px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                )}
                {!photoUrl && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    No captured photo for this waypoint yet — re-analyze
                    requires a photo.
                  </p>
                )}
              </div>
            )}

            {/* QSP Decision Buttons */}
            <div className="border-t border-border pt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                QSP decision
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={currentDecision === 'accept' ? 'default' : 'outline'}
                  className={cn(
                    'gap-1.5 text-xs',
                    currentDecision === 'accept'
                      ? 'bg-status-compliant hover:bg-status-compliant/90 text-white'
                      : 'border-status-compliant/30 text-status-compliant hover:bg-status-compliant-bg'
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
                      ? 'bg-status-warning hover:bg-status-warning/90 text-white'
                      : 'border-status-warning/30 text-status-warning hover:bg-status-warning-bg'
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
                      ? 'bg-secondary-foreground hover:bg-secondary-foreground/90 text-white'
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
                <div className="mt-3 space-y-2 rounded-md border border-status-warning/20 bg-status-warning-bg p-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Override status
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
                              ? `${opt.color} border-current bg-surface`
                              : 'text-muted-foreground border-border hover:border-input'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Notes
                    </label>
                    <textarea
                      className="mt-1 w-full rounded-md border border-input bg-surface px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
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

      {/* Block 4 — Photo zoom modal */}
      {photoZoomed && photoUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPhotoZoomed(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPhotoZoomed(false);
            }}
            className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white/80 hover:bg-black/80 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={photoUrl}
            alt={`Waypoint ${waypoint.number} capture`}
            className="max-h-full max-w-full rounded-md object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Card>
  );
}
