import React from 'react';
import { LogOut, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal = ({ isOpen, onClose, onConfirm }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1e3a8a]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 border border-gray-100">
        
        {/* Header */}
        <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="font-bold text-[#1e3a8a]">Sign Out</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-[#FFC107]/10 rounded-full flex items-center justify-center mb-4">
            <LogOut className="h-8 w-8 text-[#FFC107]" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Leaving so soon?</h2>
          <p className="text-sm text-gray-500">
            Your session will be closed. You will need to enter your credentials to access the dashboard again.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            Confirm Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;