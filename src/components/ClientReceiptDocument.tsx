import type { ClientReceiptPayload } from '../utils/receiptStorage';
import { formatCurrency } from '../utils/formatters';

interface Props {
  data: ClientReceiptPayload;
}

const formatJoinedDate = (date?: string) => {
  if (!date) return new Date().toLocaleDateString('fr-FR');

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function ClientReceiptDocument({ data }: Props) {
  return (
    <div
      id="printable-receipt"
      className="mx-auto w-full max-w-[760px] bg-white text-slate-900 print:max-w-none"
    >
      <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-xl shadow-slate-200/60 print:rounded-none print:border-0 print:shadow-none">
        <div className="bg-linear-to-r from-[#1e3a8a] via-blue-900 to-slate-950 px-8 py-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-3xl font-black tracking-tight">
                HOREB<span className="text-[#FFC107]">PAY</span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/80">
                Customer Receipt
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/80">
                Receipt Ref
              </p>
              <p className="mt-1 font-mono text-sm">{data.id}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-8 py-8 md:grid-cols-[1.2fr,0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Customer Details
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Full Name
                </p>
                <p className="mt-1 text-2xl font-black text-[#1e3a8a]">
                  {data.client}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Phone
                  </p>
                  <p className="mt-2 font-mono text-sm font-semibold text-slate-800">
                    {data.phone}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                    {data.email || '-'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Account Summary
            </p>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </p>
                <div className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-green-700">
                  {data.status || 'Active'}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Current Balance
                </p>
                <p className="mt-2 text-xl font-black text-[#1e3a8a]">
                  {formatCurrency(data.balance ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Joined Date
                </p>
                <p className="mt-2 font-semibold text-slate-800">
                  {formatJoinedDate(data.date)}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-5">
          <div className="flex flex-col gap-2 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>Generated by HorebPay Admin Portal</p>
            <p>{new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
