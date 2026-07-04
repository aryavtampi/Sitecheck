'use client';

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-300">
      {/* Header + export controls skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      {/* Report document skeleton */}
      <div className="mx-auto w-full max-w-[800px]">
        <div className="animate-pulse rounded-lg border border-border bg-surface shadow-sm">
          {/* Report header area */}
          <div className="border-b border-border px-10 py-8">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-3 w-56 rounded bg-muted" />
              <div className="h-6 w-64 rounded bg-muted" />
              <div className="h-3 w-44 rounded bg-muted" />
              <div className="mx-auto h-px w-24 bg-muted" />
              <div className="h-3 w-40 rounded bg-muted" />
            </div>
          </div>
          {/* Report sections */}
          <div className="space-y-8 px-10 py-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
          {/* Signature block skeleton */}
          <div className="border-t border-border px-10 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-px w-48 bg-muted" />
                <div className="h-3 w-28 rounded bg-muted" />
              </div>
              <div className="h-9 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
