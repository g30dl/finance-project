import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  initialFocusRef,
  className = '',
}) {
  const titleId = useId();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const target =
      initialFocusRef?.current ||
      containerRef.current?.querySelector(
        '[data-autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

    if (target && typeof target.focus === 'function') {
      target.focus();
    } else if (containerRef.current?.focus) {
      containerRef.current.focus();
    }
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-foreground/35 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-card ${className}`}
        ref={containerRef}
        tabIndex={-1}
      >
        {title || showCloseButton ? (
          <div className="flex items-center justify-between border-b border-border/80 p-4 sm:p-6">
            {title ? (
              <h2 id={titleId} className="font-heading text-lg text-foreground sm:text-xl">
                {title}
              </h2>
            ) : null}
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-xl border border-border bg-white p-2 text-foreground-muted transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
