import * as ccxt from 'ccxt';
import { exchangeService } from './exchangeService';
import { tradingSignalService } from './tradingSignalService';
import { TradingPosition, SignalStrength, RiskParameters } from '../types/api';
import { ExchangeApi } from '../api/exchangeApi';

class TradingService {
  private readonly DEFAULT_RISK_PARAMS: RiskParameters = {
    maxPositionSize: 0.1, // 10% of available balance
    stopLossPercentage: 0.02, // 2% stop loss
    takeProfitPercentage: 0.05, // 5% take profit
    maxOpenPositions: 3,
    minimumConfidence: 0.7,
  };

  private exchangeApi: ExchangeApi;

  constructor() {
    // Ensure the exchangeId is valid
    const exchangeId = 'binance'; // Example exchangeId, replace with actual value
    const apiKey = 'your_api_key'; // Replace with actual API key
    const secret = 'your_secret'; // Replace with actual secret

    this.exchangeApi = new ExchangeApi(exchangeId, apiKey, secret);
  }

  async executeTrade(
    userId: string,
    exchange: string,
    symbol: string,
    signal: SignalStrength,
    confidence: number,
    currentPrice: number
  ): Promise<TradingPosition | null> {
    try {
      if (confidence < this.DEFAULT_RISK_PARAMS.minimumConfidence) {
        console.log('Signal confidence too low for trade execution');
        return null;
      }

      const client = await exchangeService.getExchangeClient(userId, exchange);
      if (!client) throw new Error('Exchange not connected');

      // Check existing positions
      const openPositions = await this.getOpenPositions(userId, exchange);
      if (openPositions.length >= this.DEFAULT_RISK_PARAMS.maxOpenPositions) {
        console.log('Maximum open positions reached');
        return null;
      }

      // Calculate position size
      const balance = await this.getAvailableBalance(client, symbol);
      const positionSize = this.calculatePositionSize(balance, currentPrice);

      // Execute trade based on signal
      if (signal.includes('buy')) {
        return await this.openLongPosition(
          client,
          symbol,
          positionSize,
          currentPrice
        );
      } else if (signal.includes('sell')) {
        return await this.closeLongPosition(
          client,
          symbol,
          positionSize,
          currentPrice
        );
      }

      return null;
    } catch (error) {
      console.error('Trade execution error:', error);
      throw new Error('Failed to execute trade');
    }
  }

  private async openLongPosition(
    client: ccxt.Exchange,
    symbol: string,
    size: number,
    price: number
  ): Promise<TradingPosition> {
    // Place market buy order
    const buyOrder = await client.createOrder(symbol, 'market', 'buy', size);

    // Calculate stop loss and take profit levels
    const stopLossPrice =
      price * (1 - this.DEFAULT_RISK_PARAMS.stopLossPercentage);
    const takeProfitPrice =
      price * (1 + this.DEFAULT_RISK_PARAMS.takeProfitPercentage);

    // Place stop loss order
    const stopLossOrder = await client.createOrder(
      symbol,
      'stop_loss',
      'sell',
      size,
      undefined,
      { stopPrice: stopLossPrice }
    );

    // Place take profit order
    const takeProfitOrder = await client.createOrder(
      symbol,
      'take_profit',
      'sell',
      size,
      undefined,
      { stopPrice: takeProfitPrice }
    );

    return {
      id: buyOrder.id,
      symbol,
      type: 'long',
      entryPrice: price,
      size,
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      status: 'open',
      openTime: new Date().toISOString(),
      orders: {
        entry: buyOrder.id,
        stopLoss: stopLossOrder.id,
        takeProfit: takeProfitOrder.id,
      },
    };
  }

  private async closeLongPosition(
    client: ccxt.Exchange,
    symbol: string,
    size: number,
    currentPrice: number
  ): Promise<TradingPosition> {
    // Cancel any existing stop loss and take profit orders
    const openOrders = await client.fetchOpenOrders(symbol);
    for (const order of openOrders) {
      await client.cancelOrder(order.id, symbol);
    }

    // Place market sell order
    const sellOrder = await client.createOrder(symbol, 'market', 'sell', size);

    return {
      id: sellOrder.id,
      symbol,
      type: 'close',
      exitPrice: currentPrice,
      size,
      status: 'closed',
      closeTime: new Date().toISOString(),
      orders: {
        exit: sellOrder.id,
      },
    };
  }

  private calculatePositionSize(balance: number, currentPrice: number): number {
    const maxPosition = balance * this.DEFAULT_RISK_PARAMS.maxPositionSize;
    return Math.min(maxPosition / currentPrice, balance / currentPrice);
  }

  private async getAvailableBalance(
    client: ccxt.Exchange,
    symbol: string
  ): Promise<number> {
    const balance = await client.fetchBalance();
    const asset = symbol.split('/')[1]; // Get quote currency (USDT in BTC/USDT)
    return balance.free[asset] || 0;
  }

  async getOpenPositions(
    userId: string,
    exchange: string
  ): Promise<TradingPosition[]> {
    try {
      const client = await exchangeService.getExchangeClient(userId, exchange);
      if (!client) throw new Error('Exchange not connected');

      const positions = await client.fetchPositions();
      return positions
        .filter((pos) => pos.contracts > 0)
        .map((pos) => ({
          id: pos.id,
          symbol: pos.symbol,
          type: 'long',
          entryPrice: pos.entryPrice,
          size: pos.contracts,
          status: 'open',
          openTime: new Date(pos.timestamp).toISOString(),
          unrealizedPnl: pos.unrealizedPnl,
        }));
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  async monitorPositions(userId: string, exchange: string): Promise<void> {
    try {
      const positions = await this.getOpenPositions(userId, exchange);

      for (const position of positions) {
        const currentPrice = await tradingSignalService.getCurrentPrice(
          position.symbol
        );

        // Check stop loss
        if (currentPrice <= position.stopLoss!) {
          await this.closeLongPosition(
            await exchangeService.getExchangeClient(userId, exchange)!,
            position.symbol,
            position.size,
            currentPrice
          );
          console.log(`Stop loss triggered for position ${position.id}`);
        }

        // Check take profit
        if (currentPrice >= position.takeProfit!) {
          await this.closeLongPosition(
            await exchangeService.getExchangeClient(userId, exchange)!,
            position.symbol,
            position.size,
            currentPrice
          );
          console.log(`Take profit triggered for position ${position.id}`);
        }
      }
    } catch (error) {
      console.error('Error monitoring positions:', error);
    }
  }

  async placeTrade(symbol: string, amount: number, side: 'buy' | 'sell') {
    try {
      const order = await this.exchangeApi.createOrder(symbol, amount, side);
      return order;
    } catch (error) {
      console.error('Error placing trade:', error);
      throw new Error('Failed to place trade');
    }
  }
}

export const tradingService = new TradingService();
