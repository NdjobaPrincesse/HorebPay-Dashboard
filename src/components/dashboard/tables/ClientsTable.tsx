import React from 'react';
import type { Client } from '../../../types';
import { formatCurrency, formatBonus } from '../../../utils/formatters';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  data: Client[];
  isPrivacyMode: boolean;
}

export const ClientsTable = ({ data, isPrivacyMode }: Props) => {
  return (
    <>
      <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
        <tr>
          <th className="px-8 py-5 tracking-wider text-left">Joined</th>
          <th className="px-6 py-5 tracking-wider text-left">Identity</th>
          <th className="px-6 py-5 tracking-wider text-left">Contact</th>
          <th className="px-6 py-5 tracking-wider text-right min-w-[120px]">Balance</th> {/* ← right + min-width */}
          <th className="px-6 py-5 tracking-wider text-right min-w-[120px]">Bonus</th>    {/* ← right + min-width */}
          <th className="px-6 py-5 tracking-wider text-center">Status</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 text-sm">
        {data.map((c) => (
          <tr key={c.id} className="hover:bg-amber-50/30 transition-colors">
            {/* Joined */}
            <td className="px-8 py-5 text-left">
              <div className="font-mono text-xs text-slate-500">
                {new Date(c.date).toLocaleDateString('fr-CM', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </td>

            {/* Identity */}
            <td className="px-6 py-5 text-left">
              <div className="font-bold text-slate-700">
                {isPrivacyMode 
                  ? (c.name || '—').slice(0, 1) + '***' 
                  : c.name || '—'}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mt-0.5">
                Customer
              </div>
            </td>

            {/* Contact */}
            <td className="px-6 py-5 text-left text-sm">
              <div className="font-mono text-slate-600">
                {isPrivacyMode ? '***-***-***' : c.phone || '—'}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">
                {isPrivacyMode ? '***@***' : c.email || '—'}
              </div>
            </td>

            {/* Balance – right aligned, mono */}
            <td className="px-6 py-5 font-mono font-bold text-slate-800 text-right">
              {isPrivacyMode ? '••••••' : formatCurrency(c.balance || 0)}
            </td>

            {/* Bonus – right aligned, mono, amber */}
            <td className="px-6 py-5 font-mono font-bold text-slate-800 text-right">
              {isPrivacyMode ? '••••' : formatBonus(c.soldeBonus || 0)}
            </td>

            {/* Status */}
            <td className="px-6 py-5 text-center flex justify-center">
              <StatusBadge status={c.status || 'Active'} />
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
};
