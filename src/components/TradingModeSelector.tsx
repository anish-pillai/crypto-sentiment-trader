import React from 'react';
import { useStore } from '../store/useStore';

export const TradingModeSelector: React.FC = () => {
  const { tradingMode, setTradingMode } = useStore();

  return (
    <div className='mb-8'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Trading Mode
        </h2>
        <div className='flex space-x-4'>
          <button
            className={`px-4 py-2 rounded ${
              tradingMode === 'live'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
            onClick={() => setTradingMode('live')}
          >
            Live
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tradingMode === 'paper'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
            onClick={() => setTradingMode('paper')}
          >
            Paper
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tradingMode === 'backtest'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
            onClick={() => setTradingMode('backtest')}
          >
            Backtest
          </button>
        </div>
      </div>
      <div className='mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          {tradingMode === 'live'
            ? 'Live Trading'
            : tradingMode === 'paper'
            ? 'Paper Trading'
            : 'Backtest'}
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>
          {tradingMode === 'live'
            ? 'Trade with real funds using exchange API integration.'
            : tradingMode === 'paper'
            ? 'Practice trading with virtual funds in a risk-free environment.'
            : 'Check if your strategy works with past data.'}
        </p>
      </div>
    </div>
  );
};
