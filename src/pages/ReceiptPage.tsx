import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Download, Printer } from 'lucide-react';
import ReceiptDocument from '../components/ReceiptDocument';
import {
  getStoredReceiptTransaction,
  removeStoredReceiptTransaction,
} from '../utils/receiptStorage';
import { exportTransactionReceiptPdf } from '../utils/exportTransactionReceiptPdf';

export default function ReceiptPage() {
  const { receiptId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get('autoprint') === '1';
  const isPdfMode = searchParams.get('mode') === 'pdf';

  const transaction = useMemo(
    () => (receiptId ? getStoredReceiptTransaction(receiptId) : null),
    [receiptId],
  );

  useEffect(() => {
    if (!receiptId || !transaction || !autoPrint) return;

    const timeoutId = window.setTimeout(() => {
      window.print();
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [autoPrint, receiptId, transaction]);

  useEffect(() => {
    if (!receiptId) return;

    const cleanup = () => {
      removeStoredReceiptTransaction(receiptId);
    };

    window.addEventListener('afterprint', cleanup);

    return () => {
      window.removeEventListener('afterprint', cleanup);
    };
  }, [receiptId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!transaction) return;
    exportTransactionReceiptPdf(transaction);
  };

  if (!transaction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">Receipt unavailable</h1>
          <p className="mt-3 text-sm text-slate-500">
            This receipt could not be loaded. Please go back to the dashboard and open it again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-5 flex w-full max-w-[820px] justify-end gap-3 print:hidden">
        {isPdfMode ? (
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-900"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        ) : (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-900"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        )}
      </div>

      {isPdfMode && (
        <div className="mx-auto mb-5 w-full max-w-[820px] rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 print:hidden">
          This page is for exporting this client's transaction receipt as a file. Click <strong>Download PDF</strong> to save the receipt directly as a PDF.
        </div>
      )}

      <ReceiptDocument data={transaction} />
    </main>
  );
}
