import type { Transaction } from '../types';
import {
  FileText,
  Calendar,
  User,
  Briefcase,
} from 'lucide-react';

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
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ReceiptDocument({ data }: Props) {
  const isFailed =
    data.txStatus === 'FAILED' || data.paymentStatus === 'FAILED';

  const statusBg = isFailed ? 'bg-red-500' : 'bg-green-500';

  return (
    <div id="printable-receipt" className="mx-auto w-full max-w-[420px]">
      <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.15)]">

        {/* HEADER */}
        <div className="bg-[#1e3a8a] px-6 py-5 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-white tracking-[1.5px]">
              <span>HOREB</span>
              <span className="text-yellow-400">PAY</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[2px] text-blue-200">
              Transaction Receipt
            </p>
          </div>

          {/* STATUS BADGE */}
          <span
            className={`${statusBg} text-white px-4 py-1 rounded-full text-xs font-bold mt-[3px]`}
          >
            {data.paymentStatus}
          </span>
        </div>

        <div className="h-[3px] bg-yellow-400" />

        {/* BODY */}
        <div className="px-6 py-6 space-y-5 bg-[#f8fafc]">

          {/* TRANSACTION DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">
              Transaction Details
            </p>

            <div className="divide-y divide-slate-200">
              <Row icon={<FileText size={16} />} label="Receipt ID" value={data.txRef} mono />
              <Row icon={<Calendar size={16} />} label="Date & Time" value={formatReceiptDate(data.date)} />
              <Row icon={<User size={16} />} label="Client" value={data.clientName} />
              <Row icon={<Briefcase size={16} />} label="Service" value={data.product} />
            </div>
          </div>

          {/* PAYMENT FLOW */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">
              Payment Flow
            </p>

            <div className="flex items-center justify-between gap-3">
              <FlowBox title="Payer" value={data.payerPhone} />
              <div className="text-blue-500 text-xl font-bold">→</div>
              <FlowBox title="Receiver" value={data.receiverPhone} />
            </div>
          </div>

          {/* CHARGES */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">
              Charges
            </p>

            <div className="space-y-2">
              <AmountRow label="Amount" value={formatReceiptAmount(data.amount)} strong />
              <AmountRow label="Service Fee" value={formatReceiptAmount(data.serviceFee)} />
              <AmountRow label="Bonus" value={formatReceiptAmount(data.bonus)} />
            </div>
          </div>

          {/* NETWORK DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">
              Network Details
            </p>

            <div className="space-y-3">
              <AmountRow label="Payment Method" value={data.paymentMethod?.replaceAll('_', ' ') || '-'} />
              <AmountRow label="Operator" value={data.operator?.replaceAll('_', ' ') || '-'} />
              <AmountRow label="Payment Status" value={data.paymentStatus} status={isFailed} />
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {data.errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {data.errorMessage}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 text-center text-xs text-slate-500">
          Authorized by HorebPay Financial Services
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Row({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <span
        className={`text-sm font-semibold text-slate-800 text-right ${
          mono ? 'font-mono break-all' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function FlowBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex-1 bg-slate-50 border rounded-xl p-3 text-center">
      <p className="text-[10px] uppercase text-slate-400 mb-1">{title}</p>
      <p className="text-sm font-semibold text-blue-600 font-mono">
        {value}
      </p>
    </div>
  );
}

function AmountRow({
  label,
  value,
  strong,
  status,
}: {
  label: string;
  value: string;
  strong?: boolean;
  status?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm ${
          strong ? 'font-bold text-slate-800' : 'text-slate-700'
        } ${
          status
            ? 'text-red-500 font-semibold'
            : label === 'Payment Status'
            ? 'text-green-600 font-semibold'
            : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}