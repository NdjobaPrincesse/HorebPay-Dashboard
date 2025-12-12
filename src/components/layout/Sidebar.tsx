import { NavLink } from 'react-router-dom'; // Use NavLink for active states
import { LayoutDashboard, Users, CreditCard, PieChart, Settings, LogOut } from 'lucide-react';
import { logout } from '../../api/auth';

const menuItems = [
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: CreditCard, label: 'Transactions', href: '/transactions' },

];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#0F172A] text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800 shadow-2xl z-50">
      
      {/* 1. BRAND LOGO */}
      <div className="h-20 flex items-center px-8 border-b border-slate-800/50 bg-[#0F172A]">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Horeb<span className="text-[#FFC107]">Pay</span>
        </h1>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group font-medium text-sm tracking-wide
              ${isActive 
                ? 'bg-[#FFC107] text-black shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }
            `}
          >
            <item.icon className="w-5 h-5 transition-colors" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 3. USER PROFILE & LOGOUT */}
      <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-800/50 border border-slate-700">
           <div className="h-8 w-8 rounded-full bg-[#FFC107] flex items-center justify-center text-black font-bold text-xs">
             AD
           </div>
           <div className="overflow-hidden">
             <p className="text-sm font-bold text-white truncate">Borel</p>
             <p className="text-xs text-slate-400 truncate">admin@horeb.com</p>
           </div>
        </div>

        <button 
          onClick={logout} 
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-[#FFC107]  hover:text-[#FFC107] rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-[#FFC107]"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}