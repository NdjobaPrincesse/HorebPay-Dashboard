import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Printer, UserPlus, Eye, EyeOff, Loader2, Calendar, Users, UserCheck, UserX } from 'lucide-react';
import ClientPrintModal from '../components/ClientPrintModal';
import api from '../api/axios'; // Use our configured Axios for Auth Tokens
import type { ClientRow } from '../types';
import { extractCollection } from '../api/response';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [modalClient, setModalClient] = useState<ClientRow | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

  // --- FETCH & MAP DATA ---
  const fetchClients = async () => {
    setLoading(true);
    try {
      // We use 'api' instead of 'fetch' to ensure the Auth Token is sent
      const response = await api.get('/clients');
      const rawData = extractCollection<any>(response.data);
      
      const formatted: ClientRow[] = rawData.map((item: any) => {
        const rawName = `${item.nom || ''} ${item.prenom || ''}`.trim() || item.name || 'Unknown';
        const maskedName = rawName.length > 2 ? `${rawName.charAt(0)}***` : '***';
        
        return {
          id: item.clientId || item.id || Math.random().toString(),
          _rawClient: rawName,
          displayClient: maskedName,
          _rawPhone: item.telephone || item.phone || 'N/A',
          displayPhone: (item.telephone || item.phone) ? `******${(item.telephone || item.phone).slice(-4)}` : 'N/A',
          _rawEmail: item.email || '-',
          displayEmail: '-', // Emails are usually fully hidden in privacy mode
          date: item.createdAt || item.date ? new Date(item.createdAt || item.date).toLocaleDateString() : '-',
          balance: Number(item.balance ?? item.solde ?? 0),
          status: item.email ? 'Active' : 'Guest'
        };
      });
      setClients(formatted);
    } catch (e) { 
      console.error("Error fetching clients:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchClients(); }, []);

  // --- CALCULATE STATS ---
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const guestClients = totalClients - activeClients;

  const filtered = clients.filter(c => 
    c._rawClient.toLowerCase().includes(filterText.toLowerCase()) || 
    c._rawPhone.includes(filterText)
  );

  return (
    <div className="space-y-6 p-6">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-[#1e3a8a]">Client Management</h1>
            <p className="text-gray-500 text-sm">View and manage your customer database.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all font-medium">
             <UserPlus className="h-5 w-5" /> Add New Client
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* TOTAL CARD */}
        <div className="bg-[#1e3a8a] text-white p-6 rounded-xl shadow-lg flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Total Clients</p>
                <h2 className="text-4xl font-bold mt-2">{loading ? '...' : totalClients}</h2>
            </div>
            <div className="p-3 bg-blue-800/50 rounded-lg relative z-10">
                <Users className="h-8 w-8 text-white" />
            </div>
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-400/10 to-transparent" />
        </div>

        {/* ACTIVE CARD */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Users</p>
                <h2 className="text-4xl font-bold mt-2 text-gray-800">{loading ? '...' : activeClients}</h2>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
                <UserCheck className="h-8 w-8 text-green-600" />
            </div>
        </div>

        {/* GUEST CARD */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Guest / Inactive</p>
                <h2 className="text-4xl font-bold mt-2 text-gray-800">{loading ? '...' : guestClients}</h2>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
                <UserX className="h-8 w-8 text-amber-600" />
            </div>
        </div>
      </div>

      {/* 3. TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <input 
             type="text" placeholder="Search by Name or Phone..." 
             className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-[#FFC107] outline-none transition-all text-sm"
             value={filterText} onChange={e => setFilterText(e.target.value)}
           />
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsPrivacyMode(!isPrivacyMode)} 
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors
                ${isPrivacyMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
                {isPrivacyMode ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>} 
                {isPrivacyMode ? 'Masked' : 'Visible'}
            </button>
            <button 
                onClick={fetchClients} 
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 active:scale-95 transition-transform"
                title="Refresh List"
            >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {/* 4. TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Phone Number</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-16 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-[#FFC107]"/></td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="p-16 text-center text-gray-400">No clients found matching your search.</td></tr>
                    ) : (
                    filtered.map(client => (
                        <tr key={client.id} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {client.date}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                        {client._rawClient.charAt(0)}
                                    </div>
                                    <span className="truncate max-w-[150px]">
                                        {isPrivacyMode ? client.displayClient : client._rawClient}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-600">
                                {isPrivacyMode ? client.displayPhone : client._rawPhone}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {client._rawEmail}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => setModalClient(client)} 
                                    className="p-2 text-gray-400 hover:text-[#FFC107] hover:bg-amber-50 rounded-full transition-all"
                                    title="Print Details"
                                >
                                    <Printer className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    )))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Print Modal */}
      {modalClient && (
        <ClientPrintModal 
          client={{
            id: modalClient.id,
            client: modalClient._rawClient, // We pass raw name to print
            phone: modalClient._rawPhone,   // We pass raw phone to print
            email: modalClient._rawEmail,
            date: modalClient.date,
            balance: modalClient.balance,
            status: modalClient.status,
          }} 
          onClose={() => setModalClient(null)} 
        />
      )}
    </div>
  );
}
