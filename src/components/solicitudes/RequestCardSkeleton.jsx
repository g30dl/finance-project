import React from 'react';

function RequestCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      </div>
      <div className="ml-auto h-6 w-1/4 rounded bg-muted" />
    </div>
  );
}

export default RequestCardSkeleton;
