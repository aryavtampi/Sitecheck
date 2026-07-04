'use client';

export default function MissionsLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
      </div>
      {/* Mission card skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-4">
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="h-3 w-36 rounded bg-muted" />
              </div>
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            {/* Stats grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="rounded-lg bg-muted p-3">
                  <div className="mx-auto h-4 w-4 rounded bg-border/60" />
                  <div className="mx-auto mt-2 h-5 w-10 rounded bg-border/60" />
                  <div className="mx-auto mt-1 h-2 w-14 rounded bg-border/60" />
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
