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
    success: 'border-success/25 bg-success/10 text-success',
    warning: 'border-warning/25 bg-warning/10 text-warning',
    danger: 'border-destructive/25 bg-destructive/10 text-destructive',
    info: 'border-info/25 bg-info/10 text-info',
    accent: 'border-accent/25 bg-accent/10 text-accent',
    neutral: 'border-border bg-secondary/80 text-muted-foreground',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColors = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
    info: 'bg-info',
    accent: 'bg-accent',
    neutral: 'bg-muted-foreground',
  };

  const variantStyles = variants[variant] || variants.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border font-medium ${variantStyles} ${
        sizes[size]
      } ${className}`}
      {...props}
    >
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} /> : null}
      {children}
    </span>
  );
}

export default Badge;

