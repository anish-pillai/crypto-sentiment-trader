import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Key, Lock, Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ApiKeyForm: React.FC = () => {
  const { addCredentials } = useStore();
  const [exchange, setExchange] = useState('binanceus');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchange || !apiKey || !apiSecret) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await addCredentials({ exchange, apiKey, apiSecret });
      toast.success('Exchange connected successfully');
      setApiKey('');
      setApiSecret('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to exchange', {
        duration: 5000,
        style: {
          maxWidth: '500px',
          wordBreak: 'break-word',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200'>
      <h2 className='text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white'>
        <Key className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        Add Exchange API Keys
      </h2>

      <div className='mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700'>
        <div className='flex gap-2'>
          <AlertTriangle className='h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
          <div className='text-sm text-amber-800 dark:text-amber-200'>
            <p className='font-medium mb-1'>Important:</p>
            <ul className='list-disc list-inside space-y-1'>
              <li>Use read-only API keys for maximum security</li>
              <li>Never share your API keys with anyone</li>
              <li>Make sure to enable spot trading permissions</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Exchange
          </label>
          <select
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='binanceus'>Binance.US</option>
            <option value='coinbase'>Coinbase</option>
            <option value='kraken'>Kraken</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            API Key
          </label>
          <input
            type='text'
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='Enter your API key'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            API Secret
          </label>
          <div className='relative'>
            <input
              type='password'
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter your API secret'
            />
            <Lock className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          </div>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md
                   transition-colors duration-200 flex items-center justify-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <>
              <Plus className='h-4 w-4 animate-spin' />
              Connecting...
            </>
          ) : (
            <>
              <Plus className='h-4 w-4' />
              Add Exchange
            </>
          )}
        </button>
      </form>
    </div>
  );
};
