import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  type?: string;
  status: string;
}

export const StatusBadge = ({ type, status }: Props) => {
  let style = "bg-slate-100 text-slate-500 border-slate-200";
  let Icon = AlertCircle;
  
  // Normalize checking
  const s = status?.toUpperCase() || 'PENDING';

  if (s === 'SUCCESS' || s === 'ACTIVE' || s.includes('VALIDATED') || s === 'APPROVED') { 
    style = "bg-emerald-50 text-emerald-700 border-emerald-200"; 
    Icon = CheckCircle2; 
  }
  else if (s === 'FAILED' || s === 'REJECTED') { 
    style = "bg-red-50 text-red-700 border-red-200"; 
    Icon = XCircle; 
  }
  else if (s === 'PENDING') { 
    style = "bg-amber-50 text-amber-700 border-amber-200"; 
    Icon = RefreshCw; 
  }
  
  return (
    <div className={`flex items-center justify-between w-28 px-2.5 py-1 rounded-full border text-[10px] font-bold ${style}`}>
         {type && <span className="opacity-50 text-[9px] mr-1">{type}</span>}
         <div className="flex items-center gap-1.5">
            <Icon className={`h-3 w-3 ${s === 'PENDING' ? 'animate-spin' : ''}`} /> 
            <span className="tracking-tight">{status.slice(0,10)}</span>
         </div>
    </div>
  );
};