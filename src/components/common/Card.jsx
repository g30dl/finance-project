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
      className={`rounded-xl bg-slate-900/50 ${noBorder ? '' : 'border border-slate-700'} ${
        paddings[padding]
      } ${className}`}
      {...props}
    >
      {hasHeader ? (
        <div className="mb-4 border-b border-slate-700 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              {title ? <h3 className="text-lg font-semibold text-slate-200">{title}</h3> : null}
              {subtitle ? (
                <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
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
