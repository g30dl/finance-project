import React from 'react';
import { Loader2 } from 'lucide-react';

function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconRight,
  children,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 focus:ring-cyan-500',
    secondary:
      'bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-500 focus:ring-slate-500',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500',
    ghost:
      'bg-transparent text-slate-300 hover:bg-slate-800 active:bg-slate-700 focus:ring-slate-600',
    outline:
      'border-2 border-slate-600 bg-transparent text-slate-200 hover:border-slate-500 hover:bg-slate-800 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={iconSize} />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {icon || null}
          {children}
          {iconRight || null}
        </>
      )}
    </button>
  );
}

export default Button;
