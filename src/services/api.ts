import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  ExchangeCredentials,
  ExchangeBalance,
  SentimentData,
  BacktestResult,
  TradingPosition,
} from '../types/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Initialize session synchronously
const getOrCreateSession = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${uuidv4()}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Add session ID to all requests
apiClient.interceptors.request.use((config) => {
  config.headers['x-session-id'] = getOrCreateSession();
  return config;
});

// Handle session errors without infinite loop
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest.headers['x-session-id'] = getOrCreateSession();
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Clear existing session
        localStorage.removeItem('sessionId');
        // Create new session
        const newSessionId = getOrCreateSession();

        // Process queue with new token
        processQueue(null, newSessionId);

        // Retry original request
        originalRequest.headers['x-session-id'] = newSessionId;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const exchangeApi = {
  connectExchange: async (credentials: ExchangeCredentials) => {
    try {
      const { data } = await apiClient.post('/exchange/connect', credentials);
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to connect to exchange';
      throw new Error(errorMessage);
    }
  },

  getBalances: async (exchange: string): Promise<ExchangeBalance> => {
    try {
      const { data } = await apiClient.get(`/exchange/balances/${exchange}`);
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch balances';
      throw new Error(errorMessage);
    }
  },

  disconnectExchange: async (exchange: string) => {
    try {
      const { data } = await apiClient.delete(`/exchange/${exchange}`);
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to disconnect exchange';
      throw new Error(errorMessage);
    }
  },
};

export const sentimentApi = {
  getSentiment: async (): Promise<SentimentData> => {
    try {
      const { data } = await apiClient.get('/sentiment');
      return data;
    } catch (error: any) {
      throw new Error('Failed to fetch sentiment data');
    }
  },
};

export const backtestApi = {
  runBacktest: async (params: {
    symbol: string;
    startDate: Date;
    endDate: Date;
  }): Promise<BacktestResult> => {
    try {
      const { data } = await apiClient.post('/backtest/run', params);
      return data;
    } catch (error: any) {
      throw new Error('Failed to run backtest');
    }
  },
};

export const tradingApi = {
  getPositions: async (exchange: string): Promise<TradingPosition[]> => {
    try {
      const { data } = await apiClient.get(`/trading/positions/${exchange}`);
      return data;
    } catch (error: any) {
      throw new Error('Failed to fetch positions');
    }
  },
};

export const configApi = {
  updateConfig: async (config: any) => {
    try {
      const { data } = await apiClient.post('/config', config);
      return data;
    } catch (error: any) {
      throw new Error('Failed to update configuration');
    }
  },
};
