import type { LucideIcon } from 'lucide-react'; 

interface StatCardProps {
  title: string;
  amount: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  hidden?: boolean; 
}

export default function StatCard({ title, amount, icon: Icon, trend, color = "bg-blue-500/10", hidden = false }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        
        {/* LOGIC: IF HIDDEN, SHOW ASTERISKS */}
        <h3 className="text-2xl font-bold text-gray-900 mt-2">
          {hidden ? '••••••' : amount}
        </h3>
        
        {trend && (
          <p className="text-xs font-medium text-green-600 mt-1 flex items-center gap-1">
             {hidden ? '' : trend}
          </p>
        )}
      </div>
      
    </div>
  );
}