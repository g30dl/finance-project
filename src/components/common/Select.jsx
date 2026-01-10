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
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full cursor-pointer appearance-none rounded-lg border-2 bg-slate-900 px-4 py-2.5 pr-10 text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
              hasError
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-slate-700 hover:border-slate-600'
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
            <ChevronDown className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
