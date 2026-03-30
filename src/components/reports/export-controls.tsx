'use client';

import { useState } from 'react';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportStore } from '@/stores/report-store';

export function ExportControls() {
  const { signed } = useReportStore();
  const [isGenerating, setIsGenerating] = useState(false);

  function handleGeneratePDF() {
    setIsGenerating(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would trigger @react-pdf/renderer
      alert('PDF generated! (Demo mode — no actual file created)');
    }, 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={handleGeneratePDF}
        disabled={!signed || isGenerating}
        className="bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 gap-2"
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        {isGenerating ? 'Generating...' : 'Generate PDF'}
      </Button>

      <Button
        variant="outline"
        disabled
        className="gap-2 opacity-50 cursor-not-allowed"
      >
        <FileSpreadsheet className="size-4" />
        Export for SMARTS
        <Badge className="bg-muted text-muted-foreground text-[9px] px-1.5 py-0 border-0">
          Coming Soon
        </Badge>
      </Button>

      {!signed && (
        <p className="text-xs text-muted-foreground">
          Sign the report to enable PDF generation
        </p>
      )}
    </div>
  );
}
