import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ExchangeCredentials,
  SentimentData,
  TradingStats,
  ExchangeBalance,
  BacktestResult,
  TradingPosition,
} from '../types/api';
import { TradingSignal } from '../types/trading';
import { TradingConfig, defaultConfig } from '../config/trading';
import {
  exchangeApi,
  configApi,
  backtestApi,
  tradingApi,
} from '../services/api';

interface Store {
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  tradingMode: 'live' | 'paper' | 'backtest';
  setTradingMode: (mode: 'live' | 'paper' | 'backtest') => void;

  credentials: ExchangeCredentials[];
  addCredentials: (cred: ExchangeCredentials) => Promise<void>;
  removeCredentials: (exchange: string) => Promise<void>;

  exchangeBalances: ExchangeBalance[];
  isLoadingBalances: Record<string, boolean>;
  updateBalances: (exchange: string) => Promise<void>;

  positions: TradingPosition[];
  fetchPositions: (exchange: string) => Promise<void>;

  sentimentData: SentimentData;
  tradingStats: TradingStats;
  tradingSignal: TradingSignal | null;
  backtestResults: BacktestResult | null;

  config: TradingConfig;
  updateConfig: (config: TradingConfig) => Promise<void>;
  runBacktest: (
    symbol: string,
    startDate: Date,
    endDate: Date
  ) => Promise<void>;
}

const initialSentimentData: SentimentData = {
  score: 0,
  trend: 'neutral',
  lastUpdated: new Date().toISOString(),
  sources: {
    twitter: 0,
    reddit: 0,
  },
};

const initialTradingStats: TradingStats = {
  totalTrades: 0,
  successRate: 0,
  profitLoss: 0,
  activePositions: 0,
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      tradingMode: 'paper',
      setTradingMode: (mode) => set({ tradingMode: mode }),

      credentials: [],
      addCredentials: async (cred) => {
        await exchangeApi.connectExchange(cred);
        set((state) => ({
          credentials: [...state.credentials, cred],
        }));
      },
      removeCredentials: async (exchange) => {
        await exchangeApi.disconnectExchange(exchange);
        set((state) => ({
          credentials: state.credentials.filter((c) => c.exchange !== exchange),
        }));
      },

      exchangeBalances: [],
      isLoadingBalances: {},
      updateBalances: async (exchange) => {
        set((state) => ({
          isLoadingBalances: { ...state.isLoadingBalances, [exchange]: true },
        }));
        try {
          const balance = await exchangeApi.getBalances(exchange);
          set((state) => ({
            exchangeBalances: [
              ...state.exchangeBalances.filter((b) => b.exchange !== exchange),
              balance,
            ],
            isLoadingBalances: {
              ...state.isLoadingBalances,
              [exchange]: false,
            },
          }));
        } catch (error) {
          set((state) => ({
            isLoadingBalances: {
              ...state.isLoadingBalances,
              [exchange]: false,
            },
          }));
          throw error;
        }
      },

      positions: [],
      fetchPositions: async (exchange) => {
        const positions = await tradingApi.getPositions(exchange);
        set({ positions });
      },

      sentimentData: initialSentimentData,
      tradingStats: initialTradingStats,
      tradingSignal: null,
      backtestResults: null,

      config: defaultConfig,
      updateConfig: async (config: TradingConfig) => {
        await configApi.updateConfig(config);
        set({ config });
      },

      runBacktest: async (symbol: string, startDate: Date, endDate: Date) => {
        const results = await backtestApi.runBacktest({
          symbol,
          startDate,
          endDate,
        });
        set({ backtestResults: results });
      },
    }),
    {
      name: 'crypto-trader-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        credentials: state.credentials,
        tradingMode: state.tradingMode,
        config: state.config,
      }),
    }
  )
);
