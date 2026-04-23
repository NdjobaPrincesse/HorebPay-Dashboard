import { jsPDF } from 'jspdf';
import type { Transaction } from '../types';

// ===================== UTILS =====================

const sanitize = (v: unknown): string =>
  String(v ?? '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const formatAmount = (amount: number): string => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);

  // ✔ non-breaking space prevents separation in PDF rendering
  return `${formatted}\u00A0FCFA`;
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ===================== COLORS =====================

const COLORS = {
  blue: [30, 58, 138],
  yellow: [250, 204, 21],
  bg: [248, 250, 252],
  border: [226, 232, 240],
  title: [59, 130, 246],
  text: [30, 41, 59],
  sub: [100, 116, 139],
  success: [34, 197, 94],
  danger: [239, 68, 68],
};

const CARD_GAP = 4;

// ===================== HELPERS =====================

const sectionTitle = (doc: jsPDF, text: string, x: number, y: number) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.title[0], COLORS.title[1], COLORS.title[2]);
  doc.text(text.toUpperCase(), x, y);
};

const row = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number
) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.sub[0], COLORS.sub[1], COLORS.sub[2]);
  doc.text(label, x, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

  // 🔥 IMPORTANT FIX: ensure ONE single string rendering
  doc.text(String(value), x + 170, y, { align: 'right' });
};

// ===================== MAIN =====================

export const exportTransactionReceiptPdf = (data: Transaction) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });

  const W = doc.internal.pageSize.getWidth();

  const isFailed =
    data.txStatus === 'FAILED' || data.paymentStatus === 'FAILED';

  const statusColor = isFailed ? COLORS.danger : COLORS.success;

  // ================= BACKGROUND =================
  doc.setFillColor(COLORS.bg[0], COLORS.bg[1], COLORS.bg[2]);
  doc.rect(0, 0, W, 297, 'F');

  // ================= HEADER =================
  doc.setFillColor(COLORS.blue[0], COLORS.blue[1], COLORS.blue[2]);
  doc.rect(0, 0, W, 30, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);

  doc.text('HOREB', 16, 18);
  doc.setTextColor(COLORS.yellow[0], COLORS.yellow[1], COLORS.yellow[2]);
  doc.text('PAY', 42, 18);

  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.text('Transaction Receipt', 16, 26);

  // ================= STATUS =================
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(W - 55, 10, 40, 10, 4, 4, 'F');

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitize(data.paymentStatus), W - 35, 16.5, {
    align: 'center',
  });

  doc.setFillColor(COLORS.yellow[0], COLORS.yellow[1], COLORS.yellow[2]);
  doc.rect(0, 30, W, 3, 'F');

  // ================= LAYOUT =================
  const x = 14;
  const w = W - 28;
  let y = 45;

  const card = (title: string, height: number) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.roundedRect(x, y - 6, w, height, 6, 6, 'FD');

    sectionTitle(doc, title, x + 6, y + 4);
  };

  // ================= TRANSACTION =================
  card('Transaction Details', 55);
  y += 55 + CARD_GAP;

  row(doc, 'Receipt ID', sanitize(data.txRef), x + 6, y - 45);
  row(doc, 'Date & Time', formatDate(data.date), x + 6, y - 37);
  row(doc, 'Client', sanitize(data.clientName), x + 6, y - 29);
  row(doc, 'Service', sanitize(data.product), x + 6, y - 21);

  // ================= PAYMENT FLOW =================
  card('Payment Flow', 45);
  y += 45 + CARD_GAP;

  row(doc, 'Payer', sanitize(data.payerPhone), x + 6, y - 35);
  row(doc, 'Receiver', sanitize(data.receiverPhone), x + 6, y - 27);

  // ================= CHARGES =================
  card('Charges', 45);
  y += 45 + CARD_GAP;

  row(doc, 'Amount', formatAmount(data.amount), x + 6, y - 35);
  row(doc, 'Service Fee', formatAmount(data.serviceFee), x + 6, y - 27);
  row(doc, 'Bonus', formatAmount(data.bonus), x + 6, y - 19);

  // ================= NETWORK =================
  card('Network Details', 50);
  y += 50 + CARD_GAP;

  row(doc, 'Payment Method', sanitize(data.paymentMethod), x + 6, y - 40);
  row(doc, 'Operator', sanitize(data.operator), x + 6, y - 32);
  row(doc, 'Status', sanitize(data.paymentStatus), x + 6, y - 24);

  // ================= ERROR =================
  if (data.errorMessage) {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(x, y, w, 12, 4, 4, 'F');

    doc.setTextColor(220, 38, 38);
    doc.setFontSize(9);
    doc.text(sanitize(data.errorMessage), x + 6, y + 8);

    y += 18;
  }

  // ================= FOOTER =================
  const footerY = 273;

  doc.setDrawColor(226, 232, 240);
  doc.line(x, footerY - 6, W - x, footerY - 6);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized by HorebPay Financial Services', W / 2, footerY, {
    align: 'center',
  });

  doc.text(
    `Receipt ID: ${sanitize(data.txRef || data.id)}`,
    W / 2,
    footerY + 4,
    { align: 'center' }
  );

  // ================= SAVE =================
  doc.save(`horebpay-receipt-${sanitize(data.txRef || data.id)}.pdf`);
};