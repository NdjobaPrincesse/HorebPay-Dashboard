import { X, Printer, CheckCircle2, Download } from 'lucide-react';
import ReceiptDocument from './ReceiptDocument';
import { storeReceiptTransaction } from '../utils/receiptStorage';
import { exportTransactionReceiptPdf } from '../utils/exportTransactionReceiptPdf';
import type { Transaction } from '../types';

interface Props {
  data: Transaction;
  onClose: () => void;
}

const TransactionReceipt = ({ data, onClose }: Props) => {

  // ✅ FIX: ensure storage happens BEFORE navigation
  const handlePrint = () => {
    const receiptId = storeReceiptTransaction(data);

    const url = `/receipt/${encodeURIComponent(receiptId)}?autoprint=1`;

    const win = window.open(url, '_blank', 'noopener,noreferrer');

    // fallback safety (prevents blocked popups issues)
    if (!win) {
      alert('Popup blocked. Please allow popups and try again.');
    }
  };

  const handleExportPdf = () => {
    exportTransactionReceiptPdf(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm no-print animate-in fade-in duration-300">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10 no-print"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* CONTENT */}
        <div className="overflow-y-auto bg-slate-100 p-4 sm:p-6">

          {/* STATUS ICON */}
          <div className="mb-6 flex items-center justify-center">
            {data.txStatus === 'SUCCESS' ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-green-50 shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-100 bg-green-300 shadow-sm">
                <span className="text-2xl font-bold text-white">#</span>
              </div>
            )}
          </div>

          <ReceiptDocument data={data} />
        </div>

        {/* ACTIONS */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 no-print flex-shrink-0">

          <button
            onClick={handleExportPdf}
            className="flex-1 flex items-center justify-center gap-2 border border-[#1e3a8a]/15 bg-white text-[#1e3a8a] py-3 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a8a] text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>

        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;