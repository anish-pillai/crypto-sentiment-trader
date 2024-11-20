import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { TradingModeSelector } from './components/TradingModeSelector';
import { SentimentDisplay } from './components/SentimentDisplay';
import { TradingStats } from './components/TradingStats';
import { ExchangeBalances } from './components/ExchangeBalances';
import { BacktestForm } from './components/BacktestForm';
import { TradingSignals } from './components/TradingSignals';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { TradeHistory } from './components/TradeHistory';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { TradeForm } from './components/TradeForm';
import { AddExchange } from './components/AddExchange';

function App() {
  const { isDarkMode, tradingMode } = useStore();
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showAddExchange, setShowAddExchange] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
      <Toaster
        position='top-right'
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          },
        }}
      />
      <Header onSettingsClick={() => setShowConfigPanel(true)} />

      <main className='container mx-auto px-4 py-8'>
        {showConfigPanel ? (
          <ConfigurationPanel onClose={() => setShowConfigPanel(false)} />
        ) : showAddExchange ? (
          <AddExchange onClose={() => setShowAddExchange(false)} />
        ) : (
          <>
            <div className='mb-8'>
              <TradingModeSelector />
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2 space-y-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                      Place a Trade
                    </h2>
                    <TradeForm />
                  </div>
                  <SentimentDisplay />
                </div>
                <TradingSignals />
                {tradingMode === 'backtest' && <BacktestForm />}
                <TradeHistory />
              </div>
              <div className='space-y-8'>
                <TradingStats />
                <div className='flex justify-between items-center'>
                  <ExchangeBalances
                    onAddExchange={() => setShowAddExchange(true)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
