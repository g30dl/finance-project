export const formatCurrency = (value, options = {}) => {
  const fallback = {
    locale: 'es-MX',
    currency: 'MXN',
    showSymbol: true,
    decimals: 2,
  };

  const resolvedOptions =
    typeof options === 'string'
      ? { ...fallback, locale: options }
      : { ...fallback, ...(options || {}) };

  const number = Number(value) || 0;

  if (!resolvedOptions.showSymbol) {
    return number.toLocaleString(resolvedOptions.locale, {
      minimumFractionDigits: resolvedOptions.decimals,
      maximumFractionDigits: resolvedOptions.decimals,
    });
  }

  return new Intl.NumberFormat(resolvedOptions.locale, {
    style: 'currency',
    currency: resolvedOptions.currency,
    minimumFractionDigits: resolvedOptions.decimals,
    maximumFractionDigits: resolvedOptions.decimals,
  }).format(number);
};

export const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Hace unos segundos';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} dias`;

  return past.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
};
