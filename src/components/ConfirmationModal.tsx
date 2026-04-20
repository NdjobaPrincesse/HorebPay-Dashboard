import React, { type ReactNode } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  tone?: 'danger' | 'warning' | 'success' | 'primary';
  isLoading?: boolean;
}

const toneStyles = {
  danger: {
    panel: 'border-red-100',
    badge: 'border-red-200 bg-white text-red-700 shadow-red-100/80',
    confirm: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
  },
  warning: {
    panel: 'border-amber-100',
    badge: 'border-amber-200 bg-white text-amber-500 shadow-amber-100/90',
    confirm: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25',
  },
  success: {
    panel: 'border-emerald-100',
    badge: 'border-emerald-200 bg-white text-emerald-600 shadow-emerald-100/90',
    confirm: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25',
  },
  primary: {
    panel: 'border-blue-100',
    badge: 'border-blue-200 bg-white text-blue-700 shadow-blue-100/90',
    confirm: 'bg-[#1e3a8a] hover:bg-blue-950 shadow-blue-900/20',
  },
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
  tone = 'danger',
  isLoading = false,
}: Props) => {
  if (!isOpen) return null;

  const styles = toneStyles[tone];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md overflow-hidden rounded-[2rem] border bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] ${styles.panel}`}>
        <div className="relative flex items-start justify-between gap-4 px-6 pt-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${styles.badge}`}>
              {icon ?? <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">{title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Please confirm this action before continuing
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${styles.confirm}`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
