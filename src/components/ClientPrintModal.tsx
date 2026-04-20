import { Printer, X, CheckCircle2 } from 'lucide-react';
import { storeClientReceipt } from '../utils/receiptStorage';

interface Client {
  id: string;
  client: string;
  phone: string;
  email: string;
  date?: string;
  balance?: number;
  status?: string;
}

interface Props {
  client: Client | null;
  onClose: () => void;
}

const ClientPrintModal = ({ client, onClose }: Props) => {
  if (!client) return null;

  const handlePrint = () => {
    const receiptId = storeClientReceipt(client);
    window.open(`/client-receipt/${encodeURIComponent(receiptId)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Printer className="h-5 w-5 text-[#FFC107]" />
              Confirm Print
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-500 text-sm mb-6">
              Generate report for <strong>{client.client}</strong>?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-900">{client.client}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-mono font-medium text-gray-900">{client.phone}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handlePrint} className="px-4 py-2 text-sm font-bold text-black bg-[#FFC107] rounded-lg hover:bg-[#FFC107]/90 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientPrintModal;
