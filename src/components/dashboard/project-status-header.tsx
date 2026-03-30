'use client';

import { Shield, User, FileText, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ProjectStatusHeader() {
  return (
    <div className="flex items-center gap-6 rounded-lg border border-border bg-surface-elevated px-5 py-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-amber-500" />
        <span className="text-xs text-muted-foreground">Risk Level</span>
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-mono">
          RL-2
        </Badge>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">QSP</span>
        <span className="text-xs text-foreground">Sarah Chen, QSP #4521</span>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">CGP Permit</span>
        <span className="text-xs font-mono text-foreground">CAS000001</span>
        <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-500 text-xs">
          Active
        </Badge>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Weather</span>
        <span className="text-xs text-foreground">Partly Cloudy, 72°F</span>
      </div>
    </div>
  );
}
