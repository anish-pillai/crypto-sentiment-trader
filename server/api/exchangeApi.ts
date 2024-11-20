import * as ccxt from 'ccxt';

export class ExchangeApi {
  private exchange: ccxt.Exchange;

  constructor(exchangeId: string, apiKey: string, secret: string) {
    if (!(exchangeId in ccxt)) {
      throw new Error(`Exchange ${exchangeId} is not supported`);
    }

    this.exchange = new ccxt[exchangeId]({
      apiKey,
      secret,
    });
  }

  async createOrder(symbol: string, amount: number, side: 'buy' | 'sell') {
    try {
      const order = await this.exchange.createOrder(
        symbol,
        'market',
        side,
        amount
      );
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async fetchBalance() {
    try {
      const balance = await this.exchange.fetchBalance();
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async fetchOpenOrders(symbol: string) {
    try {
      const orders = await this.exchange.fetchOpenOrders(symbol);
      return orders;
    } catch (error) {
      console.error('Error fetching open orders:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string) {
    try {
      const result = await this.exchange.cancelOrder(orderId, symbol);
      return result;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }
}
