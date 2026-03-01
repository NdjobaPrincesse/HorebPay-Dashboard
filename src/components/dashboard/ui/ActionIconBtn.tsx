import React from 'react';

interface Props {
  onClick: () => void;
  icon: React.ReactNode;
  title?: string;
  active?: boolean;
}

export const ActionIconBtn = ({ onClick, icon, title, active }: Props) => (
    <button onClick={onClick} title={title} className={`p-2.5 rounded-xl border transition-all duration-200 ${active ? 'bg-[#FFC107]/10 border-[#FFC107] text-[#b45309]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
        {icon}
    </button>
);