'use client';

import { ReactNode } from 'react';

interface AppPanelProps {
  children: ReactNode;
}

export function AppPanel({ children }: AppPanelProps) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 pb-4 pt-16">
      {/* App window container */}
      <div
        className="relative w-[420px] overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
        style={{ height: 'min(85vh, 820px)' }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
