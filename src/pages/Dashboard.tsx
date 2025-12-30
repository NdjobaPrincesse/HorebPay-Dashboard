import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Banknote, Download, Filter, Search, RefreshCw, 
  Eye, EyeOff, ChevronDown, CheckCircle2, XCircle, AlertCircle, 
  ArrowRight, Wallet, Database, Printer, Calendar, LogOut
} from 'lucide-react';
import api from '../api/axios'; 
import { logout } from '../api/auth';
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
  paymentMethod: string; // NEW FIELD
  payerPhone: string;
  receiverPhone: string;
  amount: number;
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
const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val);

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
    date: '', 
    searchQuery: '', 
    payer: '',       
    receiver: '',    
    minAmount: '',
    maxAmount: '',
    status: 'ALL' 
  });

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching Data..."); 

      const [txRes, clientsRes] = await Promise.allSettled([
        api.get("/transactions"),
        api.get("/clients")
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
          paymentMethod: t.methodePaiementNom || '-', // MAPPING API FIELD
          payerPhone: t.numeroPayeur || t.payerPhone || 'N/A',
          receiverPhone: t.numeroRecepteur || t.receiverPhone || 'N/A',
          amount: parseFloat(t.montant || t.amount || 0),
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

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    const searchTerms = cleanStr(filters.searchQuery);

    if (activeTab === 'TRANSACTIONS') {
        const searchPayer = cleanStr(filters.payer);
        const searchReceiver = cleanStr(filters.receiver);
        const minAmt = filters.minAmount ? parseFloat(filters.minAmount) : null;
        const maxAmt = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
        
        let filterStart = 0, filterEnd = 0;
        if (filters.date) {
            const d = new Date(filters.date);
            d.setHours(0,0,0,0);
            filterStart = d.getTime();
            const e = new Date(filters.date);
            e.setHours(23,59,59,999);
            filterEnd = e.getTime();
        }

        return transactions.filter(item => {
            if (searchTerms) {
                const match = 
                    cleanStr(item.clientName).includes(searchTerms) ||
                    cleanStr(item.txRef).includes(searchTerms) ||
                    cleanStr(item.product).includes(searchTerms) ||
                    cleanStr(item.paymentMethod).includes(searchTerms); // ADDED SEARCH SUPPORT
                if (!match) return false;
            }
            if (searchPayer && !cleanStr(item.payerPhone).includes(searchPayer)) return false;
            if (searchReceiver && !cleanStr(item.receiverPhone).includes(searchReceiver)) return false;
            if (minAmt !== null && item.amount < minAmt) return false;
            if (maxAmt !== null && item.amount > maxAmt) return false;
            if (filters.status !== 'ALL') {
                const statusMatch = item.txStatus === filters.status || item.paymentStatus === filters.status;
                if (!statusMatch) return false;
            }
            if (filters.date) {
                const tDate = new Date(item.date).getTime();
                if (tDate < filterStart || tDate > filterEnd) return false;
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

  // --- STATS ---
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

  // --- EXPORT ---
  const exportCSV = () => {
    const isTx = activeTab === 'TRANSACTIONS';
    const headers = isTx 
        ? ["Date", "Ref", "Client", "Product", "Method", "Payer", "Receiver", "Amount", "Pay Status", "Tx Status"] // Added Method Header
        : ["Date", "Name", "Phone", "Email", "Balance", "Status"];
    
    const rows = filteredData.map((t: any) => isTx 
        ? [new Date(t.date).toLocaleString(), `"${t.txRef}"`, `"${t.clientName}"`, t.product, t.paymentMethod, t.payerPhone, t.receiverPhone, t.amount, t.paymentStatus, t.txStatus] // Added Method Data
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

  const handlePrintList = () => {
    window.print();
  };

  const resetFilters = () => setFilters({ date: '', searchQuery: '', payer: '', receiver: '', minAmount: '', maxAmount: '', status: 'ALL' });

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
                    {activeTab === 'TRANSACTIONS' && (filters.searchQuery || filters.date || filters.status !== 'ALL') ? 'Filtered Revenue' : 'Total Revenue'}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{isPrivacyMode ? '••••••' : formatCurrency(stats.revenue)}</h2>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                {activeTab === 'TRANSACTIONS' ? 'Filtered Transactions' : 'Total Transactions'}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{stats.txCount.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                {activeTab === 'CLIENTS' ? 'Filtered Clients' : 'Total Users'}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{loading ? '...' : stats.clientCount.toLocaleString()}</h3>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 no-print">
        <div className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder={activeTab === 'TRANSACTIONS' ? "Search Ref, Client, Method..." : "Search Client Name, Phone..."}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107]" 
                    value={filters.searchQuery} 
                    onChange={(e) => setFilters({...filters, searchQuery: e.target.value})} 
                 />
            </div>
            {activeTab === 'TRANSACTIONS' && (
                <div className="flex gap-2">
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'}`}>
                        <Filter className="h-4 w-4"/> Filters <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    <button onClick={resetFilters} className="px-4 py-2.5 text-sm text-[#FFC107] hover:bg-red-50 rounded-xl">Reset</button>
                </div>
            )}
        </div>

        {activeTab === 'TRANSACTIONS' && (
            <div className={`transition-all duration-300 overflow-hidden border-t border-slate-100 ${showFilters ? 'max-h-[800px] opacity-100 p-4' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Status</label><select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}><option value="ALL">All</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option></select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Date</label><input type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Payer</label><input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.payer} onChange={(e) => setFilters({...filters, payer: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Receiver</label><input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.receiver} onChange={(e) => setFilters({...filters, receiver: e.target.value})} /></div>
                    <div className="col-span-full pt-2"><div className="flex gap-2 items-center"><span className="text-xs font-bold text-slate-500 uppercase">Amt:</span><input type="number" placeholder="Min" className="w-24 px-2 py-1 bg-white border rounded text-sm" value={filters.minAmount} onChange={(e) => setFilters({...filters, minAmount: e.target.value})} /><span className="text-slate-400">-</span><input type="number" placeholder="Max" className="w-24 px-2 py-1 bg-white border rounded text-sm" value={filters.maxAmount} onChange={(e) => setFilters({...filters, maxAmount: e.target.value})} /></div></div>
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
                        <th className="px-6 py-4">Method</th> {/* NEW COLUMN HEADER */}
                        <th className="px-6 py-4">Flow (From - To)</th>
                        <th className="px-6 py-4">Amount</th>
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
                <tr><td colSpan={8} className="py-20 text-center"><RefreshCw className="animate-spin h-8 w-8 text-[#1e3a8a] mx-auto mb-2"/>Loading data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center text-slate-400">No results found matching your filters.</td></tr>
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
                                
                                {/* NEW METHOD COLUMN DATA */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{t.paymentMethod}</span>
                                </td>

                                <td className="px-6 py-4 text-xs whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2"><span className="text-slate-400 w-8">From:</span> <span className="font-mono">{isPrivacyMode ? '***' : t.payerPhone}</span></div>
                                        <div className="flex gap-2"><span className="text-slate-400 w-8">To:</span> <span className="font-mono">{isPrivacyMode ? '***' : t.receiverPhone}</span></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-[#1e3a8a] whitespace-nowrap">{isPrivacyMode ? '****' : formatCurrency(t.amount)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5 items-center">
                                        <StatusBadge type="PAY" status={t.paymentStatus} />
                                        <StatusBadge type="TX" status={t.txStatus} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center no-print">
                                    <button onClick={() => setSelectedTx(t)} className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-full" title="Print Receipt">
                                        <Printer className="h-4 w-4"/>
                                    </button>
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