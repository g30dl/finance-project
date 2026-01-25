import React from 'react';
import { Sparkles } from 'lucide-react';

function ComingSoon({ features = [] }) {
  return (
    <div className="vintage-card rounded-md p-6 text-foreground shadow-card">
      <h3 className="mb-4 flex items-center gap-2 font-heading text-lg text-foreground">
        <Sparkles className="h-5 w-5 text-accent" />
        Proximamente
      </h3>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComingSoon;

