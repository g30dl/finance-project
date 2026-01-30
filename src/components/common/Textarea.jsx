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
          <label htmlFor={textareaId} className="mb-2 block text-sm font-medium text-foreground-muted">
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={`w-full resize-none rounded-md border bg-white px-4 py-2.5 text-base text-foreground placeholder:text-foreground-muted/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${
            hasError
              ? 'border-danger focus:ring-danger'
              : 'border-border hover:border-primary/40'
          } ${className}`}
          {...props}
        />

        <div className="mt-2 flex items-start justify-between">
          <div className="flex-1">
            {helperText || error ? (
              <p className={`text-sm ${hasError ? 'text-danger' : 'text-foreground-muted'}`}>
                {error || helperText}
              </p>
            ) : null}
          </div>
          {showCount && maxLength ? (
            <p
              className={`ml-2 text-sm ${
                currentLength >= maxLength * 0.9 ? 'text-warning' : 'text-foreground-muted'
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
