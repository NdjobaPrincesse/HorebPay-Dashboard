import type { Transaction } from '../types';

const RECEIPT_STORAGE_PREFIX = 'horebpay:receipt:';
const CLIENT_RECEIPT_STORAGE_PREFIX = 'horebpay:client-receipt:';
const REPORT_STORAGE_PREFIX = 'horebpay:report:';

export interface ClientReceiptPayload {
  id: string;
  client: string;
  phone: string;
  email: string;
  date?: string;
  balance?: number;
  status?: string;
}

export interface ReportPayload {
  title: string;
  tab: 'TRANSACTIONS' | 'CLIENTS' | 'ENTERPRISES';
  generatedAt: string;
  filters?: string[];
  records: unknown[];
}

export const storeReceiptTransaction = (transaction: Transaction): string => {
  const receiptId = `${transaction.txRef || transaction.id}-${Date.now()}`;

  window.localStorage.setItem(
    `${RECEIPT_STORAGE_PREFIX}${receiptId}`,
    JSON.stringify(transaction),
  );

  return receiptId;
};

export const getStoredReceiptTransaction = (receiptId: string): Transaction | null => {
  const serialized = window.localStorage.getItem(`${RECEIPT_STORAGE_PREFIX}${receiptId}`);

  if (!serialized) return null;

  try {
    return JSON.parse(serialized) as Transaction;
  } catch {
    return null;
  }
};

export const removeStoredReceiptTransaction = (receiptId: string) => {
  window.localStorage.removeItem(`${RECEIPT_STORAGE_PREFIX}${receiptId}`);
};

export const storeClientReceipt = (client: ClientReceiptPayload): string => {
  const receiptId = `${client.id}-${Date.now()}`;

  window.localStorage.setItem(
    `${CLIENT_RECEIPT_STORAGE_PREFIX}${receiptId}`,
    JSON.stringify(client),
  );

  return receiptId;
};

export const getStoredClientReceipt = (receiptId: string): ClientReceiptPayload | null => {
  const serialized = window.localStorage.getItem(`${CLIENT_RECEIPT_STORAGE_PREFIX}${receiptId}`);

  if (!serialized) return null;

  try {
    return JSON.parse(serialized) as ClientReceiptPayload;
  } catch {
    return null;
  }
};

export const removeStoredClientReceipt = (receiptId: string) => {
  window.localStorage.removeItem(`${CLIENT_RECEIPT_STORAGE_PREFIX}${receiptId}`);
};

export const storeReportPayload = (payload: ReportPayload): string => {
  const reportId = `${payload.tab.toLowerCase()}-${Date.now()}`;

  window.localStorage.setItem(
    `${REPORT_STORAGE_PREFIX}${reportId}`,
    JSON.stringify(payload),
  );

  return reportId;
};

export const getStoredReportPayload = (reportId: string): ReportPayload | null => {
  const serialized = window.localStorage.getItem(`${REPORT_STORAGE_PREFIX}${reportId}`);

  if (!serialized) return null;

  try {
    return JSON.parse(serialized) as ReportPayload;
  } catch {
    return null;
  }
};

export const removeStoredReportPayload = (reportId: string) => {
  window.localStorage.removeItem(`${REPORT_STORAGE_PREFIX}${reportId}`);
};
