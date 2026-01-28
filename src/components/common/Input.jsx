import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconRight,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label ? (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground-muted">
            {label}
          </label>
        ) : null}

        <div className="relative">
          {icon ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {icon}
            </div>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-md border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${
              hasError
                ? 'border-danger focus:ring-danger'
                : 'border-border hover:border-primary/40'
            } ${icon ? 'pl-10' : ''} ${iconRight || hasError ? 'pr-10' : ''} ${className}`}
            {...props}
          />

          {iconRight || hasError ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-danger" />
              ) : (
                <div className="text-foreground-muted">{iconRight}</div>
              )}
            </div>
          ) : null}
        </div>

        {helperText || error ? (
          <p className={`mt-2 text-sm ${hasError ? 'text-danger' : 'text-foreground-muted'}`}>
            {error || helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
