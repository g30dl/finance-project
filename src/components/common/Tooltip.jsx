import React, { useState } from 'react';

function Tooltip({ content, children, position = 'top', className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && content ? (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground shadow-card ${
            positions[position]
          } ${className}`}
        >
          {content}
          <div
            className={`absolute h-2 w-2 rotate-45 border-border bg-card ${
              position === 'top'
                ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r'
                : ''
            } ${
              position === 'bottom'
                ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l'
                : ''
            } ${
              position === 'left'
                ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t'
                : ''
            } ${
              position === 'right'
                ? 'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
                : ''
            }`}
          />
        </div>
      ) : null}
    </div>
  );
}

export default Tooltip;

