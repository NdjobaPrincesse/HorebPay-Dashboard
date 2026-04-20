import type { Client, Enterprise, Transaction } from '../types';
import type { ReportPayload } from '../utils/receiptStorage';
import { formatBonus, formatCurrency } from '../utils/formatters';

interface Props {
  payload: ReportPayload;
}

const isTransaction = (value: unknown): value is Transaction =>
  typeof value === 'object' && value !== null && 'txRef' in value;

const isClient = (value: unknown): value is Client =>
  typeof value === 'object' && value !== null && ('clientId' in value || 'firstLogin' in value);

const isEnterprise = (value: unknown): value is Enterprise =>
  typeof value === 'object' && value !== null && 'entrepriseId' in value;

export default function ReportDocument({ payload }: Props) {
  return (
    <div id="printable-receipt" className="mx-auto w-full max-w-[1100px] bg-white text-slate-900">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-xl shadow-slate-200/60 print:rounded-none print:border-0 print:shadow-none">
        <div className="bg-linear-to-r from-[#1e3a8a] via-blue-900 to-slate-950 px-8 py-8 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-3xl font-black tracking-tight">
                HOREB<span className="text-[#FFC107]">PAY</span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                {payload.title}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100/80">
                Generated At
              </p>
              <p className="mt-1 text-sm font-semibold">
                {new Date(payload.generatedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
              {payload.records.length} record{payload.records.length === 1 ? '' : 's'}
            </div>
            {payload.filters && payload.filters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {payload.filters.map((filter) => (
                  <span
                    key={filter}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            )}
          </div>

          {payload.tab === 'TRANSACTIONS' && (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Fees</th>
                    <th className="px-4 py-3 text-right">Bonus</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payload.records.filter(isTransaction).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{new Date(item.date).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3 font-semibold">{item.clientName}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.txRef}</td>
                      <td className="px-4 py-3">{item.paymentMethod}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.serviceFee)}</td>
                      <td className="px-4 py-3 text-right">{formatBonus(item.bonus)}</td>
                      <td className="px-4 py-3 text-right">{item.txStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {payload.tab === 'CLIENTS' && (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-right">Bonus</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payload.records.filter(isClient).map((item) => (
                    <tr key={item.id || item.clientId}>
                      <td className="px-4 py-3 font-semibold">{item.name || `${item.nom || ''} ${item.prenom || ''}`.trim() || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.phone || item.telephone || '-'}</td>
                      <td className="px-4 py-3">{item.email || '-'}</td>
                      <td className="px-4 py-3">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.balance ?? item.solde ?? 0)}</td>
                      <td className="px-4 py-3 text-right">{formatBonus(item.soldeBonus ?? 0)}</td>
                      <td className="px-4 py-3 text-right">{item.status || 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {payload.tab === 'ENTERPRISES' && (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Enterprise</th>
                    <th className="px-4 py-3">Manager</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payload.records.filter(isEnterprise).map((item) => (
                    <tr key={item.entrepriseId}>
                      <td className="px-4 py-3 font-semibold">{item.nom}</td>
                      <td className="px-4 py-3">{`${item.responsableNom || ''} ${item.responsablePrenom || ''}`.trim() || '-'}</td>
                      <td className="px-4 py-3">{item.responsableTelephone || item.telephone || '-'}</td>
                      <td className="px-4 py-3">{item.lieu || '-'}</td>
                      <td className="px-4 py-3">{new Date(item.dateCreationEntreprise).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.solde)}</td>
                      <td className="px-4 py-3 text-right">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
