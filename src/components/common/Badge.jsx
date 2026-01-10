import React from 'react';

function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const variants = {
    success: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400',
    warning: 'border-amber-500/50 bg-amber-500/20 text-amber-400',
    danger: 'border-rose-500/50 bg-rose-500/20 text-rose-400',
    info: 'border-blue-500/50 bg-blue-500/20 text-blue-400',
    neutral: 'border-slate-600/50 bg-slate-700/50 text-slate-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        variants[variant]
      } ${sizes[size]} ${className}`}
      {...props}
    >
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} /> : null}
      {children}
    </span>
  );
}

export default Badge;
