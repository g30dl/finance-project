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
