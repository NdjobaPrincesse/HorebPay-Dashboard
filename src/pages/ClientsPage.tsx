import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Printer, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import ClientPrintModal from '../components/ClientPrintModal';
import type { ClientRow } from '../types';

const API_URL = "/api/clients"; 

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [modalClient, setModalClient] = useState<ClientRow | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const rawData = await response.json();
      const formatted = rawData.map((item: any) => ({
          id: item.clientId || item.id, 
          displayClient: item.nom ? `${item.nom.charAt(0)}***` : 'Unknown',
          _rawClient: `${item.nom || ''} ${item.prenom || ''}`,
          displayPhone: item.telephone ? `******${item.telephone.slice(-4)}` : 'N/A',
          _rawPhone: item.telephone,
          displayEmail: '-',
          _rawEmail: item.email,
          balance: item.balance || 0,
          status: item.email ? 'Active' : 'Guest'
      }));
      setClients(formatted);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter(c => c._rawClient.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-500 text-sm">View and manage your customer database.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900">
             <UserPlus className="h-4 w-4" /> Add Client
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <input 
             type="text" placeholder="Search clients..." 
             className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
             value={filterText} onChange={e => setFilterText(e.target.value)}
           />
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
                {isPrivacyMode ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>} 
                {isPrivacyMode ? 'Mask Data' : 'Show Data'}
            </button>
            <button onClick={fetchClients} className="p-2 border rounded-lg hover:bg-gray-50">
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto"/></td></tr> : 
                 filtered.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                             {isPrivacyMode ? client.displayClient : client._rawClient}
                        </td>
                        <td className="px-6 py-4 font-mono">
                             {isPrivacyMode ? client.displayPhone : client._rawPhone}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {client.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {client.balance.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4 text-right">
                             <button onClick={() => setModalClient(client)} className="text-gray-400 hover:text-amber-600">
                                <Printer className="h-4 w-4" />
                             </button>
                        </td>
                    </tr>
                ))}
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