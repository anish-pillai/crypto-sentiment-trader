import * as ccxt from 'ccxt';
import { ExchangeCredentials, ExchangeBalance } from '../types/api';

class ExchangeService {
  private exchanges: Map<string, ccxt.Exchange> = new Map();

  async connectExchange(
    userId: string,
    credentials: ExchangeCredentials
  ): Promise<void> {
    try {
      // Validate credentials
      if (!credentials.apiKey || !credentials.apiSecret) {
        throw new Error('API key and secret are required');
      }

      // Handle Binance.US specifically
      const exchangeId =
        credentials.exchange.toLowerCase() === 'binance'
          ? 'binanceus'
          : credentials.exchange;
      const ExchangeClass = (ccxt as any)[exchangeId];

      if (!ExchangeClass) {
        throw new Error(`Exchange ${credentials.exchange} not supported`);
      }

      // Initialize exchange with proper configuration
      const exchange = new ExchangeClass({
        apiKey: credentials.apiKey,
        secret: credentials.apiSecret,
        enableRateLimit: true,
        timeout: 30000,
        options: {
          defaultType: 'spot',
          adjustForTimeDifference: true,
          recvWindow: 60000,
          defaultTimeInForce: 'GTC',
          warnOnFetchOHLCVLimitArgument: false,
        },
        headers: {
          'User-Agent': 'crypto-sentiment-trader/1.0',
        },
      });

      // Test connection with basic API call
      try {
        // First try public API
        await exchange.loadMarkets();

        // Then try authenticated API with error handling
        try {
          const balance = await exchange.fetchBalance();
          if (!balance) {
            throw new Error('Unable to fetch balance');
          }
        } catch (error: any) {
          if (
            error.message.includes('location') ||
            error.message.includes('region')
          ) {
            throw new Error(
              'Authentication failed. Please check your API credentials and permissions.'
            );
          }
          if (
            error.message.includes('key') ||
            error.message.includes('signature')
          ) {
            throw new Error(
              'Invalid API credentials. Please check your API key and secret.'
            );
          }
          if (
            error.message.includes('permission') ||
            error.message.includes('authorized')
          ) {
            throw new Error(
              'Insufficient API permissions. Please check your API key settings.'
            );
          }
          if (error instanceof ccxt.ExchangeNotAvailable) {
            throw new Error(
              'Exchange is temporarily unavailable. Please try again later.'
            );
          }
          if (error instanceof ccxt.DDoSProtection) {
            throw new Error(
              'Rate limit exceeded. Please try again in a few minutes.'
            );
          }
          if (error instanceof ccxt.AuthenticationError) {
            throw new Error(
              'Authentication failed. Please check your API credentials.'
            );
          }
          if (error instanceof ccxt.NetworkError) {
            throw new Error(
              'Network error. Please check your internet connection.'
            );
          }
          throw new Error(`Exchange error: ${error.message}`);
        }

        const key = `${userId}:${credentials.exchange}`;
        this.exchanges.set(key, exchange);
      } catch (error: any) {
        console.error('Exchange connection test error:', error);
        throw this.handleExchangeError(error);
      }
    } catch (error: any) {
      console.error('Exchange connection error:', error);
      throw this.handleExchangeError(error);
    }
  }

  async getBalances(
    userId: string,
    exchange: string
  ): Promise<ExchangeBalance> {
    try {
      const key = `${userId}:${exchange}`;
      const client = this.exchanges.get(key);
      if (!client) {
        throw new Error('Exchange not connected');
      }

      const balanceData = await client.fetchBalance();
      const balances = Object.entries(balanceData.total)
        .filter(([_, value]) => value > 0)
        .map(([asset, total]) => ({
          asset,
          free: balanceData.free[asset] || 0,
          locked: (balanceData.used && balanceData.used[asset]) || 0,
          total,
        }));

      return {
        exchange,
        balances,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      throw this.handleExchangeError(error);
    }
  }

  private handleExchangeError(error: any): Error {
    if (
      error.message.includes('location') ||
      error.message.includes('region')
    ) {
      return new Error(
        'Authentication failed. Please check your API credentials and permissions.'
      );
    }
    if (error.message.includes('key') || error.message.includes('signature')) {
      return new Error(
        'Invalid API credentials. Please check your API key and secret.'
      );
    }
    if (
      error.message.includes('permission') ||
      error.message.includes('authorized')
    ) {
      return new Error(
        'Insufficient API permissions. Please check your API key settings.'
      );
    }
    if (error instanceof ccxt.ExchangeNotAvailable) {
      return new Error(
        'Exchange is temporarily unavailable. Please try again later.'
      );
    }
    if (error instanceof ccxt.DDoSProtection) {
      return new Error(
        'Rate limit exceeded. Please try again in a few minutes.'
      );
    }
    if (error instanceof ccxt.AuthenticationError) {
      return new Error(
        'Authentication failed. Please check your API credentials.'
      );
    }
    if (error instanceof ccxt.NetworkError) {
      return new Error('Network error. Please check your internet connection.');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }

  getExchangeClient(
    userId: string,
    exchange: string
  ): ccxt.Exchange | undefined {
    const key = `${userId}:${exchange}`;
    return this.exchanges.get(key);
  }

  disconnectExchange(userId: string, exchange: string): void {
    const key = `${userId}:${exchange}`;
    this.exchanges.delete(key);
  }
}

export const exchangeService = new ExchangeService();
