import React from 'react';

interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const TabButton = ({ label, active, onClick, icon }: Props) => (
    <button onClick={onClick} className={`relative z-10 flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 ${active ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-[#1e3a8a]/60 hover:text-[#1e3a8a]'}`}>
        {icon} {label}
    </button>
);
