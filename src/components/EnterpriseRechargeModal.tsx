import React, { useState } from 'react';
import { X, Zap, Loader2 } from 'lucide-react';
import { ApiService } from '../api/services';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefilledId?: string; 
  prefilledName?: string;
}

const EnterpriseRechargeModal = ({ isOpen, onClose, prefilledId = '', prefilledName = '' }: Props) => {
  const [formData, setFormData] = useState({
    entrepriseId: prefilledId,
    entrepriseName: prefilledName,
    montant: '',
    masterSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  // Update ID and Name if prefilled changes
  React.useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      entrepriseId: prefilledId,
      entrepriseName: prefilledName 
    }));
  }, [prefilledId, prefilledName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('IDLE');

    try {
      await ApiService.enterprise.recharge({
        entrepriseId: formData.entrepriseId,
        montant: Number(formData.montant),
        masterSecret: formData.masterSecret
      });
      setStatus('SUCCESS');
      setTimeout(() => {
        onClose();
        setStatus('IDLE');
        setFormData({ entrepriseId: '', entrepriseName: '', montant: '', masterSecret: '' });
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        <div className="bg-[#1e3a8a] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#FFC107]" />
            <h3 className="font-bold">Recharge Enterprise</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="h-5 w-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Enterprise Name</label>
            <input 
              type="text" 
              readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-gray-600 font-semibold outline-none cursor-not-allowed"
              value={formData.entrepriseName}
            />
            <input type="hidden" value={formData.entrepriseId} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Amount (Montant)</label>
            <input 
              type="number" 
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#FFC107] outline-none"
              value={formData.montant}
              onChange={e => setFormData({...formData, montant: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Master Secret</label>
            <input 
              type="password" 
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#FFC107] outline-none"
              value={formData.masterSecret}
              onChange={e => setFormData({...formData, masterSecret: e.target.value})}
            />
          </div>

          {status === 'SUCCESS' && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg text-center font-bold">
              Recharge Successful!
            </div>
          )}
          {status === 'ERROR' && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg text-center font-bold">
              Recharge Failed. Check credentials.
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1e3a8a] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-900 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5"/> : 'Validate Recharge'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterpriseRechargeModal;