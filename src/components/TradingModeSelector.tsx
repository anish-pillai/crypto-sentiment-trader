import React from 'react';
import { useStore } from '../store/useStore';
import { Briefcase, PlayCircle, History } from 'lucide-react';

export const TradingModeSelector: React.FC = () => {
  const { tradingMode, setTradingMode } = useStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Trading Mode</h2>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setTradingMode('live')}
          className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200
            ${tradingMode === 'live'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
        >
          <Briefcase className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Live Trading</span>
        </button>

        <button
          onClick={() => setTradingMode('paper')}
          className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200
            ${tradingMode === 'paper'
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 ring-2 ring-green-500'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
        >
          <PlayCircle className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Paper Trading</span>
        </button>

        <button
          onClick={() => setTradingMode('backtest')}
          className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200
            ${tradingMode === 'backtest'
              ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
        >
          <History className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Backtesting</span>
        </button>
      </div>
    </div>
  );
};