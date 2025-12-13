import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Printer, UserPlus, Eye, EyeOff, Loader2, Calendar, Users, UserCheck, UserX } from 'lucide-react';
import ClientPrintModal from '../components/ClientPrintModal';
import type { ClientRow } from '../types';

const API_URL = "/api/clients"; 

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
      const response = await fetch(API_URL);
      const rawData = await response.json();
      
      const formatted = rawData.map((item: any) => {
        const rawName = `${item.nom || ''} ${item.prenom || ''}`.trim();
        const maskedName = item.nom ? `${item.nom.charAt(0)}***` : 'Unknown';
        return {
          id: item.clientId || item.id || Math.random().toString(),
          _rawClient: rawName || 'Unknown',
          displayClient: maskedName,
          _rawPhone: item.telephone || 'N/A',
          displayPhone: item.telephone ? `******${item.telephone.slice(-4)}` : 'N/A',
          _rawEmail: item.email || '-',
          displayEmail: '-',
          date: item.date ? new Date(item.date).toLocaleDateString() : '-',
          balance: item.balance || 0,
          status: item.email ? 'Active' : 'Guest'
        };
      });
      setClients(formatted);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
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
    <div className="space-y-6">
      
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

      {/* 2. BIG STATS ROW (The "Bigger" Request) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* TOTAL CARD */}
        <div className="bg-[#1e3a8a] text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
            <div>
                <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">Total Clients</p>
                <h2 className="text-4xl font-bold mt-1">{loading ? '...' : totalClients}</h2>
            </div>
            <div className="p-3 bg-blue-800 rounded-lg">
                <Users className="h-8 w-8 text-white" />
            </div>
        </div>
      </div>

      {/* 3. TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <input 
             type="text" placeholder="Search by Name or Phone..." 
             className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-[#FFC107] focus:border-[#FFC107] outline-none transition-all"
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
            <button onClick={fetchClients} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600 active:scale-95 transition-transform">
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {/* 4. TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold tracking-wider sticky top-0">
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
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {client.date}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                             <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                                    {client._rawClient.charAt(0)}
                                </div>
                                {isPrivacyMode ? client.displayClient : client._rawClient}
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

      {/* Print Modal */}
      {modalClient && (
        <ClientPrintModal 
          client={{
            id: modalClient.id,
            client: modalClient._rawClient,
            phone: modalClient._rawPhone,
            email: modalClient._rawEmail
          }} 
          onClose={() => setModalClient(null)} 
          onConfirm={() => window.print()} 
        />
      )}
    </div>
  );
}