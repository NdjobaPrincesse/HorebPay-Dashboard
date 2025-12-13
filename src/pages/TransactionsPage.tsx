import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, Banknote, Loader2, RefreshCw, Search, TrendingUp, Eye, EyeOff } from 'lucide-react';
import StatCard from '../components/StatCard';
import TransactionDetailsModal from '../components/dashboard/TransactionDetailsModal'; 
import type { Transaction } from '../types';

const GLOBAL_TX_API = "/api/transactions"; 
const isSuccess = (status: string) => status?.toUpperCase() !== 'FAILED';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [hideValues, setHideValues] = useState(true);
  
 
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(GLOBAL_TX_API);
      if (!response.ok) throw new Error();
      const rawData = await response.json();
      
      const formatted: Transaction[] = Array.isArray(rawData) ? rawData.map((t: any) => ({
        id: t.transactionsId || Math.random().toString(), // Used for key
        amount: parseFloat(t.montant || 0), 
        date: t.date || new Date().toISOString(),
        type: t.produitLibelle || 'TRANSACTION', 
        status: t.statusPaiement || 'PENDING',
        clientName: t.clientNom || 'Unknown',
        
        
        txRef: t.transactionsId || 'N/A',
        payerPhone: t.numeroPayeur || 'N/A',
        receiverPhone: t.numeroRecepteur || 'N/A',
        method: t.methodePaiementNom || 'CASH',
        operator: t.operateurNom || 'N/A',
        errorMessage: t.errorMessage
      })) : [];

      formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(formatted);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const totalRevenue = transactions.filter(t => isSuccess(t.status)).reduce((sum, t) => sum + t.amount, 0);
  const successCount = transactions.filter(t => isSuccess(t.status)).length;
  const failCount = transactions.length - successCount;

  const filtered = transactions.filter(t => 
    t.clientName?.toLowerCase().includes(filterText.toLowerCase()) ||
    t.amount.toString().includes(filterText) || 
    t.txRef.toLowerCase().includes(filterText.toLowerCase()) 
  );

  return (
    <div className="space-y-6">
      
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a]">Financial Overview</h1>
          <p className="text-gray-500 text-sm">Global cashflow metrics.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setHideValues(!hideValues)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${hideValues ? 'bg-amber-50 border-[#FFC107] text-black' : 'bg-white border-gray-300 text-gray-700'}`}>
                {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {hideValues ? 'Hidden' : 'Show Amount'}
            </button>
            <button onClick={fetchTransactions} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue (Success)" amount={`${totalRevenue.toLocaleString()} FCFA`} icon={Banknote} color="bg-green-500/10" trend={`${successCount} Successful`} hidden={hideValues} />
        <StatCard title="Failed Transactions" amount={failCount.toString()} icon={XCircle} color="bg-red-500/10" trend="Needs Attention" />
        <StatCard title="Success Rate" amount={transactions.length > 0 ? `${Math.round((successCount / transactions.length) * 100)}%` : "0%"} icon={CheckCircle2} color="bg-amber-500/10" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
            <h3 className="font-bold text-gray-700">Transaction History</h3>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search ID, Client or Amount..." className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none" value={filterText} onChange={e => setFilterText(e.target.value)} />
            </div>
        </div>
        
        {/* List Content */}
        <div className="divide-y divide-gray-100">
            {loading ? (
                <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#FFC107]" /></div>
            ) : filtered.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-gray-400 text-sm">No transactions found.</div>
            ) : (
                filtered.map(tx => {
                    const successful = isSuccess(tx.status);
                    return (
                        <div 
                            key={tx.id} 
                            onClick={() => setSelectedTx(tx)} 
                            className="p-4 flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${successful ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {successful ? <ArrowDownLeft className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900 text-sm">{tx.clientName}</p>
                                        <span className="text-[10px] text-gray-400 font-mono border px-1 rounded">{tx.txRef.slice(-6)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400 font-mono">{new Date(tx.date).toLocaleDateString()}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                            {tx.method?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`font-bold font-mono ${successful ? 'text-green-600' : 'text-gray-400 line-through'}`}>
                                    {hideValues ? '••••••' : `${tx.amount.toLocaleString()} FCFA`}
                                </p>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${successful ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {tx.status}
                                    </span>
                                    <ArrowUpRight className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>

      {/* --- DETAIL MODAL --- */}
      <TransactionDetailsModal 
        transaction={selectedTx} 
        onClose={() => setSelectedTx(null)} 
      />

    </div>
  );
}