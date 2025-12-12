import { Search, Printer } from 'lucide-react';
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
  clients, filterText, setFilterText, selectedClientId, setSelectedClientId, onPrint, isPrivacyMode, loading 
}: Props) => {
  
  const filtered = clients.filter(c => 
    c._rawClient.toLowerCase().includes(filterText.toLowerCase()) ||
    c._rawPhone.includes(filterText)
  );

  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-700">Client Directory</h3>
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" placeholder="Search..." 
            className="pl-9 pr-3 py-1 w-full border border-gray-300 rounded text-sm focus:ring-amber-500 focus:border-amber-500"
            value={filterText} onChange={e => setFilterText(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-6 py-3">Client Name</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3 text-right">Balance</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {/* Map logic goes here (same as before) */}
             {filtered.map(client => (
                <tr 
                    key={client.id} 
                    onClick={() => setSelectedClientId(client.id)}
                    className={`cursor-pointer transition-colors ${selectedClientId === client.id ? 'bg-amber-50 border-l-4 border-amber-500' : 'hover:bg-gray-50'}`}
                >
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {isPrivacyMode ? client.displayClient : client._rawClient}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                        {isPrivacyMode ? client.displayPhone : client._rawPhone}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {client.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPrint(client); }} 
                            className="text-gray-400 hover:text-amber-600 p-1"
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