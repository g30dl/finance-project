import React, { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

function AccountsCarousel({ accounts, onAccountClick }) {
  const scrollRef = useRef(null);

  const accountList = useMemo(() => {
    if (!accounts) return [];
    if (Array.isArray(accounts)) return accounts;
    return Object.entries(accounts).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  }, [accounts]);

  const handleScroll = (direction) => {
    const node = scrollRef.current;
    if (!node) return;
    const offset = direction === 'left' ? -320 : 320;
    node.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (accountList.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 text-center text-sm text-foreground-muted shadow-card">
        No hay cuentas personales disponibles.
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
      >
        {accountList.map((account) => {
          const balance = Number(account.saldo) || 0;
          const initials = String(account.nombreUsuario || account.userId || '')
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={account.userId}
              className="w-64 flex-shrink-0 snap-start rounded-3xl border border-border/60 bg-gradient-to-br from-white to-background p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-success to-success/70 text-white shadow-lg">
                <span className="font-heading text-2xl">{initials || '??'}</span>
              </div>

              <h4 className="text-center font-heading text-lg text-foreground">
                {account.nombreUsuario || 'Cuenta'}
              </h4>

              <p className="mt-2 text-center font-heading text-3xl font-bold text-success">
                {formatCurrency(balance)}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <div className={`h-2 w-2 rounded-full ${balance > 50 ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                <span className="text-xs text-foreground-muted">
                  {balance > 50 ? 'Saludable' : 'Bajo'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAccountClick?.(account.userId)}
                className="mt-4 w-full rounded-xl bg-primary/10 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Ver detalles
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-white p-2 shadow-lg transition-colors hover:bg-muted lg:inline-flex"
        aria-label="Desplazar a la izquierda"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-white p-2 shadow-lg transition-colors hover:bg-muted lg:inline-flex"
        aria-label="Desplazar a la derecha"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default AccountsCarousel;
