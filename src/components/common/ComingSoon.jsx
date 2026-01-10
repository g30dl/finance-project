import React from 'react';
import { Sparkles } from 'lucide-react';

function ComingSoon({ features = [] }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-200">
        <Sparkles className="h-5 w-5 text-cyan-400" />
        Proximamente
      </h3>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-slate-400">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComingSoon;
