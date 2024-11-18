import React from 'react';
import { useStore } from '../store/useStore';
import { Wallet, ExternalLink, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExchangeBalances: React.FC = () => {
  const { credentials, exchangeBalances, removeCredentials, updateBalances, isLoadingBalances } = useStore();

  const handleRemoveExchange = async (exchange: string) => {
    try {
      await removeCredentials(exchange);
      toast.success(`Removed ${exchange} exchange`);
    } catch (error) {
      toast.error('Failed to remove exchange');
    }
  };

  const handleRefreshBalance = async (exchange: string) => {
    try {
      await updateBalances(exchange);
      toast.success(`Updated ${exchange} balances`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update balances');
    }
  };

  const maskApiKey = (apiKey: string) => {
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
  };

  const formatBalance = (value: number) => {
    if (value < 0.00000001) return '0';
    if (value < 0.0001) return value.toFixed(8);
    if (value < 1) return value.toFixed(6);
    return value.toFixed(2);
  };

  if (credentials.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Exchange Balances
      </h2>
      <div className="space-y-4">
        {credentials.map((cred) => {
          const balance = exchangeBalances.find(b => b.exchange === cred.exchange);
          const isLoading = isLoadingBalances[cred.exchange];
          
          return (
            <div key={cred.exchange} className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold capitalize text-gray-900 dark:text-white">
                    {cred.exchange}
                  </h3>
                  <a
                    href={`https://${cred.exchange}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRefreshBalance(cred.exchange)}
                    className={`text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 p-1 
                              ${isLoading ? 'animate-spin' : ''}`}
                    title="Refresh balance"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveExchange(cred.exchange)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 p-1"
                    title="Remove exchange"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                API Key: {maskApiKey(cred.apiKey)}
              </div>
              
              {isLoading ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Fetching balances...
                </div>
              ) : balance ? (
                <div className="space-y-2">
                  {balance.balances.length > 0 ? (
                    balance.balances.map((b) => (
                      <div key={b.asset} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{b.asset}</span>
                        <div className="text-right">
                          <div className="text-gray-900 dark:text-white">
                            Available: {formatBalance(b.free)}
                          </div>
                          {b.locked > 0 && (
                            <div className="text-gray-500 dark:text-gray-400">
                              Locked: {formatBalance(b.locked)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No balance found. Make sure you have funds in your account.
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Last updated: {new Date(balance.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Failed to fetch balances. Click refresh to try again.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};