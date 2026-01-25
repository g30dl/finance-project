import React from 'react';

function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`py-12 text-center text-foreground ${className}`}>
      {icon ? (
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary text-primary">
            {icon}
          </div>
        </div>
      ) : null}

      <h3 className="mb-2 font-heading text-xl text-foreground">{title}</h3>
      {description ? (
        <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="flex justify-center">{action}</div> : null}
    </div>
  );
}

export default EmptyState;

