import React from 'react';
import { X, Printer } from 'lucide-react';

interface Props {
  data: any;
  onClose: () => void;
}

const TransactionReceipt = ({ data, onClose }: Props) => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Hidden on Print */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 no-print">
          <h3 className="font-bold text-gray-700">Print Preview</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* RECEIPT CONTENT - This is what prints */}
        <div className="p-8 print-area overflow-y-auto bg-white" id="printable-receipt">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tighter">HOREBPAY</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Transaction Receipt</p>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-bold">{new Date(data.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono">{data.txRef}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Client</span>
                    <span className="font-bold">{data.clientName}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 mt-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Service</span>
                        <span className="font-bold text-gray-700">{data.product}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Payer</span>
                        <span className="font-mono text-xs">{data.payerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Receiver</span>
                        <span className="font-mono text-xs">{data.receiverPhone}</span>
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 my-6"></div>

            <div className="flex justify-between items-end">
                <span className="text-gray-600 font-bold">TOTAL AMOUNT</span>
                <span className="text-2xl font-black text-[#1e3a8a]">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(data.amount)}
                </span>
            </div>

            <div className="mt-8 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border
                    ${data.txStatus === 'SUCCESS' ? 'bg-green-100 text-green-800 border-green-200' : 
                      data.txStatus === 'FAILED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800'}`}>
                    {data.txStatus}
                </span>
                <p className="text-[10px] text-gray-400 mt-4">Thank you for your trust.</p>
            </div>
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-4 border-t bg-gray-50 no-print">
            <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all active:scale-95"
            >
                <Printer className="h-5 w-5" /> PRINT RECEIPT
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;