export const formatCurrency = (value = 0, locale = 'es-MX') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};
