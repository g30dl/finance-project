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

export const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = now - past;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'Hace unos segundos';
  if (minutes < 60)
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (days < 7) return `Hace ${days} ${days === 1 ? 'dia' : 'dias'}`;
  if (weeks < 4) return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  if (months < 12) return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
