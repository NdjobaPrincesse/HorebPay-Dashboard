import type { ReactNode } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Bell, Search, Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    // Flex container to hold Sidebar + Main
    <div className="min-h-screen bg-slate-50 flex flex-row">
      
      {/* 1. SIDEBAR PLACEHOLDER (Invisible, preserves space for fixed sidebar) */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 min-h-screen flex flex-col w-full transition-all duration-300">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
            {/* Mobile Menu (Hidden on Desktop) */}
            <button className="md:hidden p-2 text-gray-600">
                <Menu className="w-6 h-6" />
            </button>

            {/* Page Title / Breadcrumb */}
            <div className="hidden md:block">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    HorebPay Workspace
                </h2>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Global Search..." 
                        className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#FFC107]/50 focus:bg-white transition-all outline-none w-64"
                    />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50">
            {children}
        </div>

      </main>
    </div>
  );
};

export default Layout;