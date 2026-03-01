import React, { useState, useMemo } from 'react';
import { Check, Trash2, Zap, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import type { Enterprise } from '../../../types'; // adjust path if needed
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  data: Enterprise[];
  onAccept: (id: string) => void;
  onDeny: (id: string) => void;
  onRecharge: (id: string, name: string) => void;
}

type SortKey = 'name' | 'manager' | 'status' | 'date' | null;

export const EnterprisesTable = ({ data, onAccept, onDeny, onRecharge }: Props) => {
  console.log('[TABLE DATA - FIRST ENTERPRISE]', data[0]);
  console.log('[ENTERPRISES TABLE RECEIVED DATA]', data);
  console.log('[FIRST ROW IN TABLE]', data[0]);

  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

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
          aValue = a.status === 'STATUS_APPROVED' ? 1 : 0;
          bValue = b.status === 'STATUS_APPROVED' ? 1 : 0;
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
    if (!dateStr) return '—';
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
    return sortDirection === 'asc' ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />;
  };

  return (
    <>
      <thead className="bg-slate-50/70 border-b border-slate-200 sticky top-0 z-10">
        <tr>
          <th
            className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => handleSort('name')}
          >
            Company <SortIcon column="name" />
          </th>

          {/* New column: Created */}
          <th
            className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => handleSort('date')}
          >
            Created <SortIcon column="date" />
          </th>

          <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">RCCM / NIU</th>
          <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
          <th
            className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => handleSort('manager')}
          >
            Manager <SortIcon column="manager" />
          </th>
          <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
          <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
          <th
            className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => handleSort('status')}
          >
            Status <SortIcon column="status" />
          </th>
          <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right no-print">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 text-sm">
        {sortedData.map((e) => {
          const isApproved = e.status === 'STATUS_APPROVED';
          const fullName = `${e.responsableNom || ''} ${e.responsablePrenom || ''}`.trim() || '—';
          const fullLocation = [e.lieu, e.rue, e.boitePostale].filter(Boolean).join(', ') || '—';
          const companyIdFull = e.entrepriseId;
          const emailFull = e.responsableEmail || e.email || '—';

          return (
            <tr key={e.entrepriseId} className="hover:bg-slate-50/70 transition-colors group">
              {/* Company Identity */}
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-800" title={e.nom}>
                  {e.nom}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono" title={`Full ID: ${companyIdFull}`}>
                  ID: {companyIdFull.slice(0, 8)}…
                </div>
              </td>

              {/* New: Created Date */}
              <td className="px-5 py-4 text-sm text-slate-600 font-medium" title={e.dateCreationEntreprise || '—'}>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(e.dateCreationEntreprise)}
                </div>
              </td>

              {/* RCCM / NIU */}
              <td className="px-4 py-4 text-xs font-mono text-slate-600" title={`${e.rccm || '—'} / ${e.niu || '—'}`}>
                {e.rccm || '—'}<br />
                {e.niu ? <span className="text-slate-400">NIU: {e.niu}</span> : null}
              </td>

              {/* Location */}
              <td className="px-4 py-4 text-sm text-slate-600" title={fullLocation}>
                <div className="truncate max-w-[140px]">{e.lieu || '—'}</div>
                {(e.rue || e.boitePostale) && (
                  <div className="text-xs text-slate-400 truncate max-w-[140px]">
                    {e.rue || ''} {e.boitePostale || ''}
                  </div>
                )}
              </td>

              {/* Manager */}
              <td className="px-5 py-4" title={fullName}>
                <div className="font-medium text-slate-700 truncate max-w-[140px]">
                  {fullName}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Manager</div>
              </td>

              {/* Contact Phone */}
              <td className="px-5 py-4 font-mono text-slate-700" title={e.responsableTelephone || e.telephone || '—'}>
                {e.responsableTelephone || e.telephone || '—'}
              </td>

              {/* Email */}
              <td className="px-5 py-4 text-sm text-slate-600 truncate max-w-[180px]" title={emailFull}>
                {emailFull}
              </td>

              {/* Status */}
              <td className="px-6 py-4 text-center" title={e.status}>
                {isApproved ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Approved
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    Pending
                  </div>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right no-print">
                <div className="flex flex-col items-end gap-2 w-36 ml-auto">
                  {isApproved ? (
                    <button
                      onClick={() => onRecharge(e.entrepriseId, e.nom)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-semibold rounded-lg shadow-md hover:bg-blue-900 transition-all text-xs"
                      title="Recharge enterprise account"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Recharge
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={() => onAccept(e.entrepriseId)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-semibold rounded-lg shadow-sm hover:bg-blue-900 transition-all text-xs"
                        title="Approve this enterprise"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() => onDeny(e.entrepriseId)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-all text-xs"
                        title="Reject & delete this request"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </>
  );
};