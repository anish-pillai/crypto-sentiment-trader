import React from 'react';
import { useStore } from '../store/useStore';
import { ArrowDownRight, ArrowUpRight, History, RefreshCw } from 'lucide-react';
import { TradingPosition } from '../types/api';

export const TradeHistory: React.FC = () => {
  const { positions = [], fetchPositions } = useStore();

  const calculateProfit = (position: TradingPosition) => {
    if (!position.exitPrice || !position.entryPrice) return 0;
    return (
      ((position.exitPrice - position.entryPrice) / position.entryPrice) * 100
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRefresh = async () => {
    try {
      await fetchPositions('binance'); // Or get the exchange from store
    } catch (error) {
      console.error('Failed to refresh positions:', error);
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white'>
          <History className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          Trade History
        </h2>
        <button
          onClick={handleRefresh}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
          title='Refresh history'
        >
          <RefreshCw className='h-4 w-4 text-gray-600 dark:text-gray-400' />
        </button>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='text-left border-b border-gray-200 dark:border-gray-700'>
              <th className='pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400'>
                Type
              </th>
              <th className='pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400'>
                Symbol
              </th>
              <th className='pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400'>
                Entry Price
              </th>
              <th className='pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400'>
                Exit Price
              </th>
              <th className='pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400'>
                Size
              </th>
              <th className='pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400'>
                P/L %
              </th>
              <th className='pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400'>
                Date
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
            {positions.map((position) => {
              const profit = calculateProfit(position);
              return (
                <tr
                  key={position.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <td className='py-3 text-sm'>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        position.type === 'long'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {position.type === 'long' ? (
                        <ArrowUpRight className='h-4 w-4' />
                      ) : (
                        <ArrowDownRight className='h-4 w-4' />
                      )}
                      {position.type.charAt(0).toUpperCase() +
                        position.type.slice(1)}
                    </span>
                  </td>
                  <td className='py-3 text-sm text-gray-900 dark:text-white'>
                    {position.symbol}
                  </td>
                  <td className='py-3 text-sm text-gray-900 dark:text-white'>
                    {position.entryPrice
                      ? formatPrice(position.entryPrice)
                      : '-'}
                  </td>
                  <td className='py-3 text-sm text-gray-900 dark:text-white'>
                    {position.exitPrice ? formatPrice(position.exitPrice) : '-'}
                  </td>
                  <td className='py-3 text-sm text-gray-900 dark:text-white'>
                    {position.size.toFixed(8)}
                  </td>
                  <td className='py-3 text-sm'>
                    <span
                      className={`font-medium ${
                        profit > 0
                          ? 'text-green-600 dark:text-green-400'
                          : profit < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {profit > 0 ? '+' : ''}
                      {profit.toFixed(2)}%
                    </span>
                  </td>
                  <td className='py-3 text-sm text-gray-600 dark:text-gray-400'>
                    {formatDate(position.openTime || '')}
                  </td>
                </tr>
              );
            })}
            {positions.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className='py-4 text-center text-gray-500 dark:text-gray-400'
                >
                  No trades yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
