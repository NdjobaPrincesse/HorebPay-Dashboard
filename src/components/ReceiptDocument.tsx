import type { Transaction } from '../types';

interface Props {
  data: Transaction;
}

const formatReceiptAmount = (amount: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatReceiptDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ReceiptDocument({ data }: Props) {
  const isSuccess = data.txStatus === 'SUCCESS';

  return (
    <div
      id="printable-receipt"
      className="mx-auto w-full max-w-[820px] bg-white text-slate-900 print:max-w-none print:shadow-none"
    >
      <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-xl shadow-slate-200/60 print:rounded-none print:border-0 print:shadow-none">
        <div className="h-3 w-full bg-[#1e3a8a]" />

        <div className="px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-3xl font-black tracking-tight text-[#1e3a8a]">
                HOREB<span className="text-[#FFC107]">PAY</span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Transaction Receipt
              </p>
            </div>

            <div className="sm:text-right">
              <div
                className={`inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                  isSuccess
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {data.txStatus}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Receipt Amount
              </p>
              <h1 className="mt-1 text-3xl font-black text-[#1e3a8a] sm:text-4xl">
                {formatReceiptAmount(data.amount)}
              </h1>
            </div>
          </div>

          <div className="grid gap-8 py-8 md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Transaction Details
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Reference</span>
                    <span className="max-w-[260px] break-all text-right font-mono text-xs text-slate-700">
                      {data.txRef}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Date</span>
                    <span className="text-right font-semibold text-slate-800">
                      {formatReceiptDate(data.date)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Client</span>
                    <span className="text-right font-semibold text-slate-800">
                      {data.clientName}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Client ID</span>
                    <span className="text-right font-mono text-xs text-slate-700">
                      {data.clientId}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Service</span>
                    <span className="text-right font-semibold text-slate-800">
                      {data.product}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                  Payment Flow
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Payer
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold text-[#1e3a8a]">
                      {data.payerPhone}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Receiver
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold text-[#1e3a8a]">
                      {data.receiverPhone}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Charges
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-semibold text-slate-800">
                      {formatReceiptAmount(data.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-semibold text-slate-800">
                      {formatReceiptAmount(data.serviceFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bonus</span>
                    <span className="font-semibold text-slate-800">
                      {formatReceiptAmount(data.bonus)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Network Details
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="text-right font-semibold text-slate-800">
                      {data.paymentMethod?.replaceAll('_', ' ') || '-'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Operator</span>
                    <span className="text-right font-semibold text-slate-800">
                      {data.operator?.replaceAll('_', ' ') || '-'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="text-right font-semibold text-slate-800">
                      {data.paymentStatus}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {data.errorMessage && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
              {data.errorMessage}
            </div>
          )}

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Authorized by HorebPay Financial Services
            </p>
            <p className="mt-2 text-xs text-slate-400">Receipt ID: {data.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
