import React from 'react';
import { Download } from 'lucide-react';
import { downloadCSV } from '../../utils/csvExport';

const openPrintWindow = (html, title) => {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  win.close();
};

function ExportButtons({ csvContent, filenameBase, htmlContent, disabled }) {
  const handleCSV = () => downloadCSV(csvContent, `${filenameBase}.csv`);
  const handleExcel = () => downloadCSV(csvContent, `${filenameBase}.xls`);
  const handlePDF = () => openPrintWindow(htmlContent || `<pre>${csvContent}</pre>`, filenameBase);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCSV}
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-card disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        CSV
      </button>
      <button
        type="button"
        onClick={handleExcel}
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-card disabled:opacity-60"
      >
        Excel
      </button>
      <button
        type="button"
        onClick={handlePDF}
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-card disabled:opacity-60"
      >
        PDF
      </button>
    </div>
  );
}

export default ExportButtons;
