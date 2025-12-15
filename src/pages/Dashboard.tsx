import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Banknote, ArrowRightLeft, Download, Filter, 
  Search, RefreshCw, Calendar, Eye, EyeOff, ChevronDown, 
  CheckCircle2, XCircle, AlertCircle, Globe, ArrowRight, Smartphone, Wallet,
  CreditCard, TrendingUp, LayoutGrid
} from 'lucide-react';

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

const API_URL = "/api/transactions"; 

export default function Dashboard() {
  const [rawData, setRawData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTER STATE ---
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchQuery: '', 
    payer: '',       
    receiver: '',    
    minAmount: '',
    maxAmount: '',
    status: 'ALL' 
  });

  // --- MOCK DATA FETCH ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      
      const formatted: Transaction[] = json.map((t: any) => ({
        id: t.transactionsId || Math.random().toString(),
        txRef: t.transactionsId || 'REF-N/A',
        date: t.date || new Date().toISOString(),
        clientName: t.clientNom || 'Unknown Client',
        clientId: t.clientId || t.clientNom || 'unknown',
        operator: t.operateurNom || 'N/A',
        product: t.produitLibelle || 'N/A',
        payerPhone: t.numeroPayeur || 'N/A',
        receiverPhone: t.numeroRecepteur || 'N/A',
        amount: parseFloat(t.montant || 0),
        paymentStatus: (t.statusPaiement || 'PENDING').toUpperCase(),
        txStatus: (t.statusTransaction || t.statusPaiement || 'PENDING').toUpperCase()
      }));

      setRawData(formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- FILTER ENGINE ---
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesGeneral = 
        item.clientName.toLowerCase().includes(searchLower) ||
        item.txRef.toLowerCase().includes(searchLower) ||
        item.product.toLowerCase().includes(searchLower) ||
        item.operator.toLowerCase().includes(searchLower);

      const matchesPayer = filters.payer ? item.payerPhone.includes(filters.payer) : true;
      const matchesReceiver = filters.receiver ? item.receiverPhone.includes(filters.receiver) : true;

      const itemDate = new Date(item.date).getTime();
      const afterStart = filters.startDate ? itemDate >= new Date(filters.startDate).getTime() : true;
      const beforeEnd = filters.endDate ? itemDate <= new Date(filters.endDate).setHours(23,59,59) : true;

      const matchesMin = filters.minAmount ? item.amount >= parseFloat(filters.minAmount) : true;
      const matchesMax = filters.maxAmount ? item.amount <= parseFloat(filters.maxAmount) : true;
      const matchesStatus = filters.status === 'ALL' ? true : item.paymentStatus === filters.status;

      return matchesGeneral && matchesPayer && matchesReceiver && afterStart && beforeEnd && matchesMin && matchesMax && matchesStatus;
    });
  }, [rawData, filters]);

  // --- STATS ---
  const stats = useMemo(() => {
    const totalRevenue = filteredData
      .filter(t => t.paymentStatus === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);

    const uniqueClients = new Set(filteredData.map(t => t.clientId)).size;

    return {
      revenue: totalRevenue,
      txCount: filteredData.length,
      clients: uniqueClients
    };
  }, [filteredData]);

  // --- EXPORT ---
  const exportCSV = () => {
    const headers = ["Date", "Ref", "Client", "Operateur", "Produit", "Payeur", "Recepteur", "Montant", "Statut Paiement", "Statut Transaction"];
    const rows = filteredData.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.txRef,
      t.clientName,
      t.operator,
      t.product,
      t.payerPhone,
      t.receiverPhone,
      t.amount,
      t.paymentStatus,
      t.txStatus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val);

  const resetFilters = () => setFilters({
    startDate: '', endDate: '', searchQuery: '', payer: '', receiver: '', minAmount: '', maxAmount: '', status: 'ALL'
  });

  return (
    <div className="space-y-8 font-sans text-slate-800 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Financial insights and transaction monitoring.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setIsPrivacyMode(!isPrivacyMode)} 
             className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 font-semibold text-sm shadow-sm
             ${isPrivacyMode ? 'bg-[#FFC107]/10 border-[#FFC107] text-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             {isPrivacyMode ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
             {isPrivacyMode ? 'Privacy On' : 'Privacy Off'}
           </button>
           <button 
             onClick={exportCSV} 
             className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-200 font-semibold text-sm"
           >
             <Download className="h-4 w-4"/> Export Report
           </button>
        </div>
      </div>

      {/* 2. KPI CARDS (Hero Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hero Card - Revenue (Primary Color) */}
        <div className="md:col-span-1 bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-6 rounded-2xl shadow-xl shadow-blue-900/10 text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Banknote className="h-24 w-24" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-200 mb-2">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm"><Wallet className="h-4 w-4"/></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {isPrivacyMode ? '••••••' : formatCurrency(stats.revenue)}
                </h2>
                <div className="mt-4 flex items-center gap-2">
                    {/* Secondary Color Accent */}
                    <span className="text-blue-200 text-xs">Successful payments</span>
                </div>
            </div>
        </div>

        {/* Secondary Card - Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Volume</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.txCount.toLocaleString()}</h3>
                </div>
                {/* Secondary Icon Color */}
            </div>
             <p className="text-xs text-slate-400">Transactions processed in current view</p>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                {/* Primary Color Bar */}
                <div className="bg-[#1e3a8a] h-full rounded-full" style={{ width: '70%' }}></div>
             </div>
        </div>

        {/* Secondary Card - Clients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Unique Clients</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.clients.toLocaleString()}</h3>
                </div>
                {/* Primary Icon Color */}
                <div className="p-3 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl">
                    <Users className="h-6 w-6" />
                </div>
            </div>
            <p className="text-xs text-slate-400">Distinct payers identified</p>
            <div className="flex -space-x-2 mt-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold">U{i}</div>
                ))}
                <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">+</div>
            </div>
        </div>
      </div>

      {/* 3. CONTROL PANEL (Filters) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toggle Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-[#1e3a8a]/10 p-2 rounded-lg text-[#1e3a8a]">
                    <Filter className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Advanced Filters</h3>
                    <p className="text-xs text-slate-500 hidden md:block">Refine your transaction list by specific criteria</p>
                </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${showFilters ? 'bg-[#1e3a8a] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    {showFilters ? 'Collapse Panel' : 'Expand Filters'} 
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}/>
                </button>
                <div className="w-[1px] h-8 bg-slate-200 hidden md:block"></div>
                <button 
                    onClick={resetFilters} 
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                    Reset
                </button>
            </div>
        </div>

        {/* Filter Body */}
        <div className={`transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50/30">
               {/* Focus Rings set to Secondary Color */}
               <div className="md:col-span-2 space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Global Search</label>
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FFC107] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search Reference, Name, or Operator..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none transition-all shadow-sm"
                        value={filters.searchQuery} onChange={(e) => setFilters({...filters, searchQuery: e.target.value})} 
                    />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
                 <div className="relative">
                    <select 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none appearance-none cursor-pointer shadow-sm"
                        value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUCCESS">Success Only</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date Range</label>
                 <div className="flex gap-2">
                    <input type="date" className="w-1/2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#FFC107] shadow-sm" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
                    <input type="date" className="w-1/2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#FFC107] shadow-sm" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payer Phone</label>
                 <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="e.g. 0504..." className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none shadow-sm"
                      value={filters.payer} onChange={(e) => setFilters({...filters, payer: e.target.value})} />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receiver Phone</label>
                 <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="e.g. 0708..." className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none shadow-sm"
                      value={filters.receiver} onChange={(e) => setFilters({...filters, receiver: e.target.value})} />
                 </div>
               </div>
               
               <div className="md:col-span-2 space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount Range</label>
                 <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Min</span>
                        <input type="number" className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107] shadow-sm" value={filters.minAmount} onChange={(e) => setFilters({...filters, minAmount: e.target.value})} />
                    </div>
                    <span className="text-slate-300">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Max</span>
                        <input type="number" className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107] shadow-sm" value={filters.maxAmount} onChange={(e) => setFilters({...filters, maxAmount: e.target.value})} />
                    </div>
                 </div>
               </div>
            </div>
        </div>
      </div>

      {/* 4. DATA TABLE (Pro Style) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead className="bg-slate-50/90 backdrop-blur-md text-slate-600 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Date & Ref</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Client Info</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Product</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Transaction Flow</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="py-24 text-center"><RefreshCw className="animate-spin h-10 w-10 text-[#1e3a8a] mx-auto mb-4"/><span className="text-slate-500 font-medium">Loading transactions...</span></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} className="py-24 text-center"><div className="flex flex-col items-center justify-center text-slate-400"><Search className="h-12 w-12 mb-4 opacity-20" /><p>No results found for these filters.</p></div></td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    
                    {/* Date/Ref */}
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                           <span className="font-bold text-slate-700 text-sm mb-1">{new Date(item.date).toLocaleDateString()}</span>
                           <span className="text-xs text-slate-400 font-mono">{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 w-fit">
                             {item.txRef.substring(0, 12)}...
                           </span>
                       </div>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1e3a8a]/10 to-white border border-blue-100 flex items-center justify-center text-[#1e3a8a] font-bold text-xs shadow-sm">
                            {item.clientName.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">{isPrivacyMode ? 'Client ' + item.clientId.slice(0,3) : item.clientName}</div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">ID: {item.clientId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-5">
                       <div className="text-sm font-medium text-slate-700">{item.product}</div>
                       <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Globe className="h-3 w-3" /> {item.operator}
                       </div>
                    </td>

                    {/* Flow */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 bg-slate-50/80 p-2 rounded-lg border border-slate-100 w-fit">
                          <div className="text-right">
                              <span className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">From</span>
                              {/* Highlight with Secondary color if active filter */}
                              <span className={`font-mono text-xs font-medium ${filters.payer ? 'text-[#b45309] bg-[#FFC107]/10 px-1 rounded' : 'text-slate-600'}`}>{isPrivacyMode ? '••• ••' : item.payerPhone}</span>
                          </div>
                          <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100">
                             <ArrowRight className="h-3 w-3 text-slate-400" />
                          </div>
                          <div>
                              <span className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">To</span>
                              <span className={`font-mono text-xs font-medium ${filters.receiver ? 'text-[#b45309] bg-[#FFC107]/10 px-1 rounded' : 'text-slate-600'}`}>{isPrivacyMode ? '••• ••' : item.receiverPhone}</span>
                          </div>
                      </div>
                    </td>

                    {/* Amount - Primary Color */}
                    <td className="px-6 py-5">
                       <div className="font-mono font-bold text-[#1e3a8a] text-base tracking-tight">
                         {isPrivacyMode ? '••••••' : formatCurrency(item.amount)}
                       </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 items-center">
                          <StatusBadge type="Payment" status={item.paymentStatus} />
                          <StatusBadge type="Transac" status={item.txStatus} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-between items-center text-xs text-slate-500 font-medium">
           <span>Showing {filteredData.length} results</span>
           {!isPrivacyMode && (
               <div className="flex items-center gap-2">
                   <span>Page Total:</span>
                   <span className="text-[#1e3a8a] font-bold text-sm bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">{formatCurrency(stats.revenue)}</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
}

// --- VISUAL COMPONENTS ---

function StatusBadge({ type, status }: { type: string, status: string }) {
  const isSuccess = status === 'SUCCESS';
  const isFailed = status === 'FAILED';
  const isPending = status === 'PENDING';

  let colors = "bg-slate-100 text-slate-600 border-slate-200";
  let Icon = AlertCircle;

  if (isSuccess) { 
      colors = "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100"; 
      Icon = CheckCircle2; 
  } else if (isFailed) { 
      colors = "bg-red-50 text-red-700 border-red-200"; 
      Icon = XCircle; 
  } else if (isPending) { 
      // Pending uses the Secondary Color (Amber/Yellow)
      colors = "bg-[#FFC107]/10 text-[#b45309] border-[#FFC107]/20"; 
      Icon = RefreshCw; 
  }

  return (
    <div className={`flex items-center justify-between px-2.5 py-1 rounded-full border text-[10px] font-bold w-32 ${colors} transition-transform hover:scale-105`}>
       <span className="opacity-60 uppercase tracking-wide text-[9px]">{type}</span>
       <div className="flex items-center gap-1.5">
         <Icon className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
         <span>{status}</span>
       </div>
    </div>
  );
}