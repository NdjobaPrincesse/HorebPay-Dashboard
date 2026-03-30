import React from 'react';
import { BadgeDollarSign, Gift, Printer, Wallet } from 'lucide-react';
import type { Transaction } from '../../../types';
import { formatCurrency, formatBonus } from '../../../utils/formatters';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  data: Transaction[];
  isPrivacyMode: boolean;
  onPrint: (tx: Transaction) => void;
}

export const TransactionsTable = ({ data, isPrivacyMode, onPrint }: Props) => {
  return (
    <>
      <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
        <tr>
            <th className="px-8 py-5 tracking-wider">Date & Time</th>
            <th className="px-6 py-5 tracking-wider">Client</th>
            <th className="px-6 py-5 tracking-wider">Service</th>
            <th className="px-6 py-5 tracking-wider">Method</th>
            <th className="px-6 py-5 tracking-wider">Flow</th>
            <th className="px-6 py-5 tracking-wider">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <Wallet className="h-3.5 w-3.5" />
                Amount
              </span>
            </th>
            <th className="px-6 py-5 tracking-wider">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <BadgeDollarSign className="h-3.5 w-3.5" />
                Service Fees
              </span>
            </th>
            <th className="px-6 py-5 tracking-wider">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <Gift className="h-3.5 w-3.5" />
                Bonus
              </span>
            </th>
            <th className="px-6 py-5 tracking-wider text-center">Status</th>
            <th className="px-8 py-5 tracking-wider text-right no-print">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {data.map(t => (
            <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-8 py-5">
                    <div className="font-bold text-slate-700 font-mono">{new Date(t.date).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-[10px] text-slate-300 font-mono mt-1 truncate max-w-[100px]" title={t.txRef}>{t.txRef}</div>
                </td>
                <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 max-w-[140px] truncate">{isPrivacyMode ? 'Client ***' : t.clientName}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {t.clientId.slice(0,6)}...</div>
                </td>
                <td className="px-6 py-5">
                    <div className="font-medium text-slate-700">{t.product}</div>
                    <div className="text-xs text-slate-400 font-medium">{t.operator}</div>
                </td>
                <td className="px-6 py-5">
                    <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold border border-slate-200">{t.paymentMethod}</span>
                </td>
                <td className="px-6 py-5 text-xs">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between w-32"><span className="text-slate-400 font-bold">FROM</span> <span className="font-mono text-slate-600">{isPrivacyMode ? '***' : t.payerPhone}</span></div>
                        <div className="flex justify-between w-32"><span className="text-slate-400 font-bold">TO</span> <span className="font-mono text-slate-600">{isPrivacyMode ? '***' : t.receiverPhone}</span></div>
                    </div>
                </td>
                <td className="px-6 py-5 font-mono font-bold text-[#1e3a8a] text-base whitespace-nowrap">{isPrivacyMode ? '****' : formatCurrency(t.amount)}</td>
                <td className="px-6 py-5 font-mono font-bold text-amber-600 text-sm whitespace-nowrap">{isPrivacyMode ? '****' : formatCurrency(t.serviceFee)}</td>
                <td className="px-6 py-5 font-mono font-bold text-green-600 text-sm whitespace-nowrap">{isPrivacyMode ? '****' : formatBonus(t.bonus)}</td>
                <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5 items-center">
                        <StatusBadge type="PAY" status={t.paymentStatus} />
                        <StatusBadge type="TX" status={t.txStatus} />
                    </div>
                </td>
                <td className="px-8 py-5 text-right no-print">
                    <button onClick={() => onPrint(t)} className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/5 rounded-xl transition-all" title="Print Receipt"><Printer className="h-4 w-4"/></button>
                </td>
            </tr>
        ))}
      </tbody>
    </>
  );
};
