import React from 'react';

function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`py-12 text-center ${className}`}>
      {icon ? (
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-slate-800 p-4 text-slate-400">{icon}</div>
        </div>
      ) : null}

      <h3 className="mb-2 text-lg font-semibold text-slate-200">{title}</h3>
      {description ? (
        <p className="mx-auto mb-6 max-w-md text-slate-400">{description}</p>
      ) : null}
      {action ? <div className="flex justify-center">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
