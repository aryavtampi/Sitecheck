'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/shared/page-transition';
import { SectionHeader } from '@/components/shared/section-header';
import { MissionScopeSelector } from '@/components/missions/mission-scope-selector';
import { BmpSelector } from '@/components/missions/bmp-selector';
import { BmpSelectorMap } from '@/components/missions/bmp-selector-map';
import { MissionConfigForm, type MissionConfig } from '@/components/missions/mission-config-form';
import { ReinspectionPresets } from '@/components/missions/reinspection-presets';
import { useCheckpointStore } from '@/stores/checkpoint-store';
import { useDroneStore } from '@/stores/drone-store';
import { useAppMode } from '@/hooks/use-app-mode';
import { cn } from '@/lib/utils';
import { MISSION_SCOPE_LABELS } from '@/lib/constants';
import type { MissionScope } from '@/types/drone';

const STEPS = ['Scope', 'Select BMPs', 'Configure'] as const;

// Scopes that skip the BMP selection step (auto-select)
const AUTO_SELECT_SCOPES: MissionScope[] = ['full', 'priority', 'deficient'];

export default function NewMissionPage() {
  const { isApp } = useAppMode();
  const router = useRouter();
  const checkpoints = useCheckpointStore((s) => s.checkpoints);
  const fetchCheckpoints = useCheckpointStore((s) => s.fetchCheckpoints);
  const addMission = useDroneStore((s) => s.addMission);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scope, setScope] = useState<MissionScope>('full');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [config, setConfig] = useState<MissionConfig>({
    name: '',
    inspectionType: 'routine',
    altitude: 120,
    endOfMissionAction: 'return-home',
    notes: '',
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch checkpoints on mount
  useEffect(() => {
    if (checkpoints.length === 0) fetchCheckpoints();
  }, [checkpoints.length, fetchCheckpoints]);

  // Auto-select checkpoints based on scope
  const autoSelectForScope = useCallback(
    (s: MissionScope): Set<string> => {
      switch (s) {
        case 'full':
          return new Set(checkpoints.map((c) => c.id));
        case 'priority':
          return new Set(
            checkpoints.filter((c) => c.priority === 'high').map((c) => c.id)
          );
        case 'deficient':
          return new Set(
            checkpoints.filter((c) => c.status === 'deficient').map((c) => c.id)
          );
        default:
          return new Set();
      }
    },
    [checkpoints]
  );

  // Handle "Next" from step 1
  const handleScopeNext = useCallback(() => {
    if (AUTO_SELECT_SCOPES.includes(scope)) {
      // Auto-select and skip to step 3
      setSelectedIds(autoSelectForScope(scope));
      setStep(3);
    } else {
      // Go to BMP selection
      setStep(2);
    }
  }, [scope, autoSelectForScope]);

  // Toggle individual checkpoint
  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Select all visible checkpoints
  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(checkpoints.map((c) => c.id)));
  }, [checkpoints]);

  // Deselect all
  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Apply reinspection presets
  const handlePresetsApplied = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  // Generate and persist mission
  const handleGenerate = useCallback(async () => {
    if (selectedIds.size === 0) {
      setError('Please select at least one checkpoint.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Build checkpoint array for the API
      const selectedCheckpoints = checkpoints
        .filter((c) => selectedIds.has(c.id))
        .map((c) => ({
          id: c.id,
          name: c.name,
          bmpType: c.bmpType,
          lat: c.lat ?? c.location.lat,
          lng: c.lng ?? c.location.lng,
        }));

      // Auto-generate name if empty
      const missionName =
        config.name.trim() ||
        `${MISSION_SCOPE_LABELS[scope]} Survey — ${new Date().toLocaleDateString()}`;

      // Step 1: Generate mission route
      const genRes = await fetch('/api/generate-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoints: selectedCheckpoints,
          siteInfo: { centerLat: 36.7801, centerLng: -119.4161 },
          scope,
          endOfMissionAction: config.endOfMissionAction,
          inspectionType: config.inspectionType,
          altitude: config.altitude,
          name: missionName,
          notes: config.notes,
        }),
      });

      if (!genRes.ok) throw new Error('Mission generation failed');
      const generatedMission = await genRes.json();

      // Step 2: Persist to database
      const persistRes = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedMission),
      });

      if (!persistRes.ok) throw new Error('Failed to save mission');
      const savedMission = await persistRes.json();

      // Step 3: Add to store and navigate
      addMission({
        ...generatedMission,
        id: savedMission.id || generatedMission.id,
      });

      router.push(`/missions/${savedMission.id || generatedMission.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setGenerating(false);
    }
  }, [selectedIds, checkpoints, config, scope, addMission, router]);

  return (
    <PageTransition>
      <div className={cn('flex flex-col gap-4 p-4', isApp && 'gap-3 p-3')}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push('/missions')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SectionHeader
            title="New Mission"
            description="Configure and generate a drone inspection mission"
          />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={cn(
                      'h-px w-6',
                      isDone ? 'bg-blue-500' : 'bg-border'
                    )}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isActive
                        ? 'bg-blue-500 text-white'
                        : isDone
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-surface border border-border text-muted-foreground'
                    )}
                  >
                    {stepNum}
                  </div>
                  <span
                    className={cn(
                      'text-xs',
                      isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <Card className="border-border bg-surface">
          <CardContent className="pt-6">
            {/* Step 1: Scope Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Mission Scope
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose which checkpoints to include in this mission
                  </p>
                </div>
                <MissionScopeSelector selected={scope} onSelect={setScope} />
                <div className="flex justify-end">
                  <Button onClick={handleScopeNext} className="gap-1.5">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: BMP Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Select Checkpoints
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {scope === 'reinspection'
                      ? 'Use presets or manually pick checkpoints to reinspect'
                      : scope === 'ad-hoc'
                        ? 'Click on the map or list to add checkpoints'
                        : 'Choose which BMPs to include in the flight route'}
                  </p>
                </div>

                {scope === 'reinspection' && (
                  <ReinspectionPresets onPresetsApplied={handlePresetsApplied} />
                )}

                <div className={cn('grid gap-4', !isApp && 'grid-cols-2')}>
                  <BmpSelector
                    selectedIds={selectedIds}
                    onToggle={handleToggle}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                  />
                  <BmpSelectorMap
                    checkpoints={checkpoints}
                    selectedIds={selectedIds}
                    onToggle={handleToggle}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={selectedIds.size === 0}
                    className="gap-1.5"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Mission Config */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Mission Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedIds.size} checkpoint{selectedIds.size !== 1 ? 's' : ''}{' '}
                    selected &middot; {MISSION_SCOPE_LABELS[scope]} scope
                  </p>
                </div>

                <MissionConfigForm config={config} onChange={setConfig} />

                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setStep(AUTO_SELECT_SCOPES.includes(scope) ? 1 : 2)
                    }
                    className="gap-1.5"
                    disabled={generating}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || selectedIds.size === 0}
                    className="gap-1.5"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        Generate Mission
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
