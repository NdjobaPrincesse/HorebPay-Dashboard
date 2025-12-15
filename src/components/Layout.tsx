import type { ReactNode } from 'react';
import { Bell, Search, LayoutGrid } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    // Outer container: Flex column to stack Header on top of Content
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. HEADER (Full Width, Sticky) */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between shadow-sm">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
            {/* Added a small logo icon since the sidebar is gone */}
            <h2 className="text-3xl font-bold text-[#1e3a8a] tracking-wide">
                  HOREB <span className="text-[#FFC107] font-bold">PAY</span>
            </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Global Search..." 
                    className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#1e3a8a]/20 focus:bg-white transition-all outline-none w-64"
                />
            </div>
            
            <button className="p-2 text-gray-400 hover:text-[#1e3a8a] transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* Optional: User Avatar placeholder */}
        </div>
      </header>

      {/* 2. MAIN CONTENT (Full Space) */}
      <main className="flex-1 w-full bg-slate-50">
        <div className="p-6 md:p-8 w-full mx-auto">
            {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;