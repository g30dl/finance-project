import React, { forwardRef, useId } from 'react';

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      showCount = false,
      rows = 4,
      fullWidth = false,
      className = '',
      id,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const hasError = Boolean(error);
    const currentLength = value?.length || 0;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label ? (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={`w-full resize-none rounded-lg border-2 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
            hasError
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-slate-700 hover:border-slate-600'
          } ${className}`}
          {...props}
        />

        <div className="mt-2 flex items-start justify-between">
          <div className="flex-1">
            {helperText || error ? (
              <p className={`text-sm ${hasError ? 'text-rose-400' : 'text-slate-500'}`}>
                {error || helperText}
              </p>
            ) : null}
          </div>
          {showCount && maxLength ? (
            <p
              className={`ml-2 text-sm ${
                currentLength >= maxLength * 0.9 ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              {currentLength}/{maxLength}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
