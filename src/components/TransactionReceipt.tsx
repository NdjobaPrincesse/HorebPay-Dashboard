import React from 'react';
import { X, Printer, CheckCircle2, Share2 } from 'lucide-react';

interface Props {
  data: any;
  onClose: () => void;
}

const TransactionReceipt = ({ data, onClose }: Props) => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm no-print animate-in fade-in duration-300">
      {/* RESPONSIVE WIDTH: w-full max-w-sm */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative max-h-[90vh]">
        
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-[#1e3a8a] flex-shrink-0"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10 no-print">
            <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* RECEIPT CONTENT (Scrollable on small screens) */}
        <div className="p-6 sm:p-8 print-area bg-white overflow-y-auto" id="printable-receipt">
            
            {/* Logo Area */}
            <div className="flex flex-col items-center mb-6">
                <div className="text-2xl font-black text-[#1e3a8a] tracking-tight">
                    HOREB<span className="text-[#FFC107]">PAY</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">Transaction Receipt</div>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
                {data.txStatus === 'SUCCESS' ? (
                    <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                ) : (
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        <span className="text-2xl font-bold text-gray-400">#</span>
                    </div>
                )}
            </div>

            {/* Amount */}
            <div className="text-center mb-8">
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Total Amount</p>
                <h1 className="text-3xl font-black text-[#1e3a8a]">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(data.amount)}
                </h1>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold border ${
                    data.txStatus === 'SUCCESS' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                    {data.txStatus}
                </span>
            </div>

            {/* Dashed Divider */}
            <div className="w-full border-t-2 border-dashed border-gray-200 my-6 relative">
                <div className="absolute -left-10 -top-2.5 w-5 h-5 bg-black/60 rounded-full"></div>
                <div className="absolute -right-10 -top-2.5 w-5 h-5 bg-black/60 rounded-full"></div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold text-gray-800">{new Date(data.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 break-all ml-2">{data.txRef}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Service</span>
                    <span className="font-semibold text-gray-800">{data.product}</span>
                </div>
                
                <div className="my-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-blue-400 font-bold uppercase">From</span>
                        <span className="font-mono text-xs text-[#1e3a8a]">{data.payerPhone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-400 font-bold uppercase">To</span>
                        <span className="font-mono text-xs text-[#1e3a8a]">{data.receiverPhone}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-400">Authorized by HorebPay Financial Services</p>
                <p className="text-[10px] text-gray-300 mt-1">ID: {data.id}</p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 no-print flex-shrink-0">
            <button 
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a8a] text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all active:scale-95"
            >
                <Printer className="h-4 w-4" /> Print Receipt
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;