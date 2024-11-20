import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export const TradeForm: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState(0);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const placeTrade = useStore((state) => state.placeTrade);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeTrade(symbol, amount, side);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 border border-red-500 p-4'
    >
      {' '}
      {/* Added border for visibility */}
      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          Symbol
        </label>
        <input
          type='text'
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          Amount
        </label>
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          Side
        </label>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}
          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
        >
          <option value='buy'>Buy</option>
          <option value='sell'>Sell</option>
        </select>
      </div>
      <button
        type='submit'
        className='w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
      >
        Place Trade
      </button>
    </form>
  );
};
