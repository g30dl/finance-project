import React from 'react';

const SectionCard = ({ title, description, action, children }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

export default SectionCard;
