import React from 'react';

function TimelineActivity({ items = [] }) {
  if (!items.length) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center text-sm text-foreground-muted shadow-card">
        Sin actividad reciente.
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent" />
      {items.map((item) => (
        <div key={item.id} className="relative flex gap-3">
          <div className="z-10 rounded-full bg-white p-2 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center text-primary">
              {item.icon}
            </span>
          </div>
          <div className="flex-1 rounded-2xl border border-border/70 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.amount ? (
                <span className="text-xs font-semibold text-primary">{item.amount}</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-foreground-muted">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimelineActivity;
