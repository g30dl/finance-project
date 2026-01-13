const formatDateValue = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const escapeValue = (value) => {
  const stringValue = String(value ?? '');
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const generateCSV = (transactions = [], requests = []) => {
  const headers = ['Fecha', 'Tipo', 'Categoria', 'Concepto', 'Monto', 'Estado'].join(
    ','
  );

  const rows = [];

  transactions.forEach((transaction) => {
    if (!transaction) return;
    const dateValue = formatDateValue(
      transaction.fecha || transaction.fechaSolicitud || transaction.fechaRespuesta
    );

    rows.push(
      [
        escapeValue(dateValue),
        escapeValue(transaction.tipo || 'transaccion'),
        escapeValue(transaction.categoria || 'N/A'),
        escapeValue(transaction.concepto || ''),
        escapeValue(Number(transaction.cantidad) || 0),
        escapeValue(transaction.estado || 'completada'),
      ].join(',')
    );
  });

  requests.forEach((request) => {
    if (!request) return;
    const dateValue = formatDateValue(
      request.fechaSolicitud || request.fechaRespuesta || request.fecha
    );

    rows.push(
      [
        escapeValue(dateValue),
        escapeValue('solicitud'),
        escapeValue(request.categoria || 'N/A'),
        escapeValue(request.concepto || ''),
        escapeValue(Number(request.cantidad) || 0),
        escapeValue(request.estado || 'pendiente'),
      ].join(',')
    );
  });

  return [headers, ...rows].join('\n');
};

export const downloadCSV = (content, filename) => {
  if (!content) return;

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'reporte.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
