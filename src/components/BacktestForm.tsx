import React, { useState } from 'react';
import { Calendar, BarChart2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const BacktestForm: React.FC = () => {
  const { runBacktest, backtestResults } = useStore();
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !startDate || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await runBacktest(symbol, new Date(startDate), new Date(endDate));
      toast.success('Backtest completed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to run backtest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <BarChart2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        Backtest Strategy
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trading Pair
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="BNB/USDT">BNB/USDT</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md
                   transition-colors duration-200 flex items-center justify-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <BarChart2 className="h-4 w-4 animate-spin" />
              Running Backtest...
            </>
          ) : (
            <>
              <BarChart2 className="h-4 w-4" />
              Run Backtest
            </>
          )}
        </button>
      </form>

      {backtestResults && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {backtestResults.totalTrades}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {backtestResults.winRate.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Profit/Loss</p>
              <p className={`text-lg font-semibold ${
                backtestResults.profitLoss >= 0 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${backtestResults.profitLoss.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {(backtestResults.maxDrawdown * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};