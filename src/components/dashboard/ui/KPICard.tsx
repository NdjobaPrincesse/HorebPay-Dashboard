import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'gray' | 'orange';
}

export const KPICard = ({ title, value, icon, color = "blue" }: Props) => {
  const colors: any = {
    blue: "bg-blue-50 text-[#1e3a8a]",
    green: "bg-green-50 text-green-600",
    gray: "bg-slate-50 text-slate-500",
    orange: "bg-amber-50 text-amber-600"
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-start hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-[#1e3a8a] transition-colors">
          {title}
        </p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
          {value}
        </h3>
      </div>
      {icon && (
        <div className={`p-4 rounded-2xl ${colors[color] || colors.gray}`}>
          {icon}
        </div>
      )}
    </div>
  );
};