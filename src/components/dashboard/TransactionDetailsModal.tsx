import { X, Copy, CheckCircle2, XCircle, ArrowRight, Smartphone, Globe, CreditCard } from 'lucide-react';
import type { Transaction } from '../../types';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: Props) {
  if (!transaction) return null;

  const isSuccess = transaction.status !== 'FAILED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">{transaction.txRef}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* STATUS BANNER */}
        <div className={`px-6 py-8 flex flex-col items-center justify-center ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
            {isSuccess ? <CheckCircle2 className="h-12 w-12 text-green-500 mb-2"/> : <XCircle className="h-12 w-12 text-red-500 mb-2"/>}
            <h2 className="text-3xl font-bold text-gray-900">{transaction.amount.toLocaleString()} FCFA</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {transaction.status}
            </span>
            {transaction.errorMessage && (
                <p className="text-red-600 text-sm mt-2 text-center px-4">{transaction.errorMessage}</p>
            )}
        </div>

        {/* DETAILS GRID */}
        <div className="p-6 space-y-6">
            
            {/* FLOW: Payer -> Receiver */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">PAYER</p>
                    <p className="font-bold text-gray-900 text-sm">{transaction.payerPhone}</p>
                    <p className="text-xs text-gray-400">{transaction.clientName}</p>
                </div>
                <ArrowRight className="text-gray-300" />
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">RECEIVER</p>
                    <p className="font-bold text-gray-900 text-sm">{transaction.receiverPhone}</p>
                </div>
            </div>

            {/* TECHNICAL DETAILS */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <CreditCard className="h-3 w-3" /> METHOD
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{transaction.method.replace('_', ' ')}</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Globe className="h-3 w-3" /> OPERATOR
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{transaction.operator.replace('CAMEROON_', '')}</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Smartphone className="h-3 w-3" /> PRODUCT
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{transaction.type.replace('_', ' ')}</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Copy className="h-3 w-3" /> DATE
                    </div>
                    <p className="font-semibold text-gray-800 text-xs">
                        {new Date(transaction.date).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700">
                Close
            </button>
        </div>
      </div>
    </div>
  );
}