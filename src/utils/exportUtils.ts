import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportData = Record<string, unknown>[];

export function exportToXlsx(data: ExportData, filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${filename}.xlsx`);
}

export function exportToHtml(data: ExportData, filename: string) {
  const headers = Object.keys(data[0] || {});
  let html = '<html><head><meta charset="utf-8"><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#2d7a3a;color:white}</style></head><body><table>';
  html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
  data.forEach(row => {
    html += '<tr>' + headers.map(h => `<td>${row[h] ?? ''}</td>`).join('') + '</tr>';
  });
  html += '</table></body></html>';
  saveAs(new Blob([html], { type: 'text/html;charset=utf-8' }), `${filename}.html`);
}

export function exportToTxt(data: ExportData, filename: string) {
  const headers = Object.keys(data[0] || {});
  let txt = headers.join('\t') + '\n';
  data.forEach(row => {
    txt += headers.map(h => row[h] ?? '').join('\t') + '\n';
  });
  saveAs(new Blob([txt], { type: 'text/plain;charset=utf-8' }), `${filename}.txt`);
}

export function exportToPdf(data: ExportData, filename: string, title?: string) {
  const doc = new jsPDF();
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 20);
  }
  const headers = Object.keys(data[0] || {});
  autoTable(doc, {
    head: [headers],
    body: data.map(row => headers.map(h => String(row[h] ?? ''))),
    startY: title ? 30 : 10,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [45, 122, 58] },
  });
  doc.save(`${filename}.pdf`);
}

export function shareViaWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareViaEmail(subject: string, body: string) {
  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
