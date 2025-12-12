import { ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import type { Transaction } from '../../types';

interface Props {
  transactions: Transaction[];
  loading: boolean;
  selectedClientId: string | null;
}

export const TransactionList = ({ transactions, loading, selectedClientId }: Props) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-700">Transactions</h3>
        {selectedClientId && <span className="text-xs text-gray-400 font-mono ml-2">ID: {selectedClientId.split('-')[0]}...</span>}
      </div>
      
      <div className="overflow-auto flex-1 bg-gray-50/50">
        {loading ? (
            <div className="flex h-full items-center justify-center text-gray-400 gap-2">
                <Loader2 className="animate-spin h-5 w-5" /> Loading History...
            </div>
        ) : transactions.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                No transactions found.
            </div>
        ) : (
            transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border-b border-gray-100 bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4"/> : <ArrowUpRight className="h-4 w-4"/>}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                        </p>
                        <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            {tx.status}
                        </span>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};