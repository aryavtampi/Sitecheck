'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, ShieldCheck, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';

interface SignatureBlockProps {
  signed: boolean;
  signedBy: string | null;
  signedDate: string | null;
  onSign: (name: string) => void;
  onUnsign: () => void;
}

export function SignatureBlock({
  signed,
  signedBy,
  signedDate,
  onSign,
  onUnsign,
}: SignatureBlockProps) {
  const [confirmed, setConfirmed] = useState(false);

  function handleSign() {
    if (!confirmed) return;
    onSign('Sarah Chen, QSP-4521');
  }

  if (signed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-status-compliant" />
          <h3 className="text-sm font-semibold text-status-compliant">Report certified</h3>
        </div>

        <div className="rounded-lg border border-status-compliant/20 bg-status-compliant-bg p-4">
          <div className="space-y-2 text-sm text-foreground">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Certified by</span>
              <span className="font-medium">{signedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-data font-medium">{signedDate ? formatDateTime(signedDate) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License</span>
              <span className="font-data font-medium">QSP-4521</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-status-compliant/20 pt-3">
            <div className="flex-1 border-b-2 border-status-compliant pb-1">
              <span className="font-serif text-lg italic text-foreground">
                Sarah Chen
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onUnsign}
          className="border-input text-muted-foreground hover:bg-muted gap-1 text-xs"
        >
          <XCircle className="size-3" />
          Revoke certification
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Pen className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">QSP certification</h3>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        By signing this report, you certify under penalty of law that the information
        submitted is true, accurate, and complete to the best of your knowledge.
      </p>

      <div className="rounded-lg border border-border bg-surface-elevated p-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>QSP name</span>
            <span className="font-medium text-foreground">Sarah Chen</span>
          </div>
          <div className="flex justify-between">
            <span>License number</span>
            <span className="font-data font-medium text-foreground">QSP-4521</span>
          </div>
          <div className="flex justify-between">
            <span>Company</span>
            <span className="font-medium text-foreground">Pacific Environmental Consulting</span>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-input text-primary accent-primary focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I certify that this inspection report has been prepared under my direction and the
          information is true, accurate, and complete. I am aware of the penalties for
          submitting false information.
        </span>
      </label>

      <Button
        onClick={handleSign}
        disabled={!confirmed}
        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-1.5"
      >
        <CheckCircle className="size-4" />
        Sign and certify report
      </Button>
    </div>
  );
}
