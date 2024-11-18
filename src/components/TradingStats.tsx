import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart2, Activity, DollarSign, Briefcase } from 'lucide-react';

export const TradingStats: React.FC = () => {
  const stats = useStore((state) => state.tradingStats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        title="Total Trades"
        value={stats.totalTrades.toString()}
      />
      <StatCard
        icon={<Activity className="h-6 w-6 text-green-600 dark:text-green-400" />}
        title="Success Rate"
        value={`${stats.successRate.toFixed(1)}%`}
      />
      <StatCard
        icon={<DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
        title="Profit/Loss"
        value={`$${stats.profitLoss.toFixed(2)}`}
      />
      <StatCard
        icon={<Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
        title="Active Positions"
        value={stats.activePositions.toString()}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);