import * as ccxt from 'ccxt';
import { ExchangeCredentials, ExchangeBalance, Balance } from '../types/api';

export class ExchangeService {
  private static exchanges: Record<string, ccxt.Exchange> = {};

  static async connectExchange(credentials: ExchangeCredentials): Promise<void> {
    try {
      const ExchangeClass = (ccxt as any)[credentials.exchange];
      if (!ExchangeClass) {
        throw new Error(`Exchange ${credentials.exchange} not supported`);
      }

      const exchange = new ExchangeClass({
        apiKey: credentials.apiKey,
        secret: credentials.apiSecret,
        enableRateLimit: true,
        options: {
          defaultType: 'spot'
        }
      });

      // Test the connection by fetching balances
      await exchange.loadMarkets();
      await exchange.fetchBalance();
      
      this.exchanges[credentials.exchange] = exchange;
    } catch (error) {
      console.error('Failed to connect to exchange:', error);
      throw new Error('Failed to connect to exchange. Please check your credentials.');
    }
  }

  static async getBalances(exchange: string): Promise<ExchangeBalance> {
    try {
      const client = this.exchanges[exchange];
      if (!client) {
        throw new Error(`Exchange ${exchange} not connected`);
      }

      const balanceData = await client.fetchBalance();
      const balances: Balance[] = Object.entries(balanceData.total)
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
      throw new Error('Failed to fetch balances. Please try again.');
    }
  }

  static disconnectExchange(exchange: string): void {
    delete this.exchanges[exchange];
  }
}