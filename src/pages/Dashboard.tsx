import { Users, Wallet, ArrowRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back to HorebPay Admin.</p>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <StatCard title="Total Clients" amount="1,240" icon={Users} color="bg-blue-900/10" />
         <StatCard title="Daily Volume" amount="4.2M FCFA" icon={Wallet} color="bg-amber-500/10" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/clients" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-400 transition-all group">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Clients</h3>
            <p className="text-gray-500 text-sm mb-4">View directory, print receipts, and manage accounts.</p>
            <span className="text-amber-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Go to Clients <ArrowRight className="h-4 w-4" />
            </span>
        </Link>

        <Link to="/transactions" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition-all group">
            <h3 className="text-lg font-bold text-gray-800 mb-2">View Financials</h3>
            <p className="text-gray-500 text-sm mb-4">Check recent transactions, success rates, and volume.</p>
            <span className="text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Go to Transactions <ArrowRight className="h-4 w-4" />
            </span>
        </Link>
      </div>
    </div>
  );
}