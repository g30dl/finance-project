export const calcularProximaEjecucion = (diaMes, fechaBase = Date.now()) => {
  const fecha = new Date(fechaBase);
  const ano = fecha.getFullYear();
  const mes = fecha.getMonth();

  let targetMonth = mes;
  let proxima = new Date(ano, mes, diaMes, 0, 0, 0, 0);

  if (proxima.getTime() <= fechaBase) {
    targetMonth = mes + 1;
    proxima = new Date(ano, targetMonth, diaMes, 0, 0, 0, 0);
  }

  if (proxima.getDate() !== Number(diaMes)) {
    proxima = new Date(ano, targetMonth + 1, 0, 0, 0, 0, 0);
  }

  return proxima.getTime();
};

export const debeNotificar = (expense) => {
  if (!expense?.notificarAntes || !expense?.activo) return false;

  const ahora = Date.now();
  const diasMs = Number(expense.diasNotificacion || 0) * 24 * 60 * 60 * 1000;
  const fechaNotificacion = Number(expense.proximaEjecucion || 0) - diasMs;

  return ahora >= fechaNotificacion && ahora < Number(expense.proximaEjecucion || 0);
};

export const formatProximaEjecucion = (timestamp) => {
  const fecha = new Date(Number(timestamp || 0));
  if (!Number.isFinite(fecha.getTime())) return 'Sin fecha';

  const ahora = new Date();
  const diff = fecha.getTime() - ahora.getTime();
  const dias = Math.ceil(diff / (24 * 60 * 60 * 1000));

  if (dias < 0) return 'Vencido';
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Manana';
  if (dias <= 7) return `En ${dias} dias`;

  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
};

export const getBadgeVariantByDays = (timestamp) => {
  const diff = Number(timestamp || 0) - Date.now();
  const dias = Math.ceil(diff / (24 * 60 * 60 * 1000));

  if (dias < 0) return 'danger';
  if (dias <= 3) return 'warning';
  if (dias <= 7) return 'info';
  return 'neutral';
};
