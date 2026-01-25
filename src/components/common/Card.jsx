import React from 'react';

function Card({
  children,
  title,
  subtitle,
  headerAction,
  padding = 'md',
  noBorder = false,
  className = '',
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hasHeader = title || subtitle || headerAction;

  return (
    <div
      className={`vintage-card rounded-md text-foreground shadow-card ${noBorder ? 'border-0' : ''} ${
        paddings[padding]
      } ${className}`}
      {...props}
    >
      {hasHeader ? (
        <div className="mb-5 border-b border-border/80 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              {title ? <h3 className="font-heading text-lg text-foreground">{title}</h3> : null}
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {headerAction ? <div>{headerAction}</div> : null}
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}

export default Card;

