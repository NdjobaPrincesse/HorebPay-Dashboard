import { useMemo, useState } from 'react';
import { Check, Trash2, Zap, ChevronUp, ChevronDown, PauseCircle, PlayCircle, Calendar, Wallet  } from 'lucide-react';
import type { Enterprise } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

type SortKey = 'name' | 'manager' | 'status' | 'date' | null;

interface Props {
  data: Enterprise[];
  onAccept: (id: string) => void;
  onDeny: (id: string) => void;
  onRecharge: (id: string, name: string) => void;
  onSuspend: (id: string) => void;
  onUnsuspend: (id: string) => void;
}

export const EnterprisesTable = ({
  data,
  onAccept,
  onDeny,
  onRecharge,
  onSuspend,
  onUnsuspend,
}: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const enterpriseActionButtonClass =
    'inline-flex min-h-[40px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200';

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortKey) {
        case 'name':
          aValue = a.nom?.toLowerCase() || '';
          bValue = b.nom?.toLowerCase() || '';
          break;
        case 'manager':
          aValue = `${a.responsableNom || ''} ${a.responsablePrenom || ''}`.toLowerCase().trim();
          bValue = `${b.responsableNom || ''} ${b.responsablePrenom || ''}`.toLowerCase().trim();
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'date':
          aValue = new Date(a.dateCreationEntreprise || '1900-01-01').getTime();
          bValue = new Date(b.dateCreationEntreprise || '1900-01-01').getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';

    try {
      return new Date(dateStr).toLocaleDateString('fr-CM', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;

    return sortDirection === 'asc'
      ? <ChevronUp className="inline h-3.5 w-3.5" />
      : <ChevronDown className="inline h-3.5 w-3.5" />;
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'STATUT_VALIDATED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Approved
          </div>
        );
      case 'SUSPEND':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            Suspended
          </div>
        );
      case 'STATUT_REJECTED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border">
            Rejected
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            Pending
          </div>
        );
    }
  };

  return (
    <>
      <thead className="bg-slate-50/70 border-b border-slate-200 sticky top-0 z-10">
        <tr>
          <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase cursor-pointer" onClick={() => handleSort('name')}>
            Company <SortIcon column="name" />
          </th>

          {/* ✅ NEW BALANCE COLUMN */}
          <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase">
            Balance
          </th>

          <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase">
            RCCM / NIU
          </th>

          <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase">
            Location
          </th>

          <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase cursor-pointer" onClick={() => handleSort('manager')}>
            Manager <SortIcon column="manager" />
          </th>

          <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase">
            Contact
          </th>

          <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase">
            Email
          </th>

          <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-center">
            Status
          </th>

          <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">
            Actions
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 text-sm">
        {sortedData.map((e) => {
          const isApproved = e.status === 'STATUT_VALIDATED';
          const isSuspended = e.status === 'SUSPEND';

          return (
            <tr key={e.entrepriseId} className="hover:bg-slate-50 transition-colors">
              {/* COMPANY */}
              <td className="px-6 py-4">
                <div className="font-semibold">{e.nom}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(e.dateCreationEntreprise)}
                </div>
              </td>

              {/* ✅ BALANCE */}
              <td className="px-5 py-4">
                <div className={`flex items-center gap-2 font-semibold ${e.solde > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  <Wallet className="h-4 w-4" />
                  {formatCurrency(e.solde)}
                </div>
              </td>

              <td className="px-4 py-4 text-xs">
                {e.rccm || '-'} <br /> {e.niu || ''}
              </td>

              <td className="px-4 py-4">{e.lieu || '-'}</td>

              <td className="px-5 py-4">
                {e.responsableNom} {e.responsablePrenom}
              </td>

              <td className="px-5 py-4">
                {e.responsableTelephone || e.telephone}
              </td>

              <td className="px-5 py-4">
                {e.responsableEmail || e.email}
              </td>

              <td className="px-6 py-4 text-center">
                {renderStatus(e.status)}
              </td>

              <td className="px-6 py-4 text-left sm:text-right">
                {isApproved ? (
                  <div className="flex flex-col gap-2 items-stretch sm:items-end">
                    <button
                      onClick={() => onRecharge(e.entrepriseId, e.nom)}
                      className={`${enterpriseActionButtonClass} bg-[#1e3a8a] text-white shadow-sm hover:bg-blue-950 hover:shadow-md`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Recharge
                    </button>

                    <button
                      onClick={() => onSuspend(e.entrepriseId)}
                      className={`${enterpriseActionButtonClass} border border-amber-200 bg-white text-amber-700 hover:border-amber-300 hover:bg-amber-50`}
                    >
                      <PauseCircle className="h-3.5 w-3.5" />
                      Suspend
                    </button>
                  </div>
                ) : isSuspended ? (
                  <button
                    onClick={() => onUnsuspend(e.entrepriseId)}
                    className={`${enterpriseActionButtonClass} border border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50`}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Unsuspend
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 items-stretch sm:items-end">
                    <button
                      onClick={() => onAccept(e.entrepriseId)}
                      className={`${enterpriseActionButtonClass} bg-[#1e3a8a] text-white shadow-sm hover:bg-blue-950 hover:shadow-md`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>

                    <button
                      onClick={() => onDeny(e.entrepriseId)}
                      className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-3.5 py-2.5 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </>
  );
};
