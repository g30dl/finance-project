import React, { useEffect } from 'react';
import { X } from 'lucide-react';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) {
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

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl ${className}`}
      >
        {title || showCloseButton ? (
          <div className="flex items-center justify-between border-b border-slate-700 p-6">
            {title ? <h2 className="text-xl font-semibold text-slate-100">{title}</h2> : null}
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-slate-800"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
