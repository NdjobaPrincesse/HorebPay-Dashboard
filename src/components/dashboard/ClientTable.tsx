import React from 'react';
import { Search, Printer, Loader2, UserX } from 'lucide-react';
import type { ClientRow } from '../../types'; 

interface Props {
  clients: ClientRow[];
  filterText: string;
  setFilterText: (text: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string) => void;
  onPrint: (client: ClientRow) => void;
  isPrivacyMode: boolean;
  loading: boolean;
}

export const ClientTable = ({ 
  clients, 
  filterText, 
  setFilterText, 
  selectedClientId, 
  setSelectedClientId, 
  onPrint, 
  isPrivacyMode, 
  loading 
}: Props) => {
  
  const filtered = clients.filter(c => 
    c._rawClient.toLowerCase().includes(filterText.toLowerCase()) ||
    c._rawPhone.includes(filterText)
  );

  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
      {/* Header & Search */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-700">Client Directory</h3>
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-3 py-1.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none transition-all"
            value={filterText} 
            onChange={e => setFilterText(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700 bg-gray-50/50">Client Name</th>
              <th className="px-6 py-3 font-semibold text-gray-700 bg-gray-50/50">Phone</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700 bg-gray-50/50">Balance</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700 bg-gray-50/50">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {/* LOADING STATE */}
             {loading && (
               <tr>
                 <td colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin mb-2 text-[#FFC107]" />
                      <p>Loading clients...</p>
                    </div>
                 </td>
               </tr>
             )}

             {/* EMPTY STATE (No Results) */}
             {!loading && filtered.length === 0 && (
               <tr>
                 <td colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <UserX className="h-10 w-10 mb-2 opacity-50" />
                      <p>No clients found matching "{filterText}"</p>
                    </div>
                 </td>
               </tr>
             )}

             {/* DATA ROWS */}
             {!loading && filtered.map(client => (
                <tr 
                    key={client.id} 
                    onClick={() => setSelectedClientId(client.id)}
                    className={`cursor-pointer transition-all duration-200 border-l-4 
                    ${selectedClientId === client.id 
                      ? 'bg-amber-50 border-[#FFC107]' 
                      : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                >
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {isPrivacyMode ? client.displayClient : client._rawClient}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {isPrivacyMode ? client.displayPhone : client._rawPhone}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${client.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {client.balance.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPrint(client); }} 
                            className="text-gray-400 hover:text-[#FFC107] hover:bg-amber-50 p-1.5 rounded-full transition-colors"
                            title="Print Client Details"
                        >
                            <Printer className="h-4 w-4" />
                        </button>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
