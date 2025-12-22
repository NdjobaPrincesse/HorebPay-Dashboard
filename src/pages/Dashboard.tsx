import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Banknote, Download, Filter, Search, RefreshCw, 
  Eye, EyeOff, ChevronDown, CheckCircle2, XCircle, AlertCircle, 
  ArrowRight, Wallet, Database, Printer, Calendar
} from 'lucide-react';
import api from '../api/axios'; 
import TransactionReceipt from '../components/TransactionReceipt';

// --- TYPES ---
interface Transaction {
  id: string;
  txRef: string;
  date: string;
  clientName: string;
  clientId: string;
  operator: string;
  product: string;
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
  if (['SUCCESS', 'SUCCES', 'PAYE', 'PAID', 'COMPLETED'].includes(s)) return 'SUCCESS';
  if (['FAILED', 'ECHEC', 'CANCELLED', 'REJETÉ', 'REJETE'].includes(s)) return 'FAILED';
  return 'PENDING';
};

const cleanStr = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

export default function Dashboard() {
  // --- VIEW STATE ---
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'CLIENTS'>('TRANSACTIONS');

  // --- DATA STATE ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false); 
  
  // --- MODAL STATE ---
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // --- FILTER STATE ---
  const [filters, setFilters] = useState({
    date: '', 
    searchQuery: '', 
    payer: '',       
    receiver: '',    
    minAmount: '',
    maxAmount: '',
    status: 'ALL' 
  });

  // --- 1. DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching Data..."); 

      const [txRes, clientsRes] = await Promise.allSettled([
        api.get("/transactions"),
        api.get("/clients")
      ]);

      // PROCESS TRANSACTIONS
      if (txRes.status === 'fulfilled') {
        // Handle: Array vs Spring Boot Page Object ({ content: [...] })
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
          payerPhone: t.numeroPayeur || t.payerPhone || 'N/A',
          receiverPhone: t.numeroRecepteur || t.receiverPhone || 'N/A',
          amount: parseFloat(t.montant || t.amount || 0),
          paymentStatus: normalizeStatus(t.statusPaiement),
          txStatus: normalizeStatus(t.statusTransaction || t.status)
        }));
        setTransactions(formattedTx.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        console.error("Tx Fetch Failed", txRes.reason);
      }

      // PROCESS CLIENTS
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
        setClients(formattedClients);
      } else {
        console.error("Client Fetch Failed", clientsRes.reason);
      }

    } catch (e) {
      console.error("Critical Fetch Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. FILTER LOGIC ---
  const filteredData = useMemo(() => {
    const searchTerms = cleanStr(filters.searchQuery);

    if (activeTab === 'TRANSACTIONS') {
        // --- TRANSACTION FILTERS ---
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
            // Text Search
            if (searchTerms) {
                const match = 
                    cleanStr(item.clientName).includes(searchTerms) ||
                    cleanStr(item.txRef).includes(searchTerms) ||
                    cleanStr(item.product).includes(searchTerms);
                if (!match) return false;
            }
            // Advanced Fields
            if (searchPayer && !cleanStr(item.payerPhone).includes(searchPayer)) return false;
            if (searchReceiver && !cleanStr(item.receiverPhone).includes(searchReceiver)) return false;
            if (minAmt !== null && item.amount < minAmt) return false;
            if (maxAmt !== null && item.amount > maxAmt) return false;
            if (filters.status !== 'ALL' && item.txStatus !== filters.status) return false;
            // Date
            if (filters.date) {
                const tDate = new Date(item.date).getTime();
                if (tDate < filterStart || tDate > filterEnd) return false;
            }
            return true;
        });

    } else {
        // --- CLIENT FILTERS ---
        return clients.filter(c => {
            if (searchTerms) {
                return cleanStr(c.name).includes(searchTerms) || cleanStr(c.phone).includes(searchTerms);
            }
            return true;
        });
    }
  }, [transactions, clients, filters, activeTab]);

  // --- STATS ---
  const stats = useMemo(() => {
    return {
        revenue: transactions.filter(t => t.txStatus === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
        txCount: transactions.length,
        clientCount: clients.length
    };
  }, [transactions, clients]);

  // --- EXPORT CSV ---
  const exportCSV = () => {
    const isTx = activeTab === 'TRANSACTIONS';
    const headers = isTx 
        ? ["Date", "Ref", "Client", "Product", "Payer", "Receiver", "Amount", "Status"]
        : ["Date", "Name", "Phone", "Email", "Balance", "Status"];
    
    const rows = filteredData.map((t: any) => isTx 
        ? [new Date(t.date).toLocaleString(), `"${t.txRef}"`, `"${t.clientName}"`, t.product, t.payerPhone, t.receiverPhone, t.amount, t.txStatus]
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

  const resetFilters = () => setFilters({
    date: '', searchQuery: '', payer: '', receiver: '', minAmount: '', maxAmount: '', status: 'ALL'
  });

  return (
    <div className="min-h-screen w-full font-sans text-slate-800 pb-20 p-4 md:p-6 lg:p-8">
      
      {/* HEADER - HIDDEN ON PRINT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-gray-200/60 mb-8 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">Financial Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Real-time overview of HorebPay ecosystem.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {/* VIEW TOGGLE */}
           <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button 
                    onClick={() => setActiveTab('TRANSACTIONS')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-white shadow text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Transactions
                </button>
                <button 
                    onClick={() => setActiveTab('CLIENTS')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'CLIENTS' ? 'bg-white shadow text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Clients
                </button>
           </div>

           <div className="flex gap-2">
                <button onClick={handlePrintList} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 font-semibold text-sm">
                    <Printer className="h-4 w-4"/> <span className="hidden sm:inline">Print List</span>
                </button>
                <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className={`px-3 py-2 rounded-xl border transition-all ${isPrivacyMode ? 'bg-[#FFC107]/10 border-[#FFC107] text-[#b45309]' : 'bg-white border-slate-200 text-slate-600'}`}>
                    {isPrivacyMode ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
                <button onClick={fetchData} className="px-3 py-2 bg-white border rounded-lg text-slate-600">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 text-sm font-bold">
                    <Download className="h-4 w-4"/>
                </button>
           </div>
        </div>
      </div>

      {/* KPI CARDS - HIDDEN ON PRINT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 no-print">
        {/* Revenue */}
        <div className="md:col-span-1 bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-6 rounded-2xl shadow-xl shadow-blue-900/10 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 p-6 opacity-10"><Banknote className="h-24 w-24" /></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-200 mb-2">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm"><Wallet className="h-4 w-4"/></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{isPrivacyMode ? '••••••' : formatCurrency(stats.revenue)}</h2>
            </div>
        </div>

        {/* Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transactions</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{stats.txCount.toLocaleString()}</h3>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#1e3a8a] h-full rounded-full" style={{ width: '100%' }}></div>
             </div>
        </div>

        {/* Clients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Users</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{loading ? '...' : stats.clientCount.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl"><Database className="h-6 w-6" /></div>
            </div>
        </div>
      </div>

      {/* FILTERS SECTION - HIDDEN ON PRINT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 no-print">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Main Search */}
            <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder={activeTab === 'TRANSACTIONS' ? "Search Ref, Client, Product..." : "Search Client Name, Phone..."}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FFC107]" 
                    value={filters.searchQuery} 
                    onChange={(e) => setFilters({...filters, searchQuery: e.target.value})} 
                 />
            </div>

            {/* Toggle Advanced Filters (Only for Transactions) */}
            {activeTab === 'TRANSACTIONS' && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                        ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                        <Filter className="h-4 w-4"/> Filters <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                    </button>
                    <button onClick={resetFilters} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Reset</button>
                </div>
            )}
        </div>

        {/* EXPANDABLE ADVANCED FILTERS */}
        {activeTab === 'TRANSACTIONS' && (
            <div className={`transition-all duration-300 overflow-hidden border-t border-slate-100 ${showFilters ? 'max-h-[500px] opacity-100 p-4' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                        <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                            <option value="ALL">All</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="PENDING">Pending</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                        <input type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Payer Phone</label>
                        <input type="text" placeholder="e.g. 699..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.payer} onChange={(e) => setFilters({...filters, payer: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Receiver Phone</label>
                        <input type="text" placeholder="e.g. 677..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.receiver} onChange={(e) => setFilters({...filters, receiver: e.target.value})} />
                    </div>
                    <div className="col-span-full flex gap-4 pt-2 border-t border-slate-200 mt-2">
                        <div className="flex-1 flex gap-2 items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">Amount:</span>
                            <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.minAmount} onChange={(e) => setFilters({...filters, minAmount: e.target.value})} />
                            <span className="text-slate-400">-</span>
                            <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" value={filters.maxAmount} onChange={(e) => setFilters({...filters, maxAmount: e.target.value})} />
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden print-area">
        
        {/* PRINT HEADER - ONLY SHOWS WHEN PRINTING */}
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
                        <th className="px-6 py-4">Date & Ref</th>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Product/Operator</th>
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
                <tr><td colSpan={7} className="py-20 text-center"><RefreshCw className="animate-spin h-8 w-8 text-[#1e3a8a] mx-auto mb-2"/>Loading data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-slate-400">No results found matching your filters.</td></tr>
              ) : (
                (filteredData as any[]).map((item) => {
                    if (activeTab === 'TRANSACTIONS') {
                        const t = item as Transaction;
                        return (
                            <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700 text-sm">{new Date(t.date).toLocaleDateString()}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{t.txRef}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800 text-sm max-w-[180px] truncate">{isPrivacyMode ? 'Client ***' : t.clientName}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium">{t.product}</div>
                                    <div className="text-xs text-slate-400">{t.operator}</div>
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2"><span className="text-slate-400 w-8">From:</span> <span className="font-mono">{isPrivacyMode ? '***' : t.payerPhone}</span></div>
                                        <div className="flex gap-2"><span className="text-slate-400 w-8">To:</span> <span className="font-mono">{isPrivacyMode ? '***' : t.receiverPhone}</span></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-[#1e3a8a]">{isPrivacyMode ? '****' : formatCurrency(t.amount)}</td>
                                <td className="px-6 py-4 flex justify-center"><StatusBadge status={t.txStatus} /></td>
                                
                                {/* ACTION BUTTON - HIDDEN ON PRINT LIST */}
                                <td className="px-6 py-4 text-center no-print">
                                    <button 
                                      onClick={() => setSelectedTx(t)} 
                                      className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-full"
                                      title="Print Receipt"
                                    >
                                        <Printer className="h-4 w-4"/>
                                    </button>
                                </td>
                            </tr>
                        );
                    } else {
                        const c = item as Client;
                        return (
                            <tr key={c.id} className="hover:bg-amber-50/50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(c.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-slate-700">{isPrivacyMode ? c.name.slice(0,1)+'***' : c.name}</td>
                                <td className="px-6 py-4 text-sm font-mono text-slate-600">{isPrivacyMode ? '***' : c.phone}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{isPrivacyMode ? '***' : c.email}</td>
                                <td className="px-6 py-4 font-bold text-slate-800">{formatCurrency(c.balance)}</td>
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

      {/* MODAL FOR PRINTING INDIVIDUAL RECEIPTS */}
      {selectedTx && (
        <TransactionReceipt 
            data={selectedTx} 
            onClose={() => setSelectedTx(null)} 
        />
      )}

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let colors = "bg-slate-100 text-slate-600";
  let Icon = AlertCircle;
  if (status === 'SUCCESS') { colors = "bg-emerald-100 text-emerald-700"; Icon = CheckCircle2; }
  else if (status === 'FAILED') { colors = "bg-red-100 text-red-700"; Icon = XCircle; }
  else if (status === 'PENDING') { colors = "bg-amber-100 text-amber-700"; Icon = RefreshCw; }
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold w-fit ${colors}`}>
         <Icon className={`h-3 w-3 ${status==='PENDING'?'animate-spin':''}`} /> {status}
    </div>
  );
}