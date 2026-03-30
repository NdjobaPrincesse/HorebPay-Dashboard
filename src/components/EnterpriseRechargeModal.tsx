import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, X, Zap, Loader2 } from 'lucide-react';
import { ApiService } from '../api/services';
import { formatCurrency } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (payload: { entrepriseId: string; amount: number; responseData: any }) => void | Promise<void>;
  prefilledId?: string; 
  prefilledName?: string;
}

const EnterpriseRechargeModal = ({ isOpen, onClose, onSuccess, prefilledId = '', prefilledName = '' }: Props) => {
  const [formData, setFormData] = useState({
    entrepriseId: prefilledId,
    entrepriseName: prefilledName,
    montant: '',
    masterSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [step, setStep] = useState<1 | 2>(1);

  // Update ID and Name if prefilled changes
  React.useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      entrepriseId: prefilledId,
      entrepriseName: prefilledName 
    }));
  }, [prefilledId, prefilledName]);

  React.useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setStatus('IDLE');
      setLoading(false);
      setFormData({
        entrepriseId: prefilledId,
        entrepriseName: prefilledName,
        montant: '',
        masterSecret: '',
      });
    }
  }, [isOpen, prefilledId, prefilledName]);

  const amount = Number(formData.montant);
  const isAmountValid = Number.isFinite(amount) && amount > 0;

  const goToConfirmationStep = () => {
    if (!isAmountValid) return;
    setStatus('IDLE');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid) return;
    setLoading(true);
    setStatus('IDLE');

    try {
      const response = await ApiService.enterprise.recharge({
        entrepriseId: formData.entrepriseId,
        montant: amount,
        masterSecret: formData.masterSecret
      });
      await onSuccess?.({
        entrepriseId: formData.entrepriseId,
        amount,
        responseData: response.data,
      });
      setStatus('SUCCESS');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/70">
        
        <div className="bg-[#1e3a8a] px-5 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#FFC107]" />
            <div>
              <h3 className="font-bold">Recharge Enterprise</h3>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Step {step} of 2
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="h-5 w-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gradient-to-b from-white to-slate-50/60">
          {step === 1 ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Enterprise</p>
                <div className="text-lg font-black text-slate-800">{formData.entrepriseName}</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Amount</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    required
                    min="1"
                    step="any"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-slate-800 shadow-sm outline-none transition-all focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFC107]/10"
                    value={formData.montant}
                    onChange={e => setFormData({...formData, montant: e.target.value})}
                    placeholder="Enter recharge amount"
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Enter the amount first. You will confirm the details on the next step.
                </p>
              </div>

              <button 
                type="button"
                onClick={goToConfirmationStep}
                disabled={!isAmountValid}
                className="w-full bg-[#1e3a8a] text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-blue-900 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-bold">Recharge Summary</p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Company Name</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{formData.entrepriseName}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p>
                  <p className="mt-1 text-lg font-black text-[#1e3a8a]">{formatCurrency(amount)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Master Secret</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-slate-800 shadow-sm outline-none transition-all focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFC107]/10"
                    value={formData.masterSecret}
                    onChange={e => setFormData({...formData, masterSecret: e.target.value})}
                    placeholder="Enter your master secret"
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Confirm the recap above, then enter your master secret to complete the recharge.
                </p>
              </div>

              {status === 'SUCCESS' && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-2xl text-center font-bold">
                  Recharge Successful!
                </div>
              )}
              {status === 'ERROR' && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-2xl text-center font-bold">
                  Recharge Failed. Check credentials.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button 
                  type="submit" 
                  disabled={loading || !formData.masterSecret.trim()}
                  className="flex-1 bg-[#1e3a8a] text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-blue-900 transition-all flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5"/> : 'Confirm Recharge'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnterpriseRechargeModal;
