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
    'inline-flex items-center justify-center gap-2 rounded-md border border-transparent font-heading font-semibold tracking-[0.02em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary:
      'bg-primary text-white shadow-card hover:bg-primary/90 active:bg-primary/80',
    secondary:
      'border-border bg-secondary text-foreground hover:bg-secondary/80 active:bg-secondary/70',
    danger:
      'bg-destructive text-white shadow-card hover:bg-destructive/90 active:bg-destructive/80',
    ghost:
      'border-border/60 bg-transparent text-foreground/80 hover:bg-secondary/60 active:bg-secondary/80',
    outline:
      'border-primary bg-transparent text-primary hover:bg-primary/10 active:bg-primary/15',
    accent: 'bg-accent text-white shadow-card hover:bg-accent/90 active:bg-accent/80',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const variantStyles = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${sizes[size]} ${widthClass} ${className}`}
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

