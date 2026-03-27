import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, Calculator, CheckCircle2, Smartphone, ShieldCheck, Wallet } from 'lucide-react';
import { ApiService } from '../api/services';
import { APP_CONFIG } from '../config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefilledPhone: string;
}

const DepositModal = ({ isOpen, onClose, prefilledPhone }: Props) => {
  const [formData, setFormData] = useState({ numeroBeneficiaire: '', montant: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ numeroBeneficiaire: prefilledPhone || '', montant: '' });
      setSuccessData(null);
      setError('');
    }
  }, [isOpen, prefilledPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const amount = Number(formData.montant);
      if (amount <= 0) throw new Error("Amount must be valid.");

      // 1. Fetch Fee Config
      const configRes = await ApiService.transactions.getConfig();
      const configItem = Array.isArray(configRes.data) ? configRes.data[0] : configRes.data;
      const percentage = configItem?.percentageFee || 0;
      
      const calculatedFee = (percentage / 100) * amount;

      // 2. Send Deposit
      const response = await ApiService.transactions.deposit({
        clientId: APP_CONFIG.DEPOSIT_CLIENT_ID,
        numeroBeneficiaire: formData.numeroBeneficiaire,
        montant: amount,
        frais: calculatedFee 
      });

      setSuccessData(response.data);

    } catch (err: any) {
      console.error("Deposit Error:", err);
      const msg = err.response?.data?.message || err.message || "Transaction failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3a8a]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-white/20">
        
        {/* --- SUCCESS VIEW (DIGITAL TICKET) --- */}
        {successData ? (
            <div className="relative bg-[#F8FAFB]">
                {/* Header Pattern */}
                <div className="h-32 bg-[#1e3a8a] rounded-b-[50%] absolute top-0 w-full z-0"></div>
                
                <div className="relative z-10 p-8 flex flex-col items-center">
                    <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce-short">
                        <CheckCircle2 className="h-10 w-10 text-green-500 fill-current"/>
                    </div>
                    
                    <h2 className="text-xl font-black text-slate-800 mb-1">Transfer Complete</h2>
                    <p className="text-xs text-slate-500 font-medium mb-6">Funds sent successfully</p>

                    {/* Receipt Card */}
                    <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                        
                        {/* Amount */}
                        <div className="text-center mb-6">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                            <div className="text-3xl font-black text-[#1e3a8a]">
                                {new Intl.NumberFormat('fr-FR').format(successData.montant)} <span className="text-sm text-slate-400">XOF</span>
                            </div>
                        </div>

                        {/* Dashed Line */}
                        <div className="w-full border-t-2 border-dashed border-slate-100 my-4 relative">
                            <div className="absolute -left-7 -top-3 w-6 h-6 bg-[#F8FAFB] rounded-full"></div>
                            <div className="absolute -right-7 -top-3 w-6 h-6 bg-[#F8FAFB] rounded-full"></div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Ref</span>
                                <span className="font-mono font-bold text-slate-600">{successData.transactionsId}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">To</span>
                                <span className="font-bold text-slate-800">{successData.numeroRecepteur}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Fee</span>
                                <span className="font-bold text-slate-800">{new Intl.NumberFormat('fr-FR').format(successData.fraisService || 0)} XOF</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="mt-6 w-full bg-[#1e3a8a] text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-900 transition-all active:scale-95"
                    >
                        Close Receipt
                    </button>
                </div>
            </div>
        ) : (
            // --- FORM VIEW (MODERN) ---
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="bg-white p-6 pb-2 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-[#1e3a8a]">Send Money</h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5"/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-4 flex-1 flex flex-col">
                    
                    {/* Amount Input Section */}
                    <div className="bg-[#F8FAFB] rounded-3xl p-6 mb-6 border border-slate-100 text-center relative group focus-within:ring-2 focus-within:ring-[#1e3a8a]/10 transition-all">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount to Send</label>
                        <div className="relative inline-block">
                            <input 
                                type="number" 
                                autoFocus 
                                required
                                className="text-5xl font-black text-[#1e3a8a] text-center w-full bg-transparent outline-none placeholder-slate-300"
                                placeholder="0"
                                value={formData.montant}
                                onChange={e => setFormData({...formData, montant: e.target.value})}
                            />
                            <span className="block text-xs font-bold text-slate-400 mt-1">XOF</span>
                        </div>
                    </div>

                    {/* Recipient Input */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1e3a8a]">
                                <Smartphone className="h-4 w-4"/>
                            </div>
                            <input 
                                type="text" 
                                required
                                placeholder="Recipient Phone (699...)"
                                className="w-full pl-14 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-mono text-sm font-bold text-slate-700 outline-none focus:border-[#FFC107] transition-all"
                                value={formData.numeroBeneficiaire}
                                onChange={e => setFormData({...formData, numeroBeneficiaire: e.target.value})}
                            />
                        </div>

                        {/* Fee Estimator */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-slate-400"/>
                                <span className="text-xs font-bold text-slate-500">Service Fee</span>
                            </div>
                            <span className="text-xs font-bold text-[#1e3a8a]">~3.0%</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold text-center rounded-xl border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="mt-auto pt-6">
                        <button 
                            type="submit" 
                            disabled={loading || !formData.montant || !formData.numeroBeneficiaire}
                            className="w-full bg-[#1e3a8a] text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-900 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5"/> : (
                                <>
                                    <span className="text-[#FFC107]"><Wallet className="h-5 w-5"/></span>
                                    <span>Confirm Transfer</span>
                                    <ArrowRight className="h-4 w-4 opacity-50"/>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default DepositModal;