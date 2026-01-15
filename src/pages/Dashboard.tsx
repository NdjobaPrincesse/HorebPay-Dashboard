import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Banknote, Download, Filter, Search, RefreshCw, 
  Eye, EyeOff, ChevronDown, CheckCircle2, XCircle, AlertCircle, 
  ArrowRight, Wallet, Database, Printer, Calendar, LogOut
} from 'lucide-react';
import api from '../api/axios'; 
import { logout } from '../api/auth';
import { ApiService } from '../api/services'; 
import TransactionReceipt from '../components/TransactionReceipt';
import LogoutModal from '../components/LogoutModal';

// --- TYPES ---
interface Transaction {
  id: string;
  txRef: string;
  date: string;
  clientName: string;
  clientId: string;
  operator: string;
  product: string;
  paymentMethod: string;
  payerPhone: string;
  receiverPhone: string;
  amount: number;
  bonus: number; 
  paymentStatus: string; 
  txStatus: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  status: string;
  date: string;
}

// --- HELPERS ---

// 1. Standard Currency (Arrondit souvent le XOF)
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val);

// 2. NEW: Bonus Formatter (Force les décimales)
const formatBonus = (val: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 4 // Permet jusqu'à 4 décimales si nécessaire
  }).format(val) + ' FCFA';
};

const normalizeStatus = (status: any) => {
  if (!status) return 'PENDING';
  const s = String(status).toUpperCase().trim();
  if (['SUCCESS', 'SUCCES', 'PAYE', 'PAID', 'COMPLETED', 'TERMINÉ'].includes(s)) return 'SUCCESS';
  if (['FAILED', 'ECHEC', 'CANCELLED', 'REJETÉ', 'REJETE'].includes(s)) return 'FAILED';
  return 'PENDING';
};

