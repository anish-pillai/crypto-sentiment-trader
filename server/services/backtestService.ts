import { SentimentData, TradingSignal, TradingPosition } from '../types/api';
import { tradingSignalService } from './tradingSignalService';
import NodeCache from 'node-cache';

interface BacktestResult {
  positions: TradingPosition[];
  totalTrades: number;
  profitLoss: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class BacktestService {
  private cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
  private readonly INITIAL_BALANCE = 10000; // $10,000 USD

  async runBacktest(
    symbol: string,
    startDate: Date,
    endDate: Date,
    sentimentData: SentimentData[]
  ): Promise<BacktestResult> {
    const cacheKey = `backtest:${symbol}:${startDate.getTime()}:${endDate.getTime()}`;
    const cached = this.cache.get<BacktestResult>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch historical price data
      const priceData = await this.fetchHistoricalData(symbol, startDate, endDate);
      
      // Initialize tracking variables
      let balance = this.INITIAL_BALANCE;
      let positions: TradingPosition[] = [];
      let trades: TradingPosition[] = [];
      let maxDrawdown = 0;
      let peakBalance = balance;

      // Run simulation
      for (let i = 0; i < priceData.length; i++) {
        const currentPrice = priceData[i];
        const currentSentiment = this.interpolateSentiment(sentimentData, currentPrice.timestamp);

        // Generate trading signal
        const signal = await tradingSignalService.generateSignals(currentSentiment, symbol);

        // Execute trades based on signal
        if (this.shouldOpenPosition(signal, positions)) {
          const position = await this.simulateOpenPosition(
            symbol,
            currentPrice.close,
            balance,
            currentPrice.timestamp
          );
          
          if (position) {
            positions.push(position);
            balance -= position.size * currentPrice.close;
          }
        }

        // Check stop-loss and take-profit for open positions
        positions = await this.updatePositions(positions, currentPrice, trades);
        
        // Update maximum drawdown
        const currentBalance = this.calculateTotalValue(balance, positions, currentPrice.close);
        if (currentBalance > peakBalance) {
          peakBalance = currentBalance;
        }
        const drawdown = (peakBalance - currentBalance) / peakBalance;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }

      // Calculate final results
      const result: BacktestResult = {
        positions: trades,
        totalTrades: trades.length,
        profitLoss: balance - this.INITIAL_BALANCE,
        winRate: this.calculateWinRate(trades),
        maxDrawdown,
        sharpeRatio: this.calculateSharpeRatio(trades, this.INITIAL_BALANCE)
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Backtest error:', error);
      throw new Error('Failed to run backtest');
    }
  }

  private async fetchHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<PriceData[]> {
    // Implement historical data fetching from your preferred source
    // For example, using CCXT or a market data provider
    throw new Error('Method not implemented');
  }

  private interpolateSentiment(
    sentimentData: SentimentData[],
    timestamp: number
  ): SentimentData {
    // Find closest sentiment data point
    const closest = sentimentData.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.lastUpdated).getTime() - timestamp);
      const currDiff = Math.abs(new Date(curr.lastUpdated).getTime() - timestamp);
      return prevDiff < currDiff ? prev : curr;
    });

    return closest;
  }

  private shouldOpenPosition(signal: TradingSignal, positions: TradingPosition[]): boolean {
    return (
      positions.length === 0 &&
      (signal.signal === 'strong_buy' || signal.signal === 'buy') &&
      signal.confidence >= 0.7
    );
  }

  private async simulateOpenPosition(
    symbol: string,
    price: number,
    balance: number,
    timestamp: number
  ): Promise<TradingPosition | null> {
    const positionSize = Math.min(balance * 0.1, balance); // Max 10% of balance
    
    if (positionSize < 10) { // Minimum position size $10
      return null;
    }

    return {
      id: `sim_${Date.now()}`,
      symbol,
      type: 'long',
      entryPrice: price,
      size: positionSize / price,
      stopLoss: price * 0.98, // 2% stop loss
      takeProfit: price * 1.05, // 5% take profit
      status: 'open',
      openTime: new Date(timestamp).toISOString()
    };
  }

  private async updatePositions(
    positions: TradingPosition[],
    currentPrice: PriceData,
    trades: TradingPosition[]
  ): Promise<TradingPosition[]> {
    const updatedPositions: TradingPosition[] = [];

    for (const position of positions) {
      if (position.status === 'closed') continue;

      // Check stop-loss
      if (currentPrice.low <= position.stopLoss!) {
        position.status = 'closed';
        position.exitPrice = position.stopLoss;
        position.closeTime = new Date(currentPrice.timestamp).toISOString();
        trades.push(position);
        continue;
      }

      // Check take-profit
      if (currentPrice.high >= position.takeProfit!) {
        position.status = 'closed';
        position.exitPrice = position.takeProfit;
        position.closeTime = new Date(currentPrice.timestamp).toISOString();
        trades.push(position);
        continue;
      }

      updatedPositions.push(position);
    }

    return updatedPositions;
  }

  private calculateTotalValue(
    balance: number,
    positions: TradingPosition[],
    currentPrice: number
  ): number {
    const positionsValue = positions.reduce(
      (sum, pos) => sum + pos.size * currentPrice,
      0
    );
    return balance + positionsValue;
  }

  private calculateWinRate(trades: TradingPosition[]): number {
    if (trades.length === 0) return 0;
    
    const winningTrades = trades.filter(trade => {
      if (!trade.exitPrice || !trade.entryPrice) return false;
      return trade.exitPrice > trade.entryPrice;
    });

    return (winningTrades.length / trades.length) * 100;
  }

  private calculateSharpeRatio(trades: TradingPosition[], initialBalance: number): number {
    if (trades.length < 2) return 0;

    const returns = trades.map(trade => {
      if (!trade.exitPrice || !trade.entryPrice) return 0;
      return (trade.exitPrice - trade.entryPrice) / trade.entryPrice;
    });

    const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) /
        (returns.length - 1)
    );

    const riskFreeRate = 0.02; // Assume 2% risk-free rate
    return (averageReturn - riskFreeRate) / stdDev;
  }
}

export const backtestService = new BacktestService();