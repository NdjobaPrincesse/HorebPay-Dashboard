import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, Banknote, Calendar, Loader2, RefreshCw, Search, TrendingUp, Eye, EyeOff } from 'lucide-react';
import StatCard from '../components/StatCard';
import type { Transaction } from '../types';

const GLOBAL_TX_API = "/api/transactions"; 

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  // 1. PRIVACY STATE (Defaults to TRUE -> Hidden)
  const [hideValues, setHideValues] = useState(true);

  // --- FETCH LOGIC ---
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(GLOBAL_TX_API);
      if (!response.ok) throw new Error();
      const rawData = await response.json();
      
      const formatted: Transaction[] = Array.isArray(rawData) ? rawData.map((t: any) => ({
        id: t.transactionsId || t.id || Math.random().toString(),
        amount: parseFloat(t.montant || t.amount || 0), 
        date: t.date || new Date().toISOString(),
        type: t.produitLibelle || 'TRANSACTION', 
        status: t.statusTransaction || 'COMPLETED',
        clientName: t.clientNom || 'Unknown'
      })) : [];

      formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  // --- CALCULATIONS ---
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Filter logic
  const filtered = transactions.filter(t => 
    t.clientName?.toLowerCase().includes(filterText.toLowerCase()) ||
    t.amount.toString().includes(filterText)
  );

  return (
    <div className="space-y-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-500 text-sm">Global cashflow metrics.</p>
        </div>
        
        {/* RIGHT SIDE ACTIONS */}
        <div className="flex gap-3">
           {/* --- THE EYE TOGGLER IS HERE --- */}
           <button 
                onClick={() => setHideValues(!hideValues)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all shadow-sm
                ${hideValues 
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
                {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {hideValues ? 'Hidden' : 'Show Amount'}
            </button>

            <button onClick={fetchTransactions} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm">
               <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title="Total Revenue" 
            amount={`${totalVolume.toLocaleString()} FCFA`} 
            icon={Banknote} 
            color="bg-green-500/10" 
            trend="Total Sales"
            hidden={hideValues} 
        />

        <StatCard 
            title="Total Transactions" 
            amount={transactions.length.toString()} 
            icon={TrendingUp} 
            color="bg-blue-500/10" 
        />

        <StatCard 
            title="Success Rate" 
            amount="100%" 
            icon={CheckCircle2} 
            color="bg-amber-500/10" 
        />
      </div>

      {/* --- TRANSACTION LIST TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
            <h3 className="font-bold text-gray-700">Detailed History</h3>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />
            </div>
        </div>
        
        {/* List Content */}
        <div className="divide-y divide-gray-100">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FFC107]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
                    No transactions found.
                </div>
            ) : (
                filtered.map(tx => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                                <ArrowDownLeft className="h-5 w-5"/>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{tx.clientName}</p>
                                <p className="text-xs text-gray-400 font-mono">
                                    {new Date(tx.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            {/* HIDE AMOUNT IN LIST IF TOGGLED */}
                            <p className="font-bold font-mono text-green-600">
                                {hideValues ? '••••••' : `+${tx.amount.toLocaleString()} FCFA`}
                            </p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                                {tx.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}