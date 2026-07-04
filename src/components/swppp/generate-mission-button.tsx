'use client';

import { useState } from 'react';
import { Plane, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSwpppStore } from '@/stores/swppp-store';
import { useDroneStore } from '@/stores/drone-store';
import { useProjectStore } from '@/stores/project-store';
import type { PathViolation } from '@/lib/geofence';

export function GenerateMissionButton() {
  const { extractedCheckpoints, siteInfo, generatedMission, setGeneratedMission, selectedPages } = useSwpppStore();
  const { addMission } = useDroneStore();
  const project = useProjectStore((s) => s.currentProject());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [violations, setViolations] = useState<PathViolation[]>([]);

  async function handleGenerate() {
    if (extractedCheckpoints.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setViolations([]);

    try {
      const response = await fetch('/api/generate-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoints: extractedCheckpoints,
          siteInfo: siteInfo ? { centerLat: siteInfo.centerLat, centerLng: siteInfo.centerLng } : undefined,
          sourceDocumentPages: selectedPages,
          projectId: project?.id,
          projectType: project?.projectType,
          centerline: project?.corridor?.centerline,
        }),
      });

      if (response.status === 422) {
        const payload = (await response.json()) as { error?: string; violations?: PathViolation[] };
        setViolations(payload.violations ?? []);
        throw new Error(payload.error || 'Mission violates restricted airspace');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Mission generation failed');
      }

      const mission = await response.json();
      setGeneratedMission(mission);
      addMission(mission);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  if (generatedMission) {
    return (
      <Card className="border-status-compliant/20 bg-status-compliant-bg">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-status-compliant/10">
              <Plane className="h-5 w-5 text-status-compliant" />
            </div>
            <div>
              <p className="text-sm font-medium text-status-compliant">Mission generated</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-data">{generatedMission.waypoints.length}</span> waypoints •{' '}
                <span className="font-data">{generatedMission.flightTimeMinutes}</span> min flight time
              </p>
            </div>
          </div>
          <Link href={`/missions/${generatedMission.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              View mission
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-surface">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                <span className="font-data">{extractedCheckpoints.length}</span> checkpoints extracted
              </p>
              <p className="text-xs text-muted-foreground">
                Generate an optimized drone flight path
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {error && violations.length === 0 && (
              <p className="text-xs text-status-deficient">{error}</p>
            )}
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plane className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate mission'}
            </Button>
          </div>
        </div>

        {violations.length > 0 && (
          <div className="space-y-2 rounded-lg border border-status-deficient/20 bg-status-deficient-bg p-3">
            <p className="text-xs font-medium text-status-deficient">
              Airspace violations ({violations.length})
            </p>
            <ul className="space-y-1.5">
              {violations.map((v, i) => (
                <li key={i} className="text-[11px] text-foreground">
                  {v.waypointNumber !== undefined && (
                    <span className="font-data mr-1">WP{v.waypointNumber}:</span>
                  )}
                  {v.zoneName ? <span className="font-medium">{v.zoneName} — </span> : null}
                  {v.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
