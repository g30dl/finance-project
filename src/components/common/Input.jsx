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
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {icon ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border-2 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
              hasError
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-slate-700 hover:border-slate-600'
            } ${icon ? 'pl-10' : ''} ${
              iconRight || hasError ? 'pr-10' : ''
            } ${className}`}
            {...props}
          />

          {iconRight || hasError ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-rose-500" />
              ) : (
                <div className="text-slate-400">{iconRight}</div>
              )}
            </div>
          ) : null}
        </div>

        {helperText || error ? (
          <p className={`mt-2 text-sm ${hasError ? 'text-rose-400' : 'text-slate-500'}`}>
            {error || helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
