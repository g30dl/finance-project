import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      placeholder = 'Seleccionar...',
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = Boolean(error);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label ? (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-foreground-muted"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full cursor-pointer appearance-none rounded-md border bg-white px-4 py-2.5 pr-10 text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${
              hasError
                ? 'border-danger focus:ring-danger'
                : 'border-border hover:border-primary/40'
            } ${className}`}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDown className="h-5 w-5 text-foreground-muted" />
          </div>
        </div>

        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
