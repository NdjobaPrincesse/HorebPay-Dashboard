import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Banknote, Download, Filter, Search, RefreshCw, 
  Eye, EyeOff, ChevronDown, CheckCircle2, XCircle, AlertCircle, 
  ArrowRight, Wallet, Database, Printer, Calendar
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
  originalStatus: string; 
}

// --- HELPERS ---
const normalizeStatus = (status: any) => {
  if (!status) return 'PENDING';
  const s = String(status).toUpperCase().trim();
  if (['SUCCESS', 'SUCCES', 'PAYE', 'PAID', 'CONFIRMED', 'TERMINÉ', 'COMPLETED'].includes(s)) return 'SUCCESS';
  if (['FAILED', 'ECHEC', 'CANCELLED', 'ANNULÉ', 'REJETÉ'].includes(s)) return 'FAILED';
  return 'PENDING';
};

const cleanStr = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val);

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalClientsCount, setTotalClientsCount] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTER STATE (Single Date) ---
  const [filters, setFilters] = useState({
    date: '', // Changed from startDate/endDate to single date
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
      // Simulating API calls for demonstration - replace with your actual endpoints
      const [txRes, clientsRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/clients")
      ]);

      const txJson = await txRes.json();
      const clientsJson = await clientsRes.json();

      setTotalClientsCount(Array.isArray(clientsJson) ? clientsJson.length : 0);

      const formattedTx: Transaction[] = Array.isArray(txJson) ? txJson.map((t: any) => {
        const rawAmount = t.montant; 
        const cleanAmount = typeof rawAmount === 'string' 
          ? parseFloat(rawAmount.replace(/[^0-9.-]+/g,"")) 
          : parseFloat(rawAmount || 0);

        return {
          id: t.transactionsId || Math.random().toString(36).substr(2, 9),
          txRef: t.transactionsId || 'REF-N/A',
          date: t.date || new Date().toISOString(),
          clientName: t.clientNom || 'Unknown Client',
          clientId: t.clientId || 'unknown',
          operator: t.operateurNom || 'N/A',
          product: t.produitLibelle || 'N/A',
          payerPhone: t.numeroPayeur || 'N/A',
          receiverPhone: t.numeroRecepteur || 'N/A',
          amount: isNaN(cleanAmount) ? 0 : cleanAmount,
          paymentStatus: normalizeStatus(t.statusPaiement),
          txStatus: normalizeStatus(t.statusTransaction),
          originalStatus: t.statusTransaction
        };
      }) : [];

      setTransactions(formattedTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. FILTER LOGIC ---
  const filteredData = useMemo(() => {
    const searchTerms = cleanStr(filters.searchQuery);
    const searchPayer = cleanStr(filters.payer);
    const searchReceiver = cleanStr(filters.receiver);
    const minAmt = filters.minAmount ? parseFloat(filters.minAmount) : null;
    const maxAmt = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
    
    // Single Date Logic
    let filterDayStart = 0;
    let filterDayEnd = 0;
    
    if (filters.date) {
        const d = new Date(filters.date);
        d.setHours(0,0,0,0);
        filterDayStart = d.getTime();
        
        const endD = new Date(filters.date);
        endD.setHours(23,59,59,999);
        filterDayEnd = endD.getTime();
    }

    return transactions.filter(item => {
      // Global Search
      if (searchTerms) {
        const matchData = 
          cleanStr(item.clientName).includes(searchTerms) ||
          cleanStr(item.txRef).includes(searchTerms) ||
          cleanStr(item.product).includes(searchTerms) ||
          cleanStr(item.operator).includes(searchTerms);
        if (!matchData) return false;
      }

      // Specific Fields
      if (searchPayer && !cleanStr(item.payerPhone).includes(searchPayer)) return false;
      if (searchReceiver && !cleanStr(item.receiverPhone).includes(searchReceiver)) return false;

      // Date Check (Single Day)
      if (filters.date) {
          const itemTime = new Date(item.date).getTime();
          if (itemTime < filterDayStart || itemTime > filterDayEnd) return false;
      }

      // Amounts
      if (minAmt !== null && item.amount < minAmt) return false;
      if (maxAmt !== null && item.amount > maxAmt) return false;

      // Status
      if (filters.status !== 'ALL' && item.txStatus !== filters.status) return false;

      return true;
    });
  }, [transactions, filters]);

  // --- 3. REVENUE & STATS ---
  const stats = useMemo(() => {
    const totalRevenue = filteredData
      .filter(t => t.txStatus === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      revenue: totalRevenue,
      txCount: filteredData.length,
      activeInView: new Set(filteredData.map(t => t.clientId).filter(Boolean)).size
    };
  }, [filteredData]);

  // --- PRINT SINGLE RECEIPT ---
  const handlePrintReceipt = (tx: Transaction) => {
    const printWindow = window.open('', '', 'height=600,width=400');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Receipt - ${tx.txRef}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; color: #000; }
            .header { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .logo { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
            .label { text-align: left; font-weight: bold; }
            .value { text-align: right; }
            .total { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 15px 0; font-size: 16px; font-weight: bold; }
            .footer { font-size: 10px; margin-top: 20px; color: #555; }
            .status { margin-top: 10px; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">HOREBPAY</div>
            <div style="font-size: 10px;">Transaction Receipt</div>
          </div>
          
          <div class="row"><span class="label">Date:</span><span class="value">${new Date(tx.date).toLocaleString()}</span></div>
          <div class="row"><span class="label">Ref:</span><span class="value">${tx.txRef}</span></div>
          <div class="row"><span class="label">Client:</span><span class="value">${tx.clientName}</span></div>
          <div class="row"><span class="label">Operator:</span><span class="value">${tx.operator}</span></div>
          <div class="row"><span class="label">Product:</span><span class="value">${tx.product}</span></div>
          
          <div style="margin: 10px 0; border-top: 1px solid #eee;"></div>

          <div class="row"><span class="label">Payer:</span><span class="value">${tx.payerPhone}</span></div>
          <div class="row"><span class="label">Receiver:</span><span class="value">${tx.receiverPhone}</span></div>

          <div class="total">
            <div class="row" style="margin:0;">
              <span class="label">TOTAL:</span>
              <span class="value">${formatCurrency(tx.amount)}</span>
            </div>
          </div>

          <div class="status">STATUS: ${tx.txStatus}</div>

          <div class="footer">
            <p>Thank you for using HorebPay.</p>
            <p>Support: support@horebpay.com</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- EXPORT CSV ---
  const exportCSV = () => {
    const headers = ["Date", "Ref", "Client", "Operateur", "Produit", "Payeur", "Recepteur", "Montant", "Statut Paiement", "Statut Transaction"];
    const rows = filteredData.map(t => [
      new Date(t.date).toLocaleString(), `"${t.txRef}"`, `"${t.clientName}"`, t.operator, t.product, t.payerPhone, t.receiverPhone, t.amount, t.paymentStatus, t.txStatus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `horebpay_report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => setFilters({
    date: '', searchQuery: '', payer: '', receiver: '', minAmount: '', maxAmount: '', status: 'ALL'
  });

  return (
    <div className="min-h-screen w-full font-sans text-slate-800 pb-20 p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-gray-200/60 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">Financial Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Real-time overview of HorebPay ecosystem.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 font-semibold text-sm shadow-sm ${isPrivacyMode ? 'bg-[#FFC107]/10 border-[#FFC107] text-[#b45309]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
             {isPrivacyMode ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>} <span className="hidden sm:inline">{isPrivacyMode ? 'Masked' : 'Visible'}</span>
           </button>
           <button onClick={exportCSV} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-200 font-semibold text-sm">
             <Download className="h-4 w-4"/> Export CSV
           </button>
        </div>
      </div>

      {/* KPI CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* 1. REVENUE */}
        <div className="md:col-span-1 bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-6 rounded-2xl shadow-xl shadow-blue-900/10 text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Banknote className="h-24 w-24" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-200 mb-2">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm"><Wallet className="h-4 w-4"/></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {isPrivacyMode ? '••••••' : formatCurrency(stats.revenue)}
                </h2>
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-blue-200 text-xs">Based on Successful Tx</span>
                </div>
            </div>
        </div>

        {/* 2. TRANSACTIONS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Filtered Volume</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{stats.txCount.toLocaleString()}</h3>
                </div>
            </div>
             <p className="text-xs text-slate-400">Transactions in current view</p>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#1e3a8a] h-full rounded-full" style={{ width: '100%' }}></div>
             </div>
        </div>

        {/* 3. TOTAL CLIENTS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Users</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
                        {loading ? '...' : totalClientsCount.toLocaleString()}
                    </h3>
                </div>
                <div className="p-3 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl"><Database className="h-6 w-6" /></div>
            </div>
            <p className="text-xs text-slate-400">Registered in database</p>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-4 py-4 md:px-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="bg-[#1e3a8a]/10 p-2 rounded-lg text-[#1e3a8a]"><Filter className="h-5 w-5" /></div>
                <div><h3 className="text-sm font-bold text-slate-800">Advanced Filters</h3></div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showFilters ? 'bg-[#1e3a8a] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                    {showFilters ? 'Collapse' : 'Expand'} <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                </button>
                <button onClick={resetFilters} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium border border-transparent hover:border-red-100">Reset</button>
            </div>
        </div>

        <div className={`transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-slate-50/30">
               
               {/* Search */}
               <div className="md:col-span-2 space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Search</label>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input type="text" placeholder="Ref, Name, Product..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107] transition-colors" value={filters.searchQuery} onChange={(e) => setFilters({...filters, searchQuery: e.target.value})} />
                 </div>
               </div>

               {/* Status */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Tx Status</label>
                 <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107]" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="ALL">All Statuses</option><option value="SUCCESS">Success Only</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option>
                 </select>
               </div>

               {/* Single Date */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Date (Specific Day)</label>
                 <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107]" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
                 </div>
               </div>

               {/* Payer/Receiver */}
               <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Payer Phone</label><input type="text" placeholder="e.g. 0504..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107]" value={filters.payer} onChange={(e) => setFilters({...filters, payer: e.target.value})} /></div>
               <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Receiver Phone</label><input type="text" placeholder="e.g. 0708..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107]" value={filters.receiver} onChange={(e) => setFilters({...filters, receiver: e.target.value})} /></div>
               
               {/* Amount Range */}
               <div className="md:col-span-2 lg:col-span-2 space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Amount Range</label>
                 <div className="flex gap-3">
                   <input type="number" placeholder="Min" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107]" value={filters.minAmount} onChange={(e) => setFilters({...filters, minAmount: e.target.value})} />
                   <input type="number" placeholder="Max" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFC107]" value={filters.maxAmount} onChange={(e) => setFilters({...filters, maxAmount: e.target.value})} />
                 </div>
               </div>
            </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/90 backdrop-blur-md text-slate-600 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Date & Ref</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Client Info</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Product</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Flow</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={7} className="py-24 text-center"><RefreshCw className="animate-spin h-10 w-10 text-[#1e3a8a] mx-auto mb-4"/><span className="text-slate-500">Loading data...</span></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={7} className="py-24 text-center text-slate-400">No results match your filters.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 text-sm whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">{new Date(item.date).toLocaleTimeString()}</div>
                      <div className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded w-fit mt-1 font-mono">{item.txRef}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm max-w-[150px] truncate" title={item.clientName}>
                        {isPrivacyMode ? 'User ' + item.clientId.slice(0,3) : item.clientName}
                      </div>
                      <div className="text-xs text-slate-400">ID: {item.clientId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{item.product}</div>
                      <div className="text-xs text-slate-400">{item.operator}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs">
                          <div className="text-right">
                            <span className="block text-[9px] text-slate-400 uppercase">From</span>
                            <span className={`font-mono block ${filters.payer ? 'text-[#b45309] bg-[#FFC107]/20 px-1 rounded' : ''}`}>{isPrivacyMode ? '•••' : item.payerPhone}</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">To</span>
                            <span className={`font-mono block ${filters.receiver ? 'text-[#b45309] bg-[#FFC107]/20 px-1 rounded' : ''}`}>{isPrivacyMode ? '•••' : item.receiverPhone}</span>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-[#1e3a8a] text-base whitespace-nowrap">
                        {isPrivacyMode ? '••••••' : formatCurrency(item.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-center">
                        <StatusBadge type="PAY" status={item.paymentStatus} />
                        <StatusBadge type="TX" status={item.txStatus} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handlePrintReceipt(item)}
                        className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-full transition-all"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ type, status }: { type: string, status: string }) {
  let colors = "bg-slate-100 text-slate-600 border-slate-200";
  let Icon = AlertCircle;
  if (status === 'SUCCESS') { colors = "bg-emerald-50 text-emerald-700 border-emerald-200"; Icon = CheckCircle2; }
  else if (status === 'FAILED') { colors = "bg-red-50 text-red-700 border-red-200"; Icon = XCircle; }
  else if (status === 'PENDING') { colors = "bg-[#FFC107]/10 text-[#b45309] border-[#FFC107]/20"; Icon = RefreshCw; }
  return (
    <div className={`flex items-center justify-between px-2 py-0.5 rounded border text-[10px] font-bold w-24 ${colors}`}>
       <span className="opacity-50 text-[9px]">{type}</span>
       <div className="flex items-center gap-1">
         <Icon className={`h-3 w-3 ${status==='PENDING'?'animate-spin':''}`} />
         <span>{status.slice(0,4)}</span>
       </div>
    </div>
  );
}