import { jsPDF } from 'jspdf';
import type { Transaction } from '../types';
import { formatBonus, formatCurrency } from './formatters';

const PAGE_MARGIN = 10;
const HEADER_HEIGHT = 24;
const FOOTER_HEIGHT = 10;
const TABLE_HEADER_HEIGHT = 8;
const ROW_LINE_HEIGHT = 4;

const COLUMNS = [
  { key: 'date', label: 'Date', width: 26 },
  { key: 'txRef', label: 'Reference', width: 34 },
  { key: 'clientName', label: 'Client', width: 34 },
  { key: 'phones', label: 'Phones', width: 40 },
  { key: 'service', label: 'Service', width: 34 },
  { key: 'paymentMethod', label: 'Method', width: 24 },
  { key: 'amount', label: 'Amount', width: 22 },
  { key: 'statuses', label: 'Status', width: 30 },
] as const;

const sanitizePdfText = (value: unknown): string => {
  return String(value ?? '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const sanitizePdfFilename = (value: unknown): string => {
  const normalized = sanitizePdfText(value)
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\.+$/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return normalized || 'transactions';
};

const triggerPdfDownload = (doc: jsPDF, filename: string) => {
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return sanitizePdfText(value);
  }

  return sanitizePdfText(
    `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  );
};

const formatCellValue = (
  transaction: Transaction,
  key: (typeof COLUMNS)[number]['key']
) => {
  switch (key) {
    case 'date':
      return formatDateTime(transaction.date);
    case 'txRef':
      return sanitizePdfText(transaction.txRef);
    case 'clientName':
      return sanitizePdfText(`${transaction.clientName} (${transaction.clientId})`);
    case 'phones':
      return sanitizePdfText(`From: ${transaction.payerPhone} To: ${transaction.receiverPhone}`);
    case 'service':
      return sanitizePdfText(`${transaction.product} / ${transaction.operator}`);
    case 'paymentMethod':
      return sanitizePdfText(transaction.paymentMethod);
    case 'amount':
      return sanitizePdfText(
        `${formatCurrency(transaction.amount)} | Fee: ${formatCurrency(transaction.serviceFee)} | Bonus: ${formatBonus(transaction.bonus)}`
      );
    case 'statuses':
      return sanitizePdfText(`TX: ${transaction.txStatus} | PAY: ${transaction.paymentStatus}`);
    default:
      return '-';
  }
};

const drawPageHeader = (
  doc: jsPDF,
  pageWidth: number,
  title: string,
  subtitle: string
) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text(title, PAGE_MARGIN, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(subtitle, PAGE_MARGIN, 20);

  doc.setDrawColor(226, 232, 240);
  doc.line(PAGE_MARGIN, HEADER_HEIGHT, pageWidth - PAGE_MARGIN, HEADER_HEIGHT);
};

const drawTableHeader = (doc: jsPDF, y: number) => {
  let x = PAGE_MARGIN;

  doc.setFillColor(248, 250, 252);
  doc.rect(
    PAGE_MARGIN,
    y,
    COLUMNS.reduce((sum, column) => sum + column.width, 0),
    TABLE_HEADER_HEIGHT,
    'F'
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  COLUMNS.forEach((column) => {
    doc.text(column.label, x + 1.5, y + 5.2);
    x += column.width;
  });

  doc.setDrawColor(203, 213, 225);
  doc.line(PAGE_MARGIN, y + TABLE_HEADER_HEIGHT, x, y + TABLE_HEADER_HEIGHT);
};

export const exportTransactionsPdf = (transactions: Transaction[]) => {
  if (!transactions.length) {
    window.alert('There are no transactions to export.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedAt = new Date();
  const fileDate = generatedAt.toISOString().slice(0, 10);
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const successCount = transactions.filter((transaction) => transaction.txStatus === 'SUCCESS').length;

  const drawFooter = (pageNumber: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.line(
      PAGE_MARGIN,
      pageHeight - FOOTER_HEIGHT,
      pageWidth - PAGE_MARGIN,
      pageHeight - FOOTER_HEIGHT
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${pageNumber}`, pageWidth - PAGE_MARGIN - 12, pageHeight - 4);
  };

  let pageNumber = 1;
  drawPageHeader(
    doc,
    pageWidth,
    'HorebPay Transactions Report',
    `Generated ${generatedAt.toLocaleString()} | Records: ${transactions.length} | Success: ${successCount} | Total Amount: ${formatCurrency(totalAmount)}`
  );

  let y = HEADER_HEIGHT + 4;
  drawTableHeader(doc, y);
  y += TABLE_HEADER_HEIGHT;

  transactions.forEach((transaction) => {
    const cellLines = COLUMNS.map((column) =>
      doc.splitTextToSize(formatCellValue(transaction, column.key), column.width - 3)
    );
    const rowHeight = Math.max(
      8,
      ...cellLines.map((lines) => lines.length * ROW_LINE_HEIGHT + 3)
    );

    if (y + rowHeight > pageHeight - FOOTER_HEIGHT - 4) {
      drawFooter(pageNumber);
      doc.addPage();
      pageNumber += 1;
      drawPageHeader(
        doc,
        pageWidth,
        'HorebPay Transactions Report',
        `Generated ${generatedAt.toLocaleString()} | Continued report`
      );
      y = HEADER_HEIGHT + 4;
      drawTableHeader(doc, y);
      y += TABLE_HEADER_HEIGHT;
    }

    let x = PAGE_MARGIN;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    COLUMNS.forEach((column, index) => {
      doc.rect(x, y, column.width, rowHeight);
      doc.text(cellLines[index], x + 1.5, y + 4);
      x += column.width;
    });

    y += rowHeight;
  });

  drawFooter(pageNumber);
  triggerPdfDownload(
    doc,
    `horebpay-transactions-${sanitizePdfFilename(fileDate)}.pdf`
  );
};
