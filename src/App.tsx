import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { TradingModeSelector } from './components/TradingModeSelector';
import { ApiKeyForm } from './components/ApiKeyForm';
import { SentimentDisplay } from './components/SentimentDisplay';
import { TradingStats } from './components/TradingStats';
import { ExchangeBalances } from './components/ExchangeBalances';
import { BacktestForm } from './components/BacktestForm';
import { TradingSignals } from './components/TradingSignals';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { TradeHistory } from './components/TradeHistory';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';

function App() {
  const { isDarkMode, tradingMode } = useStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          }
        }}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <TradingModeSelector />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TradingStats />
            <TradingSignals />
            {tradingMode === 'backtest' ? (
              <BacktestForm />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1000&q=80"
                  alt="Crypto Trading"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tradingMode === 'live' ? 'Live Trading' : 'Paper Trading'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {tradingMode === 'live' 
                      ? 'Trade with real funds using exchange API integration.'
                      : 'Practice trading with virtual funds in a risk-free environment.'}
                  </p>
                </div>
              </div>
            )}
            <TradeHistory />
            <ConfigurationPanel />
          </div>
          
          <div className="space-y-8">
            {tradingMode === 'live' && <ApiKeyForm />}
            <ExchangeBalances />
            <SentimentDisplay />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;