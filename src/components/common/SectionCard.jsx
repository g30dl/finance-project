import React from 'react';

const SectionCard = ({ title, description, action, children }) => (
  <div className="vintage-card rounded-md p-6 text-foreground shadow-card">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-heading text-lg text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
    <div className="mt-5">{children}</div>
  </div>
);

export default SectionCard;

