import type { ReactNode } from 'react';
import { Bell, Search } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    // Outer container: Added Gradient Background
    <div className="min-h-screen bg-gradient-to-br from-[#FFC107]/10 via-[#F8FAFB] to-white flex flex-col font-sans">
      
      {/* 1. HEADER (Glassmorphism for modern feel) */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between shadow-sm">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-[#1e3a8a] tracking-tight">
                  HOREB<span className="text-[#FFC107]">PAY</span>
            </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Global Search..." 
                    className="pl-9 pr-4 py-2 bg-slate-100/50 border border-transparent focus:border-[#FFC107] rounded-full text-sm focus:bg-white transition-all outline-none w-64"
                />
            </div>
            
            <button className="p-2 text-gray-400 hover:text-[#1e3a8a] transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* User Avatar */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#0f172a] flex items-center justify-center text-[#FFC107] font-bold text-xs shadow-md border border-white">
                AD
            </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 w-full">
        <div className="p-6 md:p-8 w-full mx-auto">
            {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;