const cleanStr = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'CLIENTS'>('TRANSACTIONS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false); 
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const [filters, setFilters] = useState({
    startDate: '', endDate: '', searchQuery: '', payer: '', receiver: '', minAmount: '', maxAmount: '', txStatus: 'ALL', paymentStatus: 'ALL'
  });

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching Data..."); 

      const [txRes, clientsRes] = await Promise.allSettled([
        ApiService.dashboard.getTransactions(),
        ApiService.dashboard.getClients()
      ]);

      if (txRes.status === 'fulfilled') {
        const rawData = txRes.value.data;
        const txData = Array.isArray(rawData) ? rawData : (rawData.content || []);
        
        const formattedTx = txData.map((t: any) => ({
          id: t.transactionsId || t.id || Math.random().toString(),
          txRef: t.transactionsId || t.txRef || 'REF-N/A',
          date: t.date || t.createdAt || new Date().toISOString(),
          clientName: t.clientNom || t.clientName || 'Unknown',
          clientId: t.clientId || '?',
          operator: t.operateurNom || t.operator || 'N/A',
          product: t.produitLibelle || t.product || 'N/A',
          paymentMethod: t.methodePaiementNom || '-',
          payerPhone: t.numeroPayeur || t.payerPhone || 'N/A',
          receiverPhone: t.numeroRecepteur || t.receiverPhone || 'N/A',
          amount: parseFloat(t.montant || t.amount || 0),
          bonus: parseFloat(t.bonus || 0), // Mapping raw bonus
          paymentStatus: normalizeStatus(t.statusPaiement),
          txStatus: normalizeStatus(t.statusTransaction || t.status)
        }));
        setTransactions(formattedTx.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }

      if (clientsRes.status === 'fulfilled') {
        const rawData = clientsRes.value.data;
        const clientsData = Array.isArray(rawData) ? rawData : (rawData.content || []);
        
        const formattedClients = clientsData.map((c: any) => ({
          id: c.clientId || c.id,
          name: `${c.nom || ''} ${c.prenom || ''}`.trim() || c.name || 'Unknown',
          phone: c.telephone || c.phone || 'N/A',
          email: c.email || 'N/A',
          balance: parseFloat(c.balance || 0),
          status: c.email ? 'Active' : 'Guest',
          date: c.createdAt || c.date || new Date().toISOString()
        }));
        setClients(formattedClients.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }

    } catch (e) {
      console.error("Fetch Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- FILTER LOGIC (UNCHANGED) ---
  const filteredData = useMemo(() => {
    const searchTerms = cleanStr(filters.searchQuery);

    if (activeTab === 'TRANSACTIONS') {
        const searchPayer = cleanStr(filters.payer);
        const searchReceiver = cleanStr(filters.receiver);
        const minAmt = filters.minAmount ? parseFloat(filters.minAmount) : null;
        const maxAmt = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
        
        let startTimestamp = 0;
        let endTimestamp = Infinity;
        if (filters.startDate) {
            const d = new Date(filters.startDate);
            d.setHours(0,0,0,0);
            startTimestamp = d.getTime();
        }
        if (filters.endDate) {
            const d = new Date(filters.endDate);
            d.setHours(23,59,59,999);
            endTimestamp = d.getTime();
        }

        return transactions.filter(item => {
            if (searchTerms) {
                const match = cleanStr(item.clientName).includes(searchTerms) || cleanStr(item.txRef).includes(searchTerms) || cleanStr(item.product).includes(searchTerms) || cleanStr(item.paymentMethod).includes(searchTerms);
                if (!match) return false;
            }
            if (searchPayer && !cleanStr(item.payerPhone).includes(searchPayer)) return false;
            if (searchReceiver && !cleanStr(item.receiverPhone).includes(searchReceiver)) return false;
            if (minAmt !== null && item.amount < minAmt) return false;
            if (maxAmt !== null && item.amount > maxAmt) return false;
            if (filters.txStatus !== 'ALL' && item.txStatus !== filters.txStatus) return false;
            if (filters.paymentStatus !== 'ALL' && item.paymentStatus !== filters.paymentStatus) return false;
            if (filters.startDate || filters.endDate) {
                const itemTime = new Date(item.date).getTime();
                if (itemTime < startTimestamp || itemTime > endTimestamp) return false;
            }
            return true;
        });
    } else {
        return clients.filter(c => {
            if (searchTerms) return cleanStr(c.name).includes(searchTerms) || cleanStr(c.phone).includes(searchTerms);
            return true;
        });
    }
  }, [transactions, clients, filters, activeTab]);

  const stats = useMemo(() => {
    if (activeTab === 'TRANSACTIONS') {
        const visibleTxs = filteredData as Transaction[];
        return {
            revenue: visibleTxs.filter(t => t.txStatus === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
            txCount: visibleTxs.length,
            clientCount: clients.length 
        };
    } else {
        const globalRevenue = transactions.filter(t => t.txStatus === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0);
        return {
            revenue: globalRevenue,
            txCount: transactions.length,
            clientCount: (filteredData as Client[]).length 
        };
    }
  }, [filteredData, transactions, clients, activeTab]);

  const exportCSV = () => {
    const isTx = activeTab === 'TRANSACTIONS';
    const headers = isTx 
        ? ["Date", "Ref", "Client", "Product", "Method", "Payer", "Receiver", "Amount", "Bonus", "Pay Status", "Tx Status"]
        : ["Date", "Name", "Phone", "Email", "Balance", "Status"];
    
    const rows = filteredData.map((t: any) => isTx 
        ? [new Date(t.date).toLocaleString(), `"${t.txRef}"`, `"${t.clientName}"`, t.product, t.paymentMethod, t.payerPhone, t.receiverPhone, t.amount, t.bonus, t.paymentStatus, t.txStatus]
        : [new Date(t.date).toLocaleString(), `"${t.name}"`, t.phone, t.email, t.balance, t.status]
    );

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `horebpay_${activeTab.toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintList = () => { window.print(); };
  const resetFilters = () => setFilters({ startDate: '', endDate: '', searchQuery: '', payer: '', receiver: '', minAmount: '', maxAmount: '', txStatus: 'ALL', paymentStatus: 'ALL' });

  return (
    <div className="min-h-screen w-full font-sans text-slate-800 pb-20 p-4 md:p-6 lg:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 pb-2 border-b border-gray-200/60 mb-8 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">HOREB PAY</h1><h1 className = "text-2xl md:text-3xl font-extrabold text-[#FFC107] tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Real-time overview of HorebPay ecosystem.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
           <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
                <button onClick={() => setActiveTab('TRANSACTIONS')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-white shadow text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Transactions</button>
                <button onClick={() => setActiveTab('CLIENTS')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'CLIENTS' ? 'bg-white shadow text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Clients</button>
           </div>

           <div className="grid grid-cols-4 sm:flex sm:gap-2 gap-2">
                <button onClick={handlePrintList} className="flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-[#1e3a8a] text-white rounded-xl  font-semibold text-sm"><Printer className="h-4 w-4"/> <span className="hidden sm:inline ml-2">List</span></button>
                <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className={`flex items-center justify-center p-2 sm:px-3 rounded-xl border transition-all ${isPrivacyMode ? ' border-[#FFC107] text-[#FFC107]' : 'bg-white border-slate-200 text-slate-600'}`}>{isPrivacyMode ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button>
                <button onClick={fetchData} className="flex items-center justify-center p-2 sm:px-3 bg-white border rounded-xl text-slate-600"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
                <button onClick={exportCSV} className="flex items-center justify-center p-2 sm:px-4 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90"><Download className="h-4 w-4"/></button>
                <button onClick={() => setIsLogoutOpen(true)} className="flex items-center justify-center p-2 sm:px-3  border border-[#FFC107] rounded-2xl text-[#FFC107]  col-span-4 sm:col-span-1 mt-2 sm:mt-0"><LogOut className="h-4 w-4"/></button>
           </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 no-print">
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-6 rounded-2xl shadow-xl shadow-blue-900/10 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 p-6 opacity-10"><Banknote className="h-24 w-24" /></div>
            <div className="relative z-10">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                    {activeTab === 'TRANSACTIONS' && (filters.searchQuery || filters.startDate || filters.txStatus !== 'ALL') ? 'Filtered Revenue' : 'Total Revenue'}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{isPrivacyMode ? '••••••' : formatCurrency(stats.revenue)}</h2>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{activeTab === 'TRANSACTIONS' ? 'Filtered Transactions' : 'Total Transactions'}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{stats.txCount.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{activeTab === 'CLIENTS' ? 'Filtered Clients' : 'Total Users'}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{loading ? '...' : stats.clientCount.toLocaleString()}</h3>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 no-print">
        <div className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input type="text" placeholder={activeTab === 'TRANSACTIONS' ? "Search Ref, Client, Method..." : "Search Client Name, Phone..."} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107]" value={filters.searchQuery} onChange={(e) => setFilters({...filters, searchQuery: e.target.value})} />
            </div>
            {activeTab === 'TRANSACTIONS' && (
                <div className="flex gap-2">
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'}`}><Filter className="h-4 w-4"/> Filters <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}/></button>
                    <button onClick={resetFilters} className="px-4 py-2.5 text-sm text-[#1e3a8a] hover:bg-blue-50 rounded-xl">Reset</button>
                </div>
            )}
        </div>

        {activeTab === 'TRANSACTIONS' && (
            <div className={`transition-all duration-300 overflow-hidden border-t border-slate-100 ${showFilters ? 'max-h-[800px] opacity-100 p-4' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Tx Status</label><select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.txStatus} onChange={(e) => setFilters({...filters, txStatus: e.target.value})}><option value="ALL">All</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="PENDING">Pending</option></select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Payment Status</label><select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.paymentStatus} onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}><option value="ALL">All</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="PENDING">Pending</option></select></div>
                    <div className="space-y-1 sm:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Date Range</label><div className="flex gap-2"><input type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} /><span className="self-center text-slate-400">to</span><input type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} /></div></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Payer Phone</label><input type="text" placeholder="e.g. 699..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.payer} onChange={(e) => setFilters({...filters, payer: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Receiver Phone</label><input type="text" placeholder="e.g. 677..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.receiver} onChange={(e) => setFilters({...filters, receiver: e.target.value})} /></div>
                    <div className="col-span-full sm:col-span-2 pt-2 lg:pt-0 flex items-end"><div className="flex gap-2 items-center w-full"><span className="text-xs font-bold text-slate-500 uppercase w-12">Amt:</span><input type="number" placeholder="Min" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" value={filters.minAmount} onChange={(e) => setFilters({...filters, minAmount: e.target.value})} /><span className="text-slate-400">-</span><input type="number" placeholder="Max" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" value={filters.maxAmount} onChange={(e) => setFilters({...filters, maxAmount: e.target.value})} /></div></div>
                </div>
            </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden print-area">
        <div className="hidden print:block p-4 text-center border-b border-black">
             <h1 className="text-xl font-bold uppercase">HorebPay {activeTab} Report</h1>
             <p className="text-sm">Generated on: {new Date().toLocaleString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] print:min-w-0">
            <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase sticky top-0">
              <tr>
                {activeTab === 'TRANSACTIONS' ? (
                    <>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Product/Operator</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Flow (From - To)</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Bonus</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center no-print">Print</th>
                    </>
                ) : (
                    <>
                        <th className="px-6 py-4">Date Joined</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Balance</th>
                        <th className="px-6 py-4 text-center">Status</th>
                    </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={9} className="py-20 text-center"><RefreshCw className="animate-spin h-8 w-8 text-[#1e3a8a] mx-auto mb-2"/>Loading data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={9} className="py-20 text-center text-slate-400">No results found matching your filters.</td></tr>
              ) : (
                (filteredData as any[]).map((item) => {
                    if (activeTab === 'TRANSACTIONS') {
                        const t = item as Transaction;
                        return (
                            <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-slate-700 text-sm">{new Date(t.date).toLocaleDateString()}</div>
                                    <div className="text-xs text-slate-500">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">{t.txRef}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800 text-sm max-w-[180px] truncate">{isPrivacyMode ? 'Client ***' : t.clientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium">{t.product}</div>
                                    <div className="text-xs text-slate-400">{t.operator}</div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap"><span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{t.paymentMethod}</span></td>

                                <td className="px-6 py-4 text-xs whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2"><span className="text-slate-400 w-8">From:</span> <span className="font-mono">{isPrivacyMode ? '***' : t.payerPhone}</span></div>
                                        <div className="flex gap-2"><span className="text-slate-400 w-8">To:</span> <span className="font-mono">{isPrivacyMode ? '***' : t.receiverPhone}</span></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-[#1e3a8a] whitespace-nowrap">{isPrivacyMode ? '****' : formatCurrency(t.amount)}</td>
                                
                                {/* BONUS COLUMN WITH NEW FORMATTER */}
                                <td className="px-6 py-4 font-bold text-[#1e3a8a] whitespace-nowrap">{isPrivacyMode ? '****' : formatBonus(t.bonus)}</td>

                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5 items-center">
                                        <StatusBadge type="PAY" status={t.paymentStatus} />
                                        <StatusBadge type="TX" status={t.txStatus} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center no-print">
                                    <button onClick={() => setSelectedTx(t)} className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-full" title="Print Receipt"><Printer className="h-4 w-4"/></button>
                                </td>
                            </tr>
                        );
                    } else {
                        const c = item as Client;
                        return (
                            <tr key={c.id} className="hover:bg-amber-50/50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">{new Date(c.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{isPrivacyMode ? c.name.slice(0,1)+'***' : c.name}</td>
                                <td className="px-6 py-4 text-sm font-mono text-slate-600 whitespace-nowrap">{isPrivacyMode ? '***' : c.phone}</td>
                                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{isPrivacyMode ? '***' : c.email}</td>
                                <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{formatCurrency(c.balance)}</td>
                                <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-bold">{c.status}</span></td>
                            </tr>
                        );
                    }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTx && <TransactionReceipt data={selectedTx} onClose={() => setSelectedTx(null)} />}
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={logout} />
    </div>
  );
}

function StatusBadge({ type, status }: { type?: string, status: string }) {
  let colors = "bg-slate-100 text-slate-600 border-slate-200";
  let Icon = AlertCircle;
  if (status === 'SUCCESS') { colors = "bg-emerald-50 text-emerald-700 border-emerald-200"; Icon = CheckCircle2; }
  else if (status === 'FAILED') { colors = "bg-red-50 text-red-700 border-red-200"; Icon = XCircle; }
  else if (status === 'PENDING') { colors = "bg-amber-50 text-amber-700 border-amber-200"; Icon = RefreshCw; }
  
  return (
    <div className={`flex items-center justify-between w-24 px-2 py-0.5 rounded border text-[10px] font-bold ${colors}`}>
         {type && <span className="opacity-50 text-[9px] mr-1">{type}</span>}
         <div className="flex items-center gap-1">
            <Icon className={`h-3 w-3 ${status==='PENDING'?'animate-spin':''}`} /> 
            <span>{status.slice(0,4)}</span>
         </div>
    </div>
  );
